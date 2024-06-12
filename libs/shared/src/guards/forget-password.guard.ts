import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
/**
 * forget user password guard class
 */
@Injectable()
export class JWTForgetPasswordGuard extends AuthGuard('jwt-forget-password') {
  constructor() {
    super();
  }

  async canActivate(context) {
    return (await super.canActivate(context)) as boolean;
  }
}
