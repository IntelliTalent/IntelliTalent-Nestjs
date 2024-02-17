import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Constants, ServiceName, SharedModule } from '@app/shared';
import getConfigVariables from '@app/shared/config/configVariables.config';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    JwtModule.registerAsync({
      useFactory: async () => {
        const jwtSecret = await getConfigVariables(Constants.JWT.secret);
        const jwtExpiresIn = await getConfigVariables(Constants.JWT.expiresIn);
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
