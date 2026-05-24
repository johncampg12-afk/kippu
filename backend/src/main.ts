import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para el frontend (localhost + producción con y sin www)
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://kippulab.com',
      'https://www.kippulab.com',
    ],
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Backend corriendo en http://localhost:3000`);
}
bootstrap();