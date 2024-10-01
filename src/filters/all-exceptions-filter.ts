/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Logger } from 'src/logging/Logger';
import { ApiErrorDto } from 'src/filters/dto/ApiError.dto';
import { getErrorCode, HttpException, parseStacktrace } from 'src/utils';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  logger: Logger;

  constructor() {
    this.logger = new Logger('HttpExceptionFilter');
  }

  catch(e: HttpException | Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Get the location where the error was thrown from to use as a logging tag
    const parsedStack = parseStacktrace(e.stack ?? '');
    const tag =
      parsedStack.length > 0 ? parsedStack[0].methodName : '<unknown>';

    // Get the correct http status
    const httpE = e as HttpException;
    const { status, code, meta } = {
      status: httpE.status ?? 500,
      code: httpE.code ?? getErrorCode(httpE.status ?? 500),
      meta: httpE.meta ?? undefined,
    };
    response.statusCode = status;

    const traceId = request.headers['x-trace-id'] as string;
    const ip = request.headers['x-ip'] as string;
    response.header('x-trace-id', traceId);
    response.header('x-ip', ip);

    const message = e.message || e.name;
    const apiError: ApiErrorDto = {
      status,
      message,
      code,
      traceId,
      meta,
    };

    this.logger.error(message, { tag, ctx: { traceId, ip } }, e);
    this.logger.logRoute(request, response, { ...apiError });

    void response.status(status).send(apiError);
  }
}
