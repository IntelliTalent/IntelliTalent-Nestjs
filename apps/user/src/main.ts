import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { SharedService } from '@app/shared';
import { QueuesName } from '@app/shared/config/environment.constants';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);

  const sharedService = app.get(SharedService);

  app.connectMicroservice(sharedService.getRmqOptions(QueuesName.USER_QUEUE));
  app.startAllMicroservices();
  console.log('User service is running');
}
bootstrap();
