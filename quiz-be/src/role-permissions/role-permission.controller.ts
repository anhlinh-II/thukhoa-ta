import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { RolePermissionService } from './role-permission.service';

@Controller('role-permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class RolePermissionController {
  constructor(private readonly service: RolePermissionService) {}

  @Get('roles')
  @ResponseMessage('Success')
  async getAllRoles() {
    return this.service.getAllRoles();
  }

  @Post('roles')
  @ResponseMessage('Success')
  async createRole(
    @Query('authority') authority: string,
    @Query('description') description?: string,
  ) {
    return this.service.createRole(authority, description);
  }

  @Put('roles/:id')
  @ResponseMessage('Success')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Query('authority') authority: string,
    @Query('description') description?: string,
  ) {
    return this.service.updateRole(id, authority, description);
  }

  @Delete('roles/:id')
  @ResponseMessage('Success')
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteRole(id);
    return null;
  }

  @Get('permissions')
  @ResponseMessage('Success')
  async getAllPermissions() {
    return this.service.getAllPermissions();
  }

  @Post('permissions')
  @ResponseMessage('Success')
  async createPermission(
    @Query('name') name: string,
    @Query('description') description: string,
    @Query('resource') resource: string,
    @Query('action') action: string,
  ) {
    return this.service.createPermission(name, description, resource, action);
  }

  @Put('permissions/:id')
  @ResponseMessage('Success')
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Query('name') name: string,
    @Query('description') description: string,
    @Query('resource') resource: string,
    @Query('action') action: string,
  ) {
    return this.service.updatePermission(
      id,
      name,
      description,
      resource,
      action,
    );
  }

  @Delete('permissions/:id')
  @ResponseMessage('Success')
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    await this.service.deletePermission(id);
    return null;
  }

  @Post('roles/:roleId/permissions')
  @ResponseMessage('Success')
  async assignPermissionsToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() permissionIds: number[],
  ) {
    return this.service.assignPermissionsToRole(roleId, permissionIds || []);
  }

  @Post('roles/:roleId/users/:userId')
  @ResponseMessage('Success')
  async assignRoleToUser(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('userId') userId: string,
  ) {
    await this.service.assignRoleToUser(roleId, userId);
    return null;
  }

  @Post('roles/:roleId/users')
  @ResponseMessage('Success')
  async assignUsersToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() userIds: Array<string | number>,
  ) {
    await this.service.assignUsersToRole(
      roleId,
      (userIds || []).map((id) => String(id)),
    );
    return null;
  }

  @Get('roles/:authority/users')
  @ResponseMessage('Success')
  async getUsersByRole(@Param('authority') authority: string) {
    return this.service.getUsersByRole(authority);
  }
}
