import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { generateApiKey } from '../common/utils/generate-api-key';
import { hashApiKey, compareApiKey } from '../common/utils/hash-api-key';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(
    user: User,
    name: string,
    description?: string,
  ): Promise<{ project: Project; apiKey: string }> {
    // Generate API key with new format: skb_live_<keyId>_<secret>
    const { keyId, secret, fullKey } = generateApiKey();
    const apiKeyHash = await hashApiKey(secret);

    const project = this.projectsRepository.create({
      name,
      description,
      userId: user.id,
      apiKeyId: keyId,
      apiKeyHash,
    });

    const savedProject = await this.projectsRepository.save(project);

    return {
      project: savedProject,
      apiKey: fullKey, // Return plain API key only once during creation
    };
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { userId },
      relations: ['user'],
    });
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(
    id: string,
    userId: string,
    name?: string,
    description?: string,
  ): Promise<Project> {
    const project = await this.findOne(id, userId);

    if (name) {
      project.name = name;
    }
    if (description !== undefined) {
      project.description = description;
    }

    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id, userId);
    await this.projectsRepository.remove(project);
  }

  async findByApiKeyId(apiKeyId: string): Promise<Project | null> {
    return this.projectsRepository.findOne({
      where: { apiKeyId },
      relations: ['user'],
    });
  }

  /**
   * Validate API key and return the associated project
   * 
   * ⚡ O(1) LOOKUP - Stripe/Supabase-level performance
   * 
   * API Key Format: skb_<env>_<keyId>_<secret>
   * Supported environments: 'live' | 'test'
   * 
   * Process:
   * 1. Parse API key to extract environment, keyId and secret
   * 2. Validate environment (live/test)
   * 3. Lookup project by keyId (indexed, O(1))
   * 4. Compare secret hash (single bcrypt compare)
   * 
   * Performance:
   * - ✅ 1 database query (indexed lookup)
   * - ✅ 1 bcrypt compare
   * - ✅ Scales to millions of projects
   * - ✅ Stripe/Supabase-level architecture
   */
  async validateApiKey(apiKey: string): Promise<Project | null> {
    // Parse API key format: skb_<env>_<keyId>_<secret>
    const parts = apiKey.split('_');
    
    // Validate format: should have at least 4 parts (skb, env, keyId, secret)
    if (parts.length < 4 || parts[0] !== 'skb') {
      return null;
    }

    // Validate environment (live | test)
    const environment = parts[1];
    const supportedEnvironments: Array<'live' | 'test'> = ['live', 'test'];
    
    if (!supportedEnvironments.includes(environment as 'live' | 'test')) {
      return null;
    }

    const keyId = parts[2];
    const secret = parts.slice(3).join('_'); // Handle secret that might contain underscores

    if (!keyId || !secret) {
      return null;
    }

    // O(1) lookup by indexed keyId
    const project = await this.projectsRepository.findOne({
      where: { apiKeyId: keyId },
      relations: ['user'],
    });

    if (!project || !project.apiKeyHash) {
      return null;
    }

    // Compare secret hash (single bcrypt compare)
    const isValid = await compareApiKey(secret, project.apiKeyHash);
    
    return isValid ? project : null;
  }

  async regenerateApiKey(
    projectId: string,
    userId: string,
  ): Promise<{ apiKey: string }> {
    const project = await this.findOne(projectId, userId);

    // Generate new API key with new format
    const { keyId, secret, fullKey } = generateApiKey();
    const apiKeyHash = await hashApiKey(secret);

    // Update both keyId and hash (old key is invalidated)
    project.apiKeyId = keyId;
    project.apiKeyHash = apiKeyHash;
    await this.projectsRepository.save(project);

    return { apiKey: fullKey }; // Return plain API key only once
  }
}

