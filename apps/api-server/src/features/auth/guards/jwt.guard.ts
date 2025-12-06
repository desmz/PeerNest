import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ACCESS_TOKEN_STRATEGY_NAME } from '@peernest/core';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard(ACCESS_TOKEN_STRATEGY_NAME) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  private async validate(context: ExecutionContext) {
    return super.canActivate(context) as Promise<boolean>;
  }

  override async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return await this.validate(context);
  }
}
