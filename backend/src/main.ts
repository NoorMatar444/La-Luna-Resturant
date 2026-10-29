import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

async function createApp(): Promise<INestApplication> {
  // rawBody keeps the exact bytes Stripe signed, on req.rawBody.
  const app = await NestFactory.create(AppModule, { rawBody: true });
  // FRONTEND_URL can list several sites, separated by commas.
  const origins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins });
  // Drop unknown fields and convert request strings into the DTO types.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  return app;
}

let server: Promise<(req: Request, res: Response) => void> | undefined;

// Vercel calls this exported handler instead of opening a port.
export default async function handler(req: Request, res: Response) {
  server ??= createApp().then(async (app) => {
    await app.init();
    return app.getHttpAdapter().getInstance();
  });
  (await server)(req, res);
}

if (!process.env.VERCEL) {
  void createApp().then((app) => app.listen(process.env.PORT ?? 3000));
}
