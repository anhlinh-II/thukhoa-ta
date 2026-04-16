# Auth and Authorization Flow (Detailed)

This document explains the current authentication and authorization flow implemented in `quiz-be`.

## 1) Runtime response contract

All non-ZenStack HTTP responses are normalized to:

```json
{
  "code": 1000,
  "message": "Success",
  "result": {}
}
```

For errors:

```json
{
  "code": 2002,
  "message": "Invalid credentials",
  "result": {
    "errorKey": "auth.user.invalid_credentials"
  }
}
```

Main pieces:

- Success envelope interceptor: `src/common/interceptors/response-envelope.interceptor.ts`
- Error filter: `src/common/filters/global-exception.filter.ts`
- Business exception: `src/common/exceptions/business.exception.ts`
- Auth domain errors: `src/common/business-errors/auth-errors.ts`
- Role/permission domain errors: `src/common/business-errors/role-permission-errors.ts`

Note:

- Requests under `/api/model/*` (ZenStack adapter) are intentionally excluded from the success envelope interceptor.

## 2) Modules and responsibilities

- `AuthModule`
  - Handles login/register/token/account/otp/password-reset endpoints
  - Owns JWT strategy and auth guards
- `RolePermissionModule`
  - Handles role/permission management and role assignment APIs
- `ZenstackApiModule`
  - Exposes model RPC endpoint under `/api/model/*`
- `PrismaService`
  - Shared Prisma client for all modules

Key files:

- `src/auth/auth.module.ts`
- `src/auth/users.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/jwt.strategy.ts`
- `src/role-permissions/role-permission.controller.ts`
- `src/role-permissions/role-permission.service.ts`
- `src/zenstack/zenstack.module.ts`

## 3) Authentication flow

### 3.1 Register

Endpoint:

- `POST /users/register`

Flow:

1. Check uniqueness by `email` and optional `username`/`phone`.
2. Hash password with bcrypt.
3. Create user with `is_active = false`.
4. Ensure role `USER` exists, then create `UserRole` mapping.
5. Return public user info.

Business failure:

- Existing user -> `AUTH_ERRORS.USER_ALREADY_EXISTS`

Implementation:

- `src/auth/auth.service.ts` -> `register`

### 3.2 Verify OTP

Endpoint:

- `POST /users/verify-otp?email=...&otp=...`

Flow:

1. Find user by email.
2. Validate OTP.
3. Clear OTP fields and set `is_active = true`.

Business failures:

- User not found
- Invalid OTP

Implementation:

- `src/auth/auth.service.ts` -> `verifyOtp`

### 3.3 Login

Endpoint:

- `POST /users/login`

Flow:

1. Find user by `email` or `username`.
2. Ensure user is active and not deleted.
3. Validate password hash.
4. Build authorities from `UserRole -> Role.authority`.
5. Sign `access_token` and `refresh_token`.
6. Store `refresh_token` in DB.
7. Return tokens and user authorities.

Business failure:

- Invalid credentials

Implementation:

- `src/auth/auth.service.ts` -> `login`, `buildAuthorities`, `signTokens`

### 3.4 Account

Endpoint:

- `GET /users/account` (JWT required)

Flow:

1. `JwtAuthGuard` validates access token.
2. Controller extracts `req.user.sub`.
3. Service fetches profile and authorities.
4. Return profile in legacy-like shape.

Implementation:

- `src/auth/users.controller.ts` -> `account`
- `src/auth/auth.service.ts` -> `getAccount`

### 3.5 Refresh

Endpoint:

- `GET /users/refresh` (JWT required)

Flow:

1. Resolve current user by `sub`.
2. Ensure active and not deleted.
3. Re-issue access/refresh tokens.
4. Persist new refresh token in DB.

Implementation:

- `src/auth/auth.service.ts` -> `refresh`, `signTokens`

### 3.6 Logout

Endpoint:

- `POST /users/logout` (JWT required)

Flow:

1. Set `refresh_token = null` for current user.
2. Return success envelope.

Implementation:

- `src/auth/auth.service.ts` -> `logout`

### 3.7 Forgot password and reset password

Endpoints:

- `POST /users/forgot-password`
- `POST /users/reset-password`

Flow:

