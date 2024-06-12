import { NestFactory } from '@nestjs/core';
import { QuizzesModule } from './quizzes.module';
import {
  mapServiceNameToQueueName,
  ServiceName,
  SharedService,
} from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(QuizzesModule);

  const sharedService = app.get(SharedService);

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.QUIZ_SERVICE),
    ),
  );

  app.startAllMicroservices();
  app.init();
  console.log('Quizzes service is running');
}
bootstrap();
