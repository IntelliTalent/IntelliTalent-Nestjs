import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ServiceName } from '@app/shared';
import { ClientProxy } from '@nestjs/microservices';
import { userServicePatterns } from '@app/services_communications';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ServiceName.USER_SERVICE) private userService: ClientProxy,
  ) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const user = await firstValueFrom(
        this.userService.send(
          { cmd: userServicePatterns.validateUser },
          { email, password },
        ),
      );

      if (!user) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials provided!');
    }
  }
}
