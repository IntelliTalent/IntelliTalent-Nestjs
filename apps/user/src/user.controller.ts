import {
  ClassSerializerInterceptor,
  Controller,
  Inject,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ClientProxy,
  EventPattern,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';
import {
  changePasswordDto,
  CreateUserDto,
  HealthCheckPatterns,
  userServicePatterns,
} from '@app/services_communications';
import {
  RpcExceptionsFilter,
  SeederEvent,
  ServiceName,
  User,
} from '@app/shared';
import { UpdateUserDto } from '@app/services_communications/userService/dtos/updateUser.dto';
import { ResetPasswordDto } from '@app/services_communications/userService/dtos/reset-password.dto';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';
import { GetUsersByIdsDto } from '@app/services_communications/userService/dtos/get-users.dto';

@Controller()
@UseFilters(RpcExceptionsFilter)
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: HealthCheckPatterns })
  getHello() {
    return this.userService.getHello();
  }

  @MessagePattern({ cmd: SeederEvent })
  seeder(count: number) {
    return this.userService.seeder(count);
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
  changePasswordWithToken(
    @Payload()
    { id, password }: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.changePasswordUsingToken(id, password);
  }

  @MessagePattern({ cmd: userServicePatterns.verifyUser })
  verifyUser(@Payload() id: string): Promise<User> {
    return this.userService.verifyUser(id);
  }

  @MessagePattern({ cmd: userServicePatterns.changePassword })
  changePassword(
    @Payload()
    dto: changePasswordDto,
  ): Promise<{ message: string }> {
    return this.userService.changePassword(dto);
  }

  @MessagePattern({ cmd: userServicePatterns.getAllJobSeekers })
  async getAllJobSeekers(pageOptions: PageOptionsDto): Promise<User[]> {
    return this.userService.getAllJobSeekers(pageOptions);
  }

  @MessagePattern({ cmd: userServicePatterns.getUsersByIds })
  getUsersByIds(@Payload() dto: GetUsersByIdsDto) {
    return this.userService.getUsersByIds(dto.usersIds);
  }

  @MessagePattern({ cmd: userServicePatterns.findVerifiedUser })
  findVerifiedUser(@Payload() id: string): Promise<User> {
    return this.userService.findUser({
      where: {
        id,
        isVerified: true,
      },
    });
  }
}
