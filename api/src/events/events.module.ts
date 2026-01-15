import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { ProjectsModule } from '../projects/projects.module';
import { Event } from './event.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), ProjectsModule],
  controllers: [EventsController],
  providers: [EventsService, ApiKeyGuard],
})
export class EventsModule {}


