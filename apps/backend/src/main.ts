import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (origin: string, callback: any) => {
      // Sempre permite se não tiver origin (ex: chamadas server-to-server locais) ou se for a URL exata do FRONTEND configurada
      if (!origin || origin === process.env.FRONTEND_URL) {
        callback(null, true);
      } 
      // Se estiver em desenvolvimento, aceita localhost e IPs da rede local
      else if (isDevelopment && (origin.includes('localhost') || origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/) || origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:\d+$/))) {
        callback(null, true);
      } 
      // Caso contrário, bloqueia
      else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  const porta = process.env.PORT ?? 3000;
  await app.listen(porta, '0.0.0.0');
  
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Aplicação iniciada na porta ${porta}`);
  logger.log(`🌍 Ambiente atual (NODE_ENV): ${process.env.NODE_ENV || 'não definido (assume desenvolvimento)'}`);
}
bootstrap();
