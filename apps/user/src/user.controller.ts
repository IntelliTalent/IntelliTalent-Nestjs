import {
  ClassSerializerInterceptor,
  Controller,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateUserDto,
  HealthCheckPatterns,
  userServicePatterns,
} from '@app/services_communications';
import { User } from '@app/shared';
import { UpdateUserDto } from '@app/services_communications/userService/dtos/updateUser.dto';
import { ResetPasswordDto } from '@app/services_communications/userService/dtos/reset-password.dto';
import { PageOptionsDto } from '@app/shared/api-features/dtos/page-options.dto';
import { PageDto } from '@app/shared/api-features/dtos/page.dto';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
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
  async getAllJobSeekers(
    @Payload() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User[]>> {
    return this.userService.getAllJobSeekers(pageOptionsDto);
  }
}
