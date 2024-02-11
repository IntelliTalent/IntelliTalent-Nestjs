import { UserRequest, userServicePatterns } from '@app/services_communications';
import { TokenPayload } from '@app/services_communications/authService';
import { Constants, ServiceName } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ServiceName.USER_SERVICE) private userService: ClientProxy,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get(Constants.JWT.secret),
    });
  }

  async validate(payload: UserRequest) {
    console.log('payload', payload);
    const { id } = payload.user;
    console.log('pattern', userServicePatterns.findUserById);
    const user = await firstValueFrom(
      this.userService.send({ cmd: userServicePatterns.findUserById }, id),
    );
    console.log('user', user);
    return user;
  }
}
