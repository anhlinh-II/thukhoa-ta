import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../error-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
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
      status = HttpStatus.BAD_REQUEST;
      message = 'Database request failed';

      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = ErrorCode.CONFLICT;
        message = 'Duplicate value violates unique constraint';
        result = { target: exception.meta?.target ?? null };
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = ErrorCode.NOT_FOUND;
        message = 'Record not found';
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const maybeMessage = (payload as { message?: unknown }).message;

        if (Array.isArray(maybeMessage)) {
          message = 'Validation failed';
          result = { errors: maybeMessage };
        } else if (typeof maybeMessage === 'string') {
          message = maybeMessage;
        }
      }

      code = this.mapHttpStatusToCode(status);
    }

    response.status(status).json({
      code,
      message,
      result,
    });
  }

  private mapHttpStatusToCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }
}
