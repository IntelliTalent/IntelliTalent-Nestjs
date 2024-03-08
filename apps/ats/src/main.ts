import { NestFactory } from '@nestjs/core';
import { AtsModule } from './ats.module';
import { ServiceName, SharedService, mapServiceNameToQueueName } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(AtsModule);

  const sharedService = app.get(SharedService);

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.ATS_SERVICE),
    ),
  );

  app.startAllMicroservices();
  console.log('Ats service is running');
}
bootstrap();
