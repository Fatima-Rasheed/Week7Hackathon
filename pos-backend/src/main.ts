import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, Request, Response } from 'express';
import serverless from 'serverless-http';

let server: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // ✅ CORS (allow frontend)
  app.enableCors({
    origin: '*', // change to your frontend URL later
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true,
  });

  // ✅ Body size config
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // ✅ Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ API prefix
  app.setGlobalPrefix('api');

  // 🚀 IMPORTANT (for serverless)
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp);
}

// ✅ Vercel handler (NO listen())
export default async function handler(req: Request, res: Response) {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
}