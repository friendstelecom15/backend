import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ FORCE Swagger to load in production
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FD Telecom API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = Number(process.env.PORT) || 8080;

  await app.listen(port, '0.0.0.0');

  console.log(`API Running: ${port}`);
  console.log(`Swagger: https://friends-be-production.up.railway.app/api/docs`);
}

bootstrap();
