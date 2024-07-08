import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@app/shared/filters/all-exception.filter';
import getConfigVariables from '@app/shared/config/configVariables.config';
import { Constants } from '@app/shared';
import * as fs from 'fs';

async function bootstrap() {


  const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  // enable cors
  app.enableCors({
    origin: '*',
  });

  // use validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    enableDebugMessages: true,
  }));

  // set global prefix
  app.setGlobalPrefix('api/v1');

  // Catch general exceptions
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // use swagger documentation
  const config = new DocumentBuilder()
    .setTitle('IntelliTalent')
    .setDescription('The IntelliTalent API documentation.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: 'Please enter token in following format: <JWT>',
        name: 'authorization',
        bearerFormat: 'Bearer <JWT>',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'authorization',
    )
    .addSecurityRequirements('bearer')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(await getConfigVariables(Constants.APPPORT));
}

bootstrap();
