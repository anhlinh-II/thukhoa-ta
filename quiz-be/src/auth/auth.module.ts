import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersController } from './users.controller';
import { RolePermissionModule } from '../role-permissions/role-permission.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    RolePermissionModule,
  ],
  controllers: [UsersController],
  providers: [
    PrismaService,
    AuthService,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [AuthService, JwtModule, RolesGuard, PermissionsGuard],
})
export class AuthModule {}
