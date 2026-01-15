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
    // validateApiKey checks expiration internally and returns null if expired
    const project = await this.projectsService.validateApiKey(apiKey);

    if (!project) {
      // Could be invalid key or expired key - validateApiKey handles both
      // Check if key format is valid to provide more specific error
      const parts = apiKey.split('_');
      const isValidFormat = parts.length >= 4 && parts[0] === 'skb';
      
      if (isValidFormat) {
        // Format is valid but project is null - likely expired
        throw new UnauthorizedException('API key has expired');
      }
      
      throw new UnauthorizedException('Invalid API key');
    }

    // Set user and project in request context
    request.user = project.user;
    request.project = project;
    request.apiKey = apiKey;

    return true;
  }

  private extractApiKeyFromHeader(request: any): string | undefined {
    // Preferred: Authorization: Bearer <API_KEY>
    const authHeader: string | undefined = request.headers?.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) return token;
    }

    // Backward compatible fallbacks (keep existing behavior)
    return request.headers?.['x-api-key'] || request.headers?.['api-key'] || request.query?.apiKey;
  }
}

