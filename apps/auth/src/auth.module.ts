import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Constants, ServiceName, SharedModule } from '@app/shared';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { Token } from '@app/shared/entities/token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.NOTIFIER_SERVICE),
    JwtModule.registerAsync({
      useFactory: async () => {
        const jwtSecret = getConfigVariables(Constants.JWT.secret);
        const jwtExpiresIn = getConfigVariables(Constants.JWT.expiresIn);
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    SharedModule.registerPostgres(ServiceName.AUTH_SERVICE, [Token]),
  ],

  controllers: [AuthController],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
