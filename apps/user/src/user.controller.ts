import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'healthCheck' })
  getHello() {
    return this.userService.getHello();
  }
}
