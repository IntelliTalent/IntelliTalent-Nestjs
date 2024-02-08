import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { SharedService } from '@app/shared';
import { QueuesName } from '@app/shared/config/environment.constants';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  const sharedService = app.get(SharedService);

  app.connectMicroservice(sharedService.getRmqOptions(QueuesName.AUTH_QUEUE));
  app.startAllMicroservices();
  console.log('Auth service is running');
}
bootstrap();
