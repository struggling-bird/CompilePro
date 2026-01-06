import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          this.logger.log(`${method} ${url} ${res.statusCode} - ${ms}ms`);
        },
        error: (error: unknown) => {
          const ms = Date.now() - start;
          const status =
            typeof error === 'object' && error && 'status' in error
              ? ((error as { status?: number }).status ?? 500)
              : 500;
          const message =
            typeof error === 'object' && error && 'message' in error
              ? ((error as { message?: string }).message ?? 'error')
              : 'error';
          const trace = (error as Error)?.stack;
          this.logger.error(
            `${method} ${url} ${status} - ${ms}ms`,
            trace,
            message,
          );
        },
      }),
    );
  }
}