1. Forgot-password creates `reset_password_token` and expiry for existing user.
2. Reset-password validates token + expiry.
3. Hash new password.
4. Clear reset token fields.

Business failures:

- Invalid reset token
- Expired reset token

Implementation:

- `src/auth/auth.service.ts` -> `forgotPassword`, `resetPassword`

## 4) JWT validation flow

JWT strategy file:

- `src/auth/jwt.strategy.ts`

Flow for protected routes:

1. `JwtAuthGuard` calls Passport JWT strategy.
2. Strategy reads Bearer token and validates signature using:
   - `JWT_ACCESS_SECRET` or `JWT_SECRET` or fallback `dev-access-secret`
3. `validate(payload)` loads user by `payload.sub`.
4. Reject if user inactive or deleted.
5. Attach payload to `request.user`.

## 5) Authorization (RBAC + permission)

### 5.1 Role guard (currently active)

- Decorator: `@Roles(...authorities)`
- Guard: `RolesGuard`
- Matching logic: `requiredRoles.some(role => user.authorities.includes(role))`

Current usage:

- `RolePermissionController` uses:
  - `@UseGuards(JwtAuthGuard, RolesGuard)`
  - `@Roles('ADMIN', 'SUPER_ADMIN')`

Meaning:

- Only `ADMIN` or `SUPER_ADMIN` tokens can call `/role-permissions/*` APIs.

### 5.2 Permission guard (implemented, ready to use)

- Decorator: `@Permissions('resource:action')`
- Guard: `PermissionsGuard`
- Permission check: `RolePermissionService.userHasPermission(userId, resource, action)`

Current status:

- Guard exists and is registered in module providers.
- It is not yet attached to controllers/routes by default.

How to enable on a route:

1. Add `@UseGuards(JwtAuthGuard, PermissionsGuard)`.
2. Add `@Permissions('question:create')` (example).

## 6) Role-permission management flow

Controller base:

- `src/role-permissions/role-permission.controller.ts`

Service:

- `src/role-permissions/role-permission.service.ts`

Important behavior:

- Assign permissions to role uses replace strategy:
  - delete all old links in `RolePermission`
  - bulk insert new links
- Assign users to role uses replace strategy:
  - delete all old links in `UserRole` for role
  - bulk insert new links
- `assignRoleToUser` ensures role exists first

Business failure in this module:

- Role not found -> `ROLE_PERMISSION_ERRORS.ROLE_NOT_FOUND`

## 7) Data model involved in auth/rbac

Core tables:

- `User`
- `Role`
- `Permission`
- `UserRole` (many-to-many user-role)
- `RolePermission` (many-to-many role-permission)

Common relationships used in checks:

- Authorities for token/account:
  - `User` -> `UserRole` -> `Role.authority`
- Permission lookup:
  - `User` -> `UserRole` -> `Role` -> `RolePermission` -> `Permission(resource, action)`

## 8) Error handling model

### Business errors

Throw `BusinessException` with a domain definition.

Example:

```ts
throw new BusinessException(AUTH_ERRORS.INVALID_CREDENTIALS);
```

Result shape from global filter:

```json
{
  "code": 2002,
  "message": "Invalid credentials",
  "result": {
    "errorKey": "auth.user.invalid_credentials"
  }
}
```

### Framework or Prisma errors

Global filter also maps:

- Validation and common HTTP exceptions to app error codes
- Prisma `P2002` (conflict)
- Prisma `P2025` (not found)

## 9) Request lifecycle summary

For a protected non-ZenStack endpoint:

1. Request enters Nest app.
2. Global `ValidationPipe` validates DTOs.
3. Route guards run (`JwtAuthGuard`, then role/permission guards if declared).
4. Controller calls service.
5. Service throws business error or returns data.
6. If success: `ResponseEnvelopeInterceptor` wraps output.
7. If error: `GlobalExceptionFilter` standardizes output.

## 10) Environment values used by auth

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_SECRET` (fallback)
- `PORT` (default `4200`)

## 11) Suggested next hardening steps

1. Store refresh tokens hashed in DB instead of plain value.
2. Add refresh token rotation and token family invalidation.
3. Add OTP expiry validation in verify flow.
4. Add rate limit for login/otp/forgot-password endpoints.
5. Attach `PermissionsGuard` to write-sensitive APIs and define explicit permissions per route.
