import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestContext } from '../interfaces/request-context.interface';

// This decorator is used to get the request context from the request object
export const ReqContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext => {
    const request = ctx.switchToHttp().getRequest();
    return {
      user: request.user,
      apiKey: request.apiKey,
    };
  },
);

