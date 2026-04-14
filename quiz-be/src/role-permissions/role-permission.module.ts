import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';

@Module({
  controllers: [RolePermissionController],
  providers: [RolePermissionService, PrismaService],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
