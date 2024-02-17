import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';
import { ApiAuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.AUTH_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.COVER_LETTER_SERVICE),
    ApiAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

