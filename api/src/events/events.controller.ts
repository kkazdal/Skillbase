import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { ReqContext } from '../common/decorators/request-context.decorator';
import { RequestContext } from '../common/interfaces/request-context.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('v1/events')
@UseGuards(ApiKeyGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@ReqContext() ctx: RequestContext, @Body() dto: CreateEventDto) {
    const event = await this.eventsService.createEvent(
      ctx.project!,
      dto.userId,
      dto.event,
      dto.value,
      dto.meta,
    );

    return { success: true, eventId: event.id };
  }

  @Get()
  async list(@ReqContext() ctx: RequestContext, @Query('userId') userId?: string) {
    return this.eventsService.findEvents(ctx.project!, userId);
  }
}


