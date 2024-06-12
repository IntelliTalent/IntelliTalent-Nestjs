import { NestFactory, Reflector } from '@nestjs/core';
import { UserModule } from './user.module';
import { SharedService } from '@app/shared';
import {
  ServiceName,
  mapServiceNameToQueueName,
} from '@app/shared/config/environment.constants';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const sharedService = app.get(SharedService);

  app.connectMicroservice(
    await sharedService.getRmqOptions(
      await mapServiceNameToQueueName(ServiceName.USER_SERVICE),
    ),
  );

  app.startAllMicroservices();
  app.init();
  app.listen(3005);
  console.log('User service is running');
}
bootstrap();
