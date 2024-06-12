import { NestFactory } from '@nestjs/core';
import { NotifierModule } from './notifier.module';
import {
  ServiceName,
  SharedService,
  mapServiceNameToQueueName,
} from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(NotifierModule);

  const sharedService = app.get(SharedService);

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.NOTIFIER_SERVICE),
    ),
  );

  app.startAllMicroservices();
  app.init(); // this is impoortant for the cron jobs
  console.log('Notifier service is running');
}
bootstrap();
