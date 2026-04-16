# Ban do luong API: Hook, Prisma, ZenStack, NestJS

Tai lieu nay giup ban phan biet ro 2 duong di khac nhau trong du an hien tai.

## 1) Tong quan nhanh

Co 2 luong chinh dang cung ton tai:

1. Luong API NestJS thu cong
- Vi du: /users/login, /role-permissions/roles
- Di qua Controller -> Guard -> Service -> PrismaService -> DB

2. Luong API ZenStack model
- Vi du: /api/model/user/findMany
- Thuong duoc goi boi hooks TanStack da generate
- Di qua ZenstackController -> ApiHandlerService -> enhanced Prisma (co policy) -> DB

Neu ban bi roi, hay nho:
- /users/* va /role-permissions/* la API nghiep vu thu cong
- /api/model/* la API model tu dong cua ZenStack

## 2) Luong A: FE Hook -> ZenStack -> Prisma

Day la luong khi FE dung hooks generate tu ZenStack.

### A.1 Diem bat dau ben FE

- Query provider FE cap endpoint ZenStack: /api/model
- File lien quan:
  - ../quiz-fe/src/share/components/providers/QueryProvider.tsx
  - ../quiz-fe/src/share/hooks/zenstack/index.ts

### A.2 Ben BE tiep nhan request

- Route vao: /api/model/*
- ZenstackController bat tat ca method va path con
- File:
  - src/zenstack/zenstack.controller.ts

### A.3 ZenStack xu ly

- ApiHandlerService cua @zenstackhq/server xu ly request model
- ZenStackModule duoc register voi getEnhancedPrisma
- getEnhancedPrisma tra ve enhance(prisma)
- File:
  - src/zenstack/zenstack.module.ts

### A.4 Policy @@allow tac dong tai day

- Policy trong schema.zmodel duoc ap khi request di qua enhanced Prisma
- Vi du @@allow('read', auth() != null)
- File:
  - schema.zmodel

### A.5 Xuong Prisma va DB

- Enhanced Prisma goi den Prisma client
- Prisma truy van MySQL
- File:
  - src/prisma.service.ts

## 3) Luong B: FE -> Nest API thu cong -> Prisma

Day la luong API nghiep vu ban tu viet.

### B.1 Request vao Controller

- Vi du:
  - src/auth/users.controller.ts
  - src/role-permissions/role-permission.controller.ts

### B.2 Guard/Decorator phan quyen route

- JWT guard xac thuc token
- Roles guard kiem tra authority
- Permissions guard da co, co the gan them cho route can control chi tiet
- File:
  - src/auth/guards/jwt-auth.guard.ts
  - src/auth/guards/roles.guard.ts
  - src/auth/guards/permissions.guard.ts
  - src/auth/decorators/roles.decorator.ts
  - src/auth/decorators/permissions.decorator.ts

### B.3 Service xu ly nghiep vu

- AuthService, RolePermissionService xu ly logic
- Neu loi nghiep vu thi throw BusinessException
- File:
  - src/auth/auth.service.ts
  - src/role-permissions/role-permission.service.ts

### B.4 Prisma truy van DB

- Service goi this.prisma.*
- PrismaService la PrismaClient duoc inject
- File:
  - src/prisma.service.ts

### B.5 Chuan hoa response

- Success duoc boc boi ResponseEnvelopeInterceptor
- Error duoc chuan hoa boi GlobalExceptionFilter
- File:
  - src/common/interceptors/response-envelope.interceptor.ts
  - src/common/filters/global-exception.filter.ts
  - src/main.ts

## 4) Diem de loạn nhat va cach nho

1. Ban thay cung la Prisma, nhung thuc ra co 2 cach di vao Prisma
- Cach 1: qua enhance(prisma) cua ZenStack
- Cach 2: goi truc tiep this.prisma trong service Nest

2. @@allow chi chac chan co hieu luc tren luong qua enhanced Prisma
- Tuc la luong /api/model/*

3. Guard Roles/Permissions la route-level
- Chan duoc route nao duoc goi
- Khong tu dong thay the data policy theo tung record nhu @@allow

## 5) So do don gian

### So do tong

FE
-> Neu goi API nghiep vu: /users/*, /role-permissions/*
-> Nest Controller + Guard + Service
-> PrismaService
-> MySQL

FE
-> Neu goi hooks ZenStack: /api/model/*
-> ZenstackController + ApiHandlerService
-> enhanced Prisma (policy @@allow/@@deny)
-> Prisma
-> MySQL

### So do response

Request
-> ValidationPipe
-> Guard (neu co)
-> Controller/Service
-> Success: ResponseEnvelopeInterceptor
-> Error: GlobalExceptionFilter

## 6) Khi nao dung luong nao

1. Dung luong Nest API thu cong khi:
- Can nghiep vu phuc tap
- Can format response rieng cho FE
- Can gom nhieu thao tac trong mot endpoint

2. Dung luong ZenStack model API khi:
- Can CRUD nhanh theo model
- Muon tan dung generated hooks
- Muon ap data policy tu schema.zmodel

## 7) Checklist debug nhanh khi bi roi

1. Xac dinh endpoint dang goi la gi
- Neu bat dau bang /api/model -> luong ZenStack
- Nguoc lai -> luong Nest API thu cong

2. Neu loi quyen truy cap
- Kiem tra Guard (route-level)
- Kiem tra @@allow trong schema.zmodel (data-level, cho luong ZenStack)

3. Neu loi response shape
- Kiem tra interceptor/filter trong src/main.ts
- Luu y /api/model khong bi envelope interceptor boc lai

4. Neu loi truy van model
- Kiem tra schema.zmodel
- Chay generate lai: npm run db:generate
- Kiem tra Prisma client va DB schema

## 8) Kien nghi de giam roi ve sau

1. Chon ro tung nhom man hinh FE dung luong nao, ghi vao tai lieu team.
2. Route nao da dung Nest API thi uu tien giu on dinh contract.
3. Route nao dung ZenStack thi uu tien policy trong schema.zmodel.
4. Tranh mot use-case vua co endpoint thu cong vua CRUD cung model bang /api/model neu khong can thiet.
