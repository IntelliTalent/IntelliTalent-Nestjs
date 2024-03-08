import { NestFactory } from '@nestjs/core';
import { AutofillModule } from './autofill.module';

async function bootstrap() {
  const app = await NestFactory.create(AutofillModule);
  app.startAllMicroservices();
console.log('Autofill service is running');
}
bootstrap();
