import { NestFactory } from '@nestjs/core';
import { JobsModule } from './jobs.module';

async function bootstrap() {
  const app = await NestFactory.create(JobsModule);

  app.startAllMicroservices();
  console.log('Jobs service is running');
}
bootstrap();
