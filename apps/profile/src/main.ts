import { NestFactory } from '@nestjs/core';
import { ProfileModule } from './profile.module';

async function bootstrap() {
  const app = await NestFactory.create(ProfileModule);
  app.startAllMicroservices();
console.log('Profile service is running');
}
bootstrap();
