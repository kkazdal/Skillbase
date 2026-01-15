import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
  const eventsServiceMock: Partial<EventsService> = {
    createEvent: jest.fn(),
    findEvents: jest.fn(),
  };

  const controller = new EventsController(eventsServiceMock as EventsService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /v1/events returns { success: true, eventId }', async () => {
    (eventsServiceMock.createEvent as jest.Mock).mockResolvedValue({ id: 'evt-1' });

    const ctx: any = { project: { id: 'proj-1' } };
    const dto: any = { userId: 'u1', event: 'level_completed', value: 3, meta: { a: 1 } };

    const res = await controller.create(ctx, dto);

    expect(eventsServiceMock.createEvent).toHaveBeenCalledWith(
      ctx.project,
      'u1',
      'level_completed',
      3,
      { a: 1 },
    );
    expect(res).toEqual({ success: true, eventId: 'evt-1' });
  });

  it('GET /v1/events returns events list', async () => {
    (eventsServiceMock.findEvents as jest.Mock).mockResolvedValue([{ id: 'evt-1' }]);

    const ctx: any = { project: { id: 'proj-1' } };
    const res = await controller.list(ctx, 'u1');

    expect(eventsServiceMock.findEvents).toHaveBeenCalledWith(ctx.project, 'u1');
    expect(res).toEqual([{ id: 'evt-1' }]);
  });
});


