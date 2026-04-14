import { Injectable } from '@nestjs/common';
import { ROLE_PERMISSION_ERRORS } from '../common/business-errors/role-permission-errors';
import { BusinessException } from '../common/exceptions/business.exception';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RolePermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    }).then((roles) =>
      roles.map((r) => ({
        ...r,
        permissions: r.permissions.map((p) => p.permission),
      })),
    );
  }

  async createRole(authority: string, description?: string) {
    return this.prisma.role.create({
      data: { authority, description },
    });
  }

  async updateRole(id: number, authority: string, description?: string) {
    return this.prisma.role.update({
      where: { id },
      data: { authority, description },
    });
  }

  async deleteRole(id: number) {
    await this.prisma.role.delete({ where: { id } });
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: { id: 'asc' } });
  }

  async createPermission(
    name: string,
    description: string,
    resource: string,
    action: string,
  ) {
    return this.prisma.permission.create({
      data: { name, description, resource, action },
    });
  }

  async updatePermission(
    id: number,
    name: string,
    description: string,
    resource: string,
    action: string,
  ) {
    return this.prisma.permission.update({
      where: { id },
      data: { name, description, resource, action },
    });
  }

  async deletePermission(id: number) {
    await this.prisma.permission.delete({ where: { id } });
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
    await this.prisma.rolePermission.deleteMany({ where: { role_id: roleId } });

    if (permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          role_id: roleId,
          permission_id: permissionId,
        })),
        skipDuplicates: true,
      });
    }

    return this.getRoleWithPermissions(roleId);
  }

  async assignRoleToUser(roleId: number, userId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new BusinessException(ROLE_PERMISSION_ERRORS.ROLE_NOT_FOUND);
    }

    await this.prisma.userRole.create({
      data: { role_id: roleId, user_id: userId },
    });
  }

  async assignUsersToRole(roleId: number, userIds: string[]) {
    await this.prisma.userRole.deleteMany({ where: { role_id: roleId } });
    if (userIds.length > 0) {
      await this.prisma.userRole.createMany({
        data: userIds.map((userId) => ({ user_id: userId, role_id: roleId })),
        skipDuplicates: true,
      });
    }
  }

  async getUsersByRole(authority: string) {
    const role = await this.prisma.role.findUnique({
      where: { authority },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!role) {
      return [];
    }

    return role.users.map((row) => ({
      id: row.user.id,
      username: row.user.username,
      email: row.user.email,
      fullName: row.user.full_name,
    }));
  }

  async userHasPermission(userId: string, resource: string, action: string) {
    const found = await this.prisma.userRole.findFirst({
      where: {
        user_id: userId,
        role: {
          permissions: {
            some: {
              permission: {
                resource,
                action,
              },
            },
          },
        },
      },
    });

    return !!found;
  }

  private async getRoleWithPermissions(roleId: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new BusinessException(ROLE_PERMISSION_ERRORS.ROLE_NOT_FOUND);
    }

    return {
      ...role,
      permissions: role.permissions.map((p) => p.permission),
    };
  }
}
