import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // it makes sure that if a user found vulenrability by sending extra details to the server, it won't put us in the ground.
    }),
  );
  await app.listen(3333);
}
bootstrap();
