import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { ErrorCode } from '../error-codes';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{ originalUrl?: string; url?: string }>();
    const url = request?.originalUrl || request?.url || '';

    // Keep ZenStack handler response untouched.
    if (url.startsWith('/api/model')) {
      return next.handle();
    }

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Success';

    return next.handle().pipe(
      map((data: unknown) => {
        if (this.isEnvelope(data)) {
          return data;
        }

        return {
          code: ErrorCode.SUCCESS,
          message,
          result: data ?? null,
        };
      }),
    );
  }

  private isEnvelope(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const value = data as Record<string, unknown>;
    return (
      typeof value.code === 'number' &&
      typeof value.message === 'string' &&
      Object.prototype.hasOwnProperty.call(value, 'result')
    );
  }
}
