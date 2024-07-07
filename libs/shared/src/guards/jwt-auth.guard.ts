import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/ispublic-decorator.decorator';
import { IS_OPTIONAL_PUBLIC_KEY } from '../decorators/optional-public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }


    const isOptionalPublic = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('isOptionalPublic', isOptionalPublic);

    try {
      await super.canActivate(context) as boolean;
    } catch (e) {
      if (isOptionalPublic) {
        return true;
      }
      throw e;
    }

    return true;

  }
}
