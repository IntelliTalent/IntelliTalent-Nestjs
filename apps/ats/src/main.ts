import { NestFactory } from '@nestjs/core';
import { AtsModule } from './ats.module';

async function bootstrap() {
  const app = await NestFactory.create(AtsModule);



  app.startAllMicroservices();
  console.log('Ats service is running');
}
bootstrap();
