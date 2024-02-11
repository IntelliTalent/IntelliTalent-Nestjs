import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateUserDto,
  HealthCheckPatterns,
} from '@app/services_communications';
import { authServicePattern } from '@app/services_communications/authService';
import { User } from '@app/shared';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: HealthCheckPatterns })
  getHello() {
    return this.authService.getHello();
  }

  @MessagePattern({ cmd: authServicePattern.signUser })
  async login(@Payload() userandResponse: User) {
    console.log('usersdsdsddsggg', userandResponse);
    return this.authService.sign(userandResponse);
  }

  @MessagePattern({ cmd: authServicePattern.register })
  async register(@Payload() newUser: CreateUserDto) {
    return this.authService.register(newUser);
  }
}
