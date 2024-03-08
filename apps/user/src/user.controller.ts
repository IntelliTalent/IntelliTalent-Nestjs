import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateUserDto,
  HealthCheckPatterns,
  userServicePatterns,
} from '@app/services_communications';
import { User } from '@app/shared';
import { UpdateUserDto } from '@app/services_communications/userService/dtos/updateUser.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: HealthCheckPatterns })
  getHello() {
    return this.userService.getHello();
  }

  @MessagePattern({ cmd: userServicePatterns.createUser })
  createUser(@Payload() data: CreateUserDto): Promise<User> {
    return this.userService.createUser(data);
  }

  @MessagePattern({ cmd: userServicePatterns.findUserById })
  findUserById(@Payload() id: string): Promise<User> {
    console.log('userId', id);
    return this.userService.findUser({
      id: id,
    });
  }

  @MessagePattern({ cmd: userServicePatterns.findUserByEmail })
  findUserByEmail(@Payload() email: string): Promise<User> {
    return this.userService.findUser({ email });
  }

  @MessagePattern({ cmd: userServicePatterns.updateUser })
  updateUser(@Payload() updateUser: UpdateUserDto): Promise<User> {
    return this.userService.updateUser(updateUser);
  }

  @MessagePattern({ cmd: userServicePatterns.deleteUser })
  deleteUser(
    @Payload()
    {
      TakenActionId,
      deletedUserId,
    }: {
      TakenActionId: string;
      deletedUserId: string;
    },
  ): Promise<void> {
    return this.userService.deleteUser(TakenActionId, deletedUserId);
  }

  @MessagePattern({ cmd: userServicePatterns.getAllUsers })
  getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @MessagePattern({ cmd: userServicePatterns.validateUser })
  validateUser(
    @Payload() { email, password }: { email: string; password: string },
  ): Promise<User> {
    return this.userService.validateUser(email, password);
  }
}
