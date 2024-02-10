import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import {
  QueuesName,
  ServiceName,
} from '@app/shared/config/environment.constants';

@Module({
  imports: [
    SharedModule.registerRmq(ServiceName.AUTH_SERVICE, QueuesName.AUTH_QUEUE),
    SharedModule.registerRmq(ServiceName.USER_SERVICE, QueuesName.USER_QUEUE),
    SharedModule.registerRmq(
      ServiceName.COVER_LETTER_SERVICE,
      QueuesName.COVER_LETTER_QUEUE,
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
