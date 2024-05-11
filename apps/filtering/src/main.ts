import { NestFactory } from '@nestjs/core';
import { FilteringModule } from './filtering.module';
import {
  ServiceName,
  SharedService,
  mapServiceNameToQueueName,
} from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(FilteringModule);

  console.log("Before sharedService");

  const sharedService = app.get(SharedService);

  console.log("After sharedService");

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.FILTRATION_SERVICE),
    ),
  );

  app.startAllMicroservices();
  app.init()
  console.log('Filtering service is running');
}
bootstrap();
