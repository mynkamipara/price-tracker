import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Logger } from 'src/logging/Logger';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  logger: Logger = new Logger('ROUTE');

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const traceId = request.headers['x-trace-id'] as string;
    const ip = request.headers['x-ip'] as string;

    return next.handle().pipe(
      tap((data) => {
        // Add response headers
        void response.header('x-trace-id', traceId);
        void response.header('x-ip', ip);

        // Log route
        this.logger.logRoute(request, response, data);

        return data;
      }),
    );
  }
}
