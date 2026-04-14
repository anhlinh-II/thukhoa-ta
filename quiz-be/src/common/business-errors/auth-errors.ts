import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes';
import { BusinessErrorDefinition } from './business-error-definition';

export const AUTH_ERRORS = {
  USER_ALREADY_EXISTS: {
    code: ErrorCode.USER_ALREADY_EXISTS,
    key: 'auth.user.already_exists',
    message: 'User already exists',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_CREDENTIALS: {
    code: ErrorCode.INVALID_CREDENTIALS,
    key: 'auth.user.invalid_credentials',
    message: 'Invalid credentials',
    status: HttpStatus.UNAUTHORIZED,
  },
  INVALID_USER: {
    code: ErrorCode.INVALID_CREDENTIALS,
    key: 'auth.user.invalid_user',
    message: 'Invalid user',
    status: HttpStatus.UNAUTHORIZED,
  },
  USER_NOT_FOUND: {
    code: ErrorCode.USER_NOT_FOUND,
    key: 'auth.user.not_found',
    message: 'User not found',
    status: HttpStatus.NOT_FOUND,
  },
  OTP_INVALID: {
    code: ErrorCode.OTP_INVALID,
    key: 'auth.otp.invalid',
    message: 'Invalid OTP',
    status: HttpStatus.BAD_REQUEST,
  },
  RESET_TOKEN_INVALID: {
    code: ErrorCode.RESET_TOKEN_INVALID,
    key: 'auth.reset_token.invalid',
    message: 'Invalid reset token',
    status: HttpStatus.BAD_REQUEST,
  },
  RESET_TOKEN_EXPIRED: {
    code: ErrorCode.RESET_TOKEN_EXPIRED,
    key: 'auth.reset_token.expired',
    message: 'Reset token expired',
    status: HttpStatus.BAD_REQUEST,
  },
} satisfies Record<string, BusinessErrorDefinition>;
