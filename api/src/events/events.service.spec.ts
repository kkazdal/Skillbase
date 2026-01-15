import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/project.entity';
import { Event } from './event.entity';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let repo: Repository<Event>;

  const repoMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = moduleRef.get(EventsService);
    repo = moduleRef.get(getRepositoryToken(Event));

    jest.clearAllMocks();
  });

  it('createEvent should create and save event', async () => {
    const project = { id: 'proj-1' } as Project;
    const created = { id: 'evt-1' } as Event;

    repoMock.create.mockReturnValue(created);
    repoMock.save.mockResolvedValue(created);

    const res = await service.createEvent(
      project,
      'user-123',
      'level_completed',
      10,
      { foo: 'bar' },
    );

    expect(repoMock.create).toHaveBeenCalledWith({
      projectId: 'proj-1',
      userId: 'user-123',
      name: 'level_completed',
      value: 10,
      metadata: { foo: 'bar' },
    });
    expect(repoMock.save).toHaveBeenCalledWith(created);
    expect(res).toBe(created);
  });

  it('findEvents should filter by projectId (and userId when provided)', async () => {
    const project = { id: 'proj-1' } as Project;
    const events: Event[] = [{ id: 'evt-1' } as Event];

    repoMock.find.mockResolvedValue(events);

    await service.findEvents(project);
    expect(repoMock.find).toHaveBeenCalledWith({
      where: { projectId: 'proj-1' },
      order: { createdAt: 'DESC' },
    });

    await service.findEvents(project, 'user-123');
    expect(repoMock.find).toHaveBeenCalledWith({
      where: { projectId: 'proj-1', userId: 'user-123' },
      order: { createdAt: 'DESC' },
    });
  });
});


