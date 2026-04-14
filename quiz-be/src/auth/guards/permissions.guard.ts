import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RolePermissionService } from '../../role-permissions/role-permission.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub?: string } | undefined;
    if (!user?.sub) {
      return false;
    }

    for (const permission of requiredPermissions) {
      const [resource, action] = permission.split(':');
      if (!resource || !action) {
        return false;
      }
      const allowed = await this.rolePermissionService.userHasPermission(
        user.sub,
        resource,
        action,
      );
      if (!allowed) {
        return false;
      }
    }

    return true;
  }
}
