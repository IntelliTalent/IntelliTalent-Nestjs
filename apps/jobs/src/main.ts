import { NestFactory } from '@nestjs/core';
import { JobsModule } from './jobs.module';
import { ServiceName, SharedService, mapServiceNameToQueueName } from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(JobsModule);


  const sharedService = app.get(SharedService);

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.JOB_SERVICE),
    ),
  );


  app.startAllMicroservices();
  app.init()
  console.log('Jobs service is running');
}
bootstrap();
