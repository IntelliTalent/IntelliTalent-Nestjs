import { NestFactory } from '@nestjs/core';
import { NotifierModule } from './notifier.module';

async function bootstrap() {
  const app = await NestFactory.create(NotifierModule);

  app.startAllMicroservices();
  console.log('Notifier service is running');
}
bootstrap();
