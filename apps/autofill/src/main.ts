import { NestFactory } from '@nestjs/core';
import { AutofillModule } from './autofill.module';
import {
  ServiceName,
  SharedService,
  mapServiceNameToQueueName,
} from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AutofillModule);

  const sharedService = app.get(SharedService);

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.AUTOFILL_SERVICE),
    ),
  );

  app.startAllMicroservices();
  app.init()
  console.log('Autofill service is running');
}
bootstrap();
