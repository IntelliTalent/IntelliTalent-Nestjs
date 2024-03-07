import { NestFactory } from '@nestjs/core';
import { FilteringModule } from './filtering.module';

async function bootstrap() {
  const app = await NestFactory.create(FilteringModule);
  await app.listen(3000);
}
bootstrap();
