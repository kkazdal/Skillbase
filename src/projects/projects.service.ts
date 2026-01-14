import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectEnvironment } from './project.entity';
import { User } from '../users/user.entity';
import { generateApiKey } from '../common/utils/generate-api-key';

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
    // Generate API key with format: skb_<env>_<keyId>_<secret>
    const { environment, fullKey } = generateApiKey();

    const project = this.projectsRepository.create({
      name,
      userId: user.id,
      apiKey: fullKey,
      environment: environment === 'test' ? ProjectEnvironment.TEST : ProjectEnvironment.LIVE,
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
    // NOTE: description is accepted for backward compatibility, but is not persisted
    // because `Project` entity does not have a `description` column.

    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id, userId);
    await this.projectsRepository.remove(project);
  }

  /**
   * Validate API key and return the associated project
   * 
   * API Key Format: skb_<env>_<keyId>_<secret>
   * Supported environments: 'live' | 'test'
   * 
   * Process:
   * 1. Parse API key to extract environment
   * 2. Validate environment (live/test)
   * 3. Lookup project by full apiKey (unique, indexed)
   * 
   * Performance:
   * - ✅ 1 database query (indexed lookup by apiKey)
   * - ✅ Scales to millions of projects
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

    // Lookup project by full apiKey
    return this.projectsRepository.findOne({
      where: { apiKey },
      relations: ['user'],
    });
  }

  async regenerateApiKey(
    projectId: string,
    userId: string,
  ): Promise<{ apiKey: string }> {
    const project = await this.findOne(projectId, userId);

    // Generate new API key with new format
    const { environment, fullKey } = generateApiKey();

    // Update apiKey (old key is invalidated)
    project.apiKey = fullKey;
    project.environment =
      environment === 'test' ? ProjectEnvironment.TEST : ProjectEnvironment.LIVE;
    await this.projectsRepository.save(project);

    return { apiKey: fullKey }; // Return plain API key only once
  }
}

