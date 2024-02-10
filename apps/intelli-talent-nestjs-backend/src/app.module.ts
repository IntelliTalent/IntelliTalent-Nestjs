import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { ServiceName } from '@app/shared/config/environment.constants';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.AUTH_SERVICE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE),
    SharedModule.registerRmq(ServiceName.COVER_LETTER_SERVICE),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
