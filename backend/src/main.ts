import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configurado para todos los orígenes de KIPU
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://kippulab.com',
      'https://www.kippulab.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Accept',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Backend corriendo en puerto ${process.env.PORT || 3000}`);
}
bootstrap();