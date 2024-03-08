import { NestFactory } from '@nestjs/core';
import { FilteringModule } from './filtering.module';

async function bootstrap() {
  const app = await NestFactory.create(FilteringModule);
  app.startAllMicroservices();
  app.init();
  console.log('Filtering service is running');
}
bootstrap();
