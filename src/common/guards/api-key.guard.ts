import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectsService } from '../../projects/projects.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKeyFromHeader(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key not found');
    }

    // Validate API key and get associated project
    const project = await this.projectsService.validateApiKey(apiKey);

    if (!project) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Set user and project in request context
    request.user = project.user;
    request.project = project;
    request.apiKey = apiKey;

    return true;
  }

  private extractApiKeyFromHeader(request: any): string | undefined {
    return (
      request.headers['x-api-key'] ||
      request.headers['api-key'] ||
      request.query?.apiKey
    );
  }
}

