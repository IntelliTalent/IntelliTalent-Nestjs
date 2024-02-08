import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SharedModule } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';

@Module({
  imports: [SharedModule.registerPostgres(ServiceName.AUTH_SERVICE, [])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
