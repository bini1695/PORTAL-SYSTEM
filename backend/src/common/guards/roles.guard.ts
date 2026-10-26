import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client'; // 👈 Changed from 'import type' so we can use the enum
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedUser } from '../types/authenticated-user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, let them pass
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    
    if (!user) throw new ForbiddenException('No authenticated user');

    // 👇 SUPER_ADMIN BYPASS: If they are a Super Admin, let them in immediately.
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    // Otherwise, check if their role is in the allowed list
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Role ${user.role} is not permitted to access this resource`,
      );
    }
    return true;
  }
}