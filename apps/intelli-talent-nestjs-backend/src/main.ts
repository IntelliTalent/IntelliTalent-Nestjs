
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorInterceptor } from '@app/shared/interceptors/error.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  // use global error interceptor
  app.useGlobalInterceptors(new ErrorInterceptor());

  // use swagger documentation
  const config = new DocumentBuilder()
    .setTitle('IntelliTalent')
    .setDescription('The IntelliTalent API documentation.')
    .setVersion('1.0')
    .addTag('intellitalent')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(3000);
}

bootstrap();
