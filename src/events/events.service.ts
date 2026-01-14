import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Event } from './event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async createEvent(
    project: Project,
    userId: string,
    name: string,
    value?: number,
    metadata?: any,
  ): Promise<Event> {
    const event = this.eventsRepository.create({
      projectId: project.id,
      userId,
      name,
      value: value ?? null,
      metadata: metadata ?? null,
    });

    return this.eventsRepository.save(event);
  }

  async findEvents(project: Project, userId?: string): Promise<Event[]> {
    const where: Record<string, any> = { projectId: project.id };
    if (userId) where.userId = userId;

    return this.eventsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }
}


