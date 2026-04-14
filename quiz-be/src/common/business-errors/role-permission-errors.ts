import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';
import { BusinessErrorDefinition } from './business-error-definition';

export const ROLE_PERMISSION_ERRORS = {
  ROLE_NOT_FOUND: {
    code: ErrorCode.NOT_FOUND,
    key: 'role_permission.role.not_found',
    message: 'Role not found',
    status: HttpStatus.NOT_FOUND,
  },
} satisfies Record<string, BusinessErrorDefinition>;
