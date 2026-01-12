import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpErrorCode } from '@peernest/core';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { IClsStore } from '@/types/cls';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly clsService: ClsService<IClsStore>
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const userRole = this.clsService.get('user.role');

    if (!userRole) {
      throw new CustomHttpException(
        'Role information is missing',
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      throw new CustomHttpException(
        `Required role: ${requiredRoles.join(', ')}`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    return true;
  }
}
