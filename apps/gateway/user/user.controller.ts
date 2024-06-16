import { userServicePatterns } from '@app/services_communications';
import { Public, ServiceName, User } from '@app/shared';
import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    @Inject(ServiceName.USER_SERVICE) private userService: ClientProxy,
  ) {}

  @Get(':id')
  @ApiProperty({
    description: 'Get user by id',
  })
  @ApiResponse({
    description: 'Get user by id',
    type: User,
  })
  @Public()
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.send(
      {
        cmd: userServicePatterns.findVerifiedUser,
      },
      id,
    );
  }
}
