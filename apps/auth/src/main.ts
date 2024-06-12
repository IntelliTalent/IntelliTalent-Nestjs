import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { SharedService } from '@app/shared';
import {
  ServiceName,
  mapServiceNameToQueueName,
} from '@app/shared/config/environment.constants';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  const sharedService = app.get(SharedService);

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.AUTH_SERVICE),
    ),
  );

  app.startAllMicroservices();
  app.init()
  console.log('Auth service is running');
}
bootstrap();
