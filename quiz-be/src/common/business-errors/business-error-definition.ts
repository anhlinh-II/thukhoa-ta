import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';

export interface BusinessErrorDefinition {
  code: ErrorCode;
  key: string;
  message: string;
  status: HttpStatus;
}
