import { NestFactory } from '@nestjs/core';
import { ProfileModule } from './profile.module';
import {
  ServiceName,
  SharedService,
  mapServiceNameToQueueName,
} from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(ProfileModule);

  const sharedService = app.get(SharedService);

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.PROFILE_SERVICE),
    ),
  );

  app.startAllMicroservices();
  app.init();
  console.log('Profile service is running');
}
bootstrap();
