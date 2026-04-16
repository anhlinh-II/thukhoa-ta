# quiz-be

Backend for quiz system using NestJS + Prisma + ZenStack.

## Additional documentation

- Detailed auth and authorization flow: `README_AUTH_RBAC.md`

## Architecture

- Schema source of truth: `schema.zmodel`
- Generated Prisma schema: `prisma/schema.prisma`
- Generated ZenStack runtime assets: `node_modules/.zenstack/*`
- Nest API app entry: `src/main.ts`
- ZenStack Nest adapter endpoint: `/api/model/*`

## Prerequisites

- Node.js 18+
- MySQL running (or use Docker compose)

## Install

```bash
npm install
```

## Start dependencies (optional)

```bash
npm run docker:up
```

## Workflow: zmodel -> generate -> DB sync

### 1) Edit model in zmodel

Only edit this file:

- `schema.zmodel`

Do not manually edit generated file:

- `prisma/schema.prisma`

### 2) Generate artifacts

```bash
npm run db:generate
```

This generates:

- Prisma schema from zmodel
- ZenStack enhancer
- Zod schemas
- TanStack hooks output (configured in `schema.zmodel` plugin)

### 3) Sync database schema

Recommended for development with migration history:

```bash
npm run db:migrate -- --name <migration_name>
```

Quick push without creating migration files:

```bash
npx prisma db push
```

If Prisma warns about destructive/unique changes and you accept risk:

```bash
npx prisma db push --accept-data-loss
```

## Run backend

Development:

```bash
npm run start:dev
```

Debug mode:

```bash
npm run start:debug
```

Default port: `4200` (or `PORT` from environment).

## ZenStack Nest adapter

This project is configured with `@zenstackhq/server` Nest adapter.

### API base

- Base URL: `http://localhost:4200/api/model`

### RPC examples

- `POST /api/model/user/findMany`
- `POST /api/model/user/create`
- `PUT /api/model/user/update`
- `DELETE /api/model/user/delete`

### Key backend files

- `src/zenstack/zenstack.module.ts`
- `src/zenstack/zenstack.controller.ts`
- `src/prisma.service.ts`
- `src/app.module.ts`

## Frontend hooks integration

Generated hooks in frontend are under:

- `../quiz-fe/src/share/hooks/zenstack`

Make sure frontend hook Provider uses endpoint:

- `http://localhost:4200/api/model`

## Useful commands

```bash
# run tests
npm test

# lint
npm run lint

# format
npm run format

# prisma studio via zenstack proxy
npm run db:studio
```
