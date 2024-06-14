import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '../enums/user-type.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (user.type == UserType.admin) return true;

    const hasRole = requiredRoles.includes(user.type);
    if (hasRole) return true;

    throw new ForbiddenException('You do not have permission (RolesGuard)');
  }
}
