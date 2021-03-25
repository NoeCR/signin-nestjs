import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const APP_NAME = process.env.npm_package_name;
  const APP_VERSION = process.env.npm_package_version;

  app.setGlobalPrefix('v1');

  const options = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription('Solution for forgetful and clueless')
    .setVersion(APP_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('docs', app, document);

  await app.listen(AppModule.port);
}
bootstrap();
