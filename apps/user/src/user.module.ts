import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SharedModule } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';

@Module({
  imports: [SharedModule.registerPostgres(ServiceName.USER_SERVICE, [])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
