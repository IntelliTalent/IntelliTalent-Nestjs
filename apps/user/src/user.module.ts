import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SharedModule, User } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';

@Module({
  imports: [SharedModule.registerPostgres(ServiceName.USER_SERVICE, [User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
