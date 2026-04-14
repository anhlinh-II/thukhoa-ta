import { HttpException } from '@nestjs/common';
import { BusinessErrorDefinition } from '../business-errors/business-error-definition';

export class BusinessException extends HttpException {
  constructor(
    private readonly definition: BusinessErrorDefinition,
    private readonly details?: unknown,
  ) {
    super(definition.message, definition.status);
  }

  getCode(): number {
    return this.definition.code;
  }

  getMessageKey(): string {
    return this.definition.key;
  }

  getDetails(): unknown {
    return this.details;
  }
}
