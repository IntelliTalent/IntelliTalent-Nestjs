import {
  ForgetPasswordToken,
  authServicePattern,
  userServicePatterns,
} from '@app/services_communications';
import { Constants, ServiceName, User } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ForgetPasswordStrategy extends PassportStrategy(
  Strategy,
  'jwt-forget-password',
) {
  /**
   * Class Constructor
   * @param userService UserService
   */
  constructor(
    @Inject(ServiceName.AUTH_SERVICE) private authService: ClientProxy,
    @Inject(ServiceName.USER_SERVICE) private userService: ClientProxy,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get(Constants.JWT.forgetPasswordSecret),
    });
  }

  /**
   * it's called automatically using a guard super class to validate user using token
   * @param payload object get from jwt token
   * @returns the user
   */
  async validate(payload: ForgetPasswordToken): Promise<User> {

    const user = await firstValueFrom(
      this.userService.send(
        { cmd: userServicePatterns.findUserById },
        payload.id,
      ),
    );
    return { ...user, ...payload };
  }
}
