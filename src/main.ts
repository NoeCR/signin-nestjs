import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { AllExceptionsFilter } from './error/exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  // app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(AppModule.port);
}
bootstrap();
