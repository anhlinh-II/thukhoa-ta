import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../error-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { user?: { sub?: string } }>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.INTERNAL_ERROR;
    let message = 'Internal server error';
    let result: unknown = null;

    if (exception instanceof BusinessException) {
      status = exception.getStatus();
      code = exception.getCode();
      message = exception.message;
      const details = exception.getDetails();
      const errorKey = exception.getMessageKey();
      if (details && typeof details === 'object') {
        result = { ...(details as Record<string, unknown>), errorKey };
      } else {
        result = { errorKey };
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // status = HttpStatus.BAD_REQUEST;
      // message = 'Database request failed';

      // if (exception.code === 'P2002') {
      //   status = HttpStatus.CONFLICT;
      //   code = ErrorCode.CONFLICT;
      //   message = 'Duplicate value violates unique constraint';
      //   result = { target: exception.meta?.target ?? null };
      // } else if (exception.code === 'P2025') {
      //   status = HttpStatus.NOT_FOUND;
      //   code = ErrorCode.NOT_FOUND;
      //   message = 'Record not found';
      // }
    } else if (exception instanceof HttpException) {
      // status = exception.getStatus();
      // const payload = exception.getResponse();

      // if (typeof payload === 'string') {
      //   message = payload;
      // } else if (payload && typeof payload === 'object') {
      //   const maybeMessage = (payload as { message?: unknown }).message;

      //   if (Array.isArray(maybeMessage)) {
      //     message = 'Validation failed';
      //     result = { errors: maybeMessage };
      //   } else if (typeof maybeMessage === 'string') {
      //     message = maybeMessage;
      //   }
      // }      

      // code = this.mapHttpStatusToCode(status);
    }

    this.logException(request, exception, {
      status,
      code,
      message,
      result,
    });

    response.status(status).json({
      code,
      message,
      result,
    });
  }

  // private mapHttpStatusToCode(status: number): ErrorCode {
  //   switch (status) {
  //     case HttpStatus.BAD_REQUEST:
  //       return ErrorCode.VALIDATION_ERROR;
  //     case HttpStatus.UNAUTHORIZED:
  //       return ErrorCode.UNAUTHORIZED;
  //     case HttpStatus.FORBIDDEN:
  //       return ErrorCode.FORBIDDEN;
  //     case HttpStatus.NOT_FOUND:
  //       return ErrorCode.NOT_FOUND;
  //     case HttpStatus.CONFLICT:
  //       return ErrorCode.CONFLICT;
  //     default:
  //       return ErrorCode.INTERNAL_ERROR;
  //   }
  // }

  private logException(
    request: Request & { user?: { sub?: string } },
    exception: unknown,
    payload: {
      status: number;
      code: number;
      message: string;
      result: unknown;
    },
  ): void {
    const { method, originalUrl, query, params, body } = request;
    const userId = request.user?.sub ?? null;
    const ip = request.ip;
    const ua = request.get('user-agent') || '';

    const sanitizedBody = this.sanitize(body);
    const sanitizedQuery = this.sanitize(query);
    const sanitizedParams = this.sanitize(params);

    const stack = exception instanceof Error ? exception.stack : undefined;
    const detail = {
      method,
      url: originalUrl,
      status: payload.status,
      code: payload.code,
      message: payload.message,
      result: payload.result,
      userId,
      ip,
      userAgent: ua,
      query: sanitizedQuery,
      params: sanitizedParams,
      body: sanitizedBody,
    };

    const line = JSON.stringify(detail);

    if (payload.status >= 500) {
      this.logger.error(line, stack);
      return;
    }

    this.logger.warn(line);
  }

  private sanitize(input: unknown): unknown {
    if (input === null || input === undefined) {
      return input;
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.sanitize(item));
    }

    if (typeof input !== 'object') {
      if (typeof input === 'string' && input.length > 500) {
        return `${input.slice(0, 500)}...(truncated)`;
      }
      return input;
    }

    const hiddenKeys = [
      'password',
      'newPassword',
      'confirmPassword',
      'access_token',
      'refresh_token',
      'authorization',
      'token',
      'otp',
    ];

    const obj = input as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (hiddenKeys.some((hidden) => key.toLowerCase().includes(hidden.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = this.sanitize(value);
      }
    }

    return result;
  }
}
