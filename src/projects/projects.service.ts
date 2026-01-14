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
    const { fullKey } = generateApiKey();

    const project = this.projectsRepository.create({
      name,
      userId: user.id,
      apiKey: fullKey,
      environment: ProjectEnvironment.LIVE,
    });

    const savedProject = await this.projectsRepository.save(project);

    return {
      project: savedProject,
      apiKey: fullKey,
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

    return this.projectsRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id, userId);
    await this.projectsRepository.remove(project);
  }

  async findByApiKey(apiKey: string): Promise<Project | null> {
    return this.projectsRepository.findOne({
      where: { apiKey },
      relations: ['user'],
    });
  }

  async validateApiKey(apiKey: string): Promise<Project | null> {
    const parts = apiKey.split('_');
    
    if (parts.length < 4 || parts[0] !== 'skb') {
      return null;
    }

    const environment = parts[1];
    const supportedEnvironments: Array<'live' | 'test'> = ['live', 'test'];
    
    if (!supportedEnvironments.includes(environment as 'live' | 'test')) {
      return null;
    }

    const project = await this.projectsRepository.findOne({
      where: { apiKey },
      relations: ['user'],
    });
    
    return project;
  }

  async regenerateApiKey(
    projectId: string,
    userId: string,
  ): Promise<{ apiKey: string }> {
    const project = await this.findOne(projectId, userId);
    const { fullKey } = generateApiKey();
    project.apiKey = fullKey;
    await this.projectsRepository.save(project);
    return { apiKey: fullKey };
  }
}
