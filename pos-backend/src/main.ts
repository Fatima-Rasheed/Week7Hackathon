import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded, Request, Response } from 'express';
import serverless from 'serverless-http';

let server: any;

async function bootstrap() {
  console.log('1️⃣ bootstrap started');
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

  const app = await NestFactory.create(AppModule, { bodyParser: false });
  console.log('2️⃣ app created');

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true,
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  console.log('3️⃣ calling app.init()...');
  await app.init();
  console.log('4️⃣ app initialized successfully');

  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp);
}

export default async function handler(req: Request, res: Response) {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
}