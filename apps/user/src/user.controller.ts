import {
  ClassSerializerInterceptor,
  Controller,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateUserDto,
  HealthCheckPatterns,
  userServicePatterns,
} from '@app/services_communications';
import { ServiceName, User } from '@app/shared';
import { UpdateUserDto } from '@app/services_communications/userService/dtos/updateUser.dto';
import { ResetPasswordDto } from '@app/services_communications/userService/dtos/reset-password.dto';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(ServiceName.NOTIFIER_SERVICE)
    private readonly notifierService: ClientProxy,
  ) {}

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
    return this.userService.findUser({
      where: {
        id,
      },
    });
  }

  @MessagePattern({ cmd: userServicePatterns.findUserByEmail })
  findUserByEmail(@Payload() email: string): Promise<User> {
    return this.userService.findUser({
      where: { email },
    });
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

  @MessagePattern({ cmd: userServicePatterns.resetPassword })
  changePassword(
    @Payload()
    { id, password }: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.chagePasswordUsingToken(id, password);
  }

  @MessagePattern({ cmd: userServicePatterns.verifyUser })
  verifyUser(@Payload() id: string): Promise<User> {
    return this.userService.verifyUser(id);
  }

  @MessagePattern({ cmd: userServicePatterns.getAllJobSeekers })
  async getAllJobSeekers(): Promise<User[]> {
    // used for ATS match command
    return this.userService.getAllJobSeekers();
  }
}
