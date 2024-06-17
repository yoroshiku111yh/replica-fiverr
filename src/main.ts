import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix("/api");

  const config = new DocumentBuilder()
    .setTitle('Fiverr Swagger')
    .setDescription("Api Fiverr")
    .setVersion('1.0')
    .addBearerAuth({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    }, "access-token")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, document);

  await app.listen(8080);
}
bootstrap();
