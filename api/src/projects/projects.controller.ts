import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { ReqContext } from '../common/decorators/request-context.decorator';
import { RequestContext } from '../common/interfaces/request-context.interface';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() body: { name: string; description?: string },
  ) {
    return this.projectsService.create(ctx.user!, body.name, body.description);
  }

  @Get()
  async findAll(@ReqContext() ctx: RequestContext) {
    return this.projectsService.findAll(ctx.user!.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ReqContext() ctx: RequestContext,
  ) {
    return this.projectsService.findOne(id, ctx.user!.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @ReqContext() ctx: RequestContext,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.projectsService.update(
      id,
      ctx.user!.id,
      body.name,
      body.description,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @ReqContext() ctx: RequestContext,
  ) {
    await this.projectsService.remove(id, ctx.user!.id);
    return { message: 'Project deleted successfully' };
  }

  @Post(':id/regenerate-api-key')
  async regenerateApiKey(
    @Param('id') id: string,
    @ReqContext() ctx: RequestContext,
  ) {
    return this.projectsService.regenerateApiKey(id, ctx.user!.id);
  }
}

