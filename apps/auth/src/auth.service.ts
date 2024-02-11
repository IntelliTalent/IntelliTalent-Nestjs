import {
  CreateUserDto,
  userServicePatterns,
} from '@app/services_communications';
import { ServiceName, User } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ServiceName.USER_SERVICE)
    private readonly userService: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  getHello(): string {
    return 'Hello World From Auth Service!';
  }

  async sign(user: User) {
    console.log('usersdsds', user);
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        userType: user.type,
      },
      sub: user.id,
    };
    console.log('payload', payload);

    return {
      userId: user.id,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(newUser: CreateUserDto) {
    try {
      const user = await firstValueFrom(
        this.userService.send({ cmd: userServicePatterns.createUser }, newUser),
      );

      return this.sign(user);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
