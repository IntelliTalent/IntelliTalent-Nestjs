import { Module } from '@nestjs/common';
import { ServiceName, SharedModule } from '@app/shared';
import { JwtStrategy } from './strategies/jwt.staratgy';
import { LocalStrategy } from './strategies/local.strategy';
import { ApiAuthController } from './auth.controller';

@Module({
  // assign the RabbitMQ queues (Auth) to the AuthController
  imports: [
    SharedModule.registerRmq(ServiceName.AUTH_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
  ],
  controllers: [ApiAuthController],
  providers: [LocalStrategy, JwtStrategy],
})
export class ApiAuthModule {}
