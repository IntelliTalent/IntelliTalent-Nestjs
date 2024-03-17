import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorInterceptor } from '@app/shared/interceptors/error.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@app/shared/filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable cors
  app.enableCors({
    origin: '*',
  });

  // use validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // set global prefix
  app.setGlobalPrefix('api/v1');

  // Catch general exceptions
  app.useGlobalFilters(new AllExceptionsFilter());

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

  await app.listen(3000);
}

bootstrap();
