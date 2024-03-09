import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { SharedService } from '@app/shared';
import {
  ServiceName,
  mapServiceNameToQueueName,
} from '@app/shared/config/environment.constants';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);

  const sharedService = app.get(SharedService);

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.USER_SERVICE),
    ),
  );
  app.startAllMicroservices();
  app.init();
  console.log('User service is running');
}
bootstrap();
