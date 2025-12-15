import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Observable, catchError, map, throwError } from 'rxjs';
import { HttpException } from '@nestjs/common';

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data: data as unknown,
        timestamp: Date.now(),
      })),
      catchError((error: unknown) => {
        const status =
          typeof error === 'object' && error && 'status' in error
            ? ((error as { status?: number }).status ?? 500)
            : 500;
        const message =
          typeof error === 'object' && error && 'message' in error
            ? ((error as { message?: string }).message ?? 'server error')
            : 'server error';
        const details =
          typeof error === 'object' && error && 'response' in error
            ? (error as { response?: unknown }).response
            : undefined;
        try {
          this.logger.error(
            JSON.stringify({ status, message, details }),
            (error as Error)?.stack,
            'ApiResponse',
          );
        } catch (e) {
          void e;
        }
        const body = {
          code: status,
          message,
          timestamp: Date.now(),
        };
        return throwError(() => new HttpException(body, status));
      }),
    );
  }
}
