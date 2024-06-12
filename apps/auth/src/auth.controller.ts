import {
  ClassSerializerInterceptor,
  Controller,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateUserDto,
  HealthCheckPatterns,
} from '@app/services_communications';
import {
  ForgetPasswordDto,
  ForgetPasswordToken,
  authServicePattern,
} from '@app/services_communications/authService';
import { User } from '@app/shared';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: HealthCheckPatterns })
  getHello() {
    return this.authService.getHello();
  }

  @MessagePattern({ cmd: authServicePattern.signUser })
  async login(@Payload() userandResponse: User) {
    return this.authService.userToken(userandResponse);
  }

  @MessagePattern({ cmd: authServicePattern.register })
  async register(@Payload() newUser: CreateUserDto) {
    return this.authService.register(newUser);
  }

  @MessagePattern({ cmd: authServicePattern.forgetPassword })
  async forgetPassword(@Payload() forgetPassowrdDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPassowrdDto.email);
  }

  @MessagePattern({ cmd: authServicePattern.resetPassword })
  async resetPassword(@Payload() uuid: string) {
    return this.authService.resetPassword(uuid);
  }

  @MessagePattern({ cmd: authServicePattern.verifyEmail })
  async verifyEmail(@Payload() resetPassword: ForgetPasswordToken) {
    return this.authService.verifyEmail(resetPassword);
  }
}
