import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true, credentials: true });
    app.use(cookieParser());
    await app.listen(Number(process.env.PORT) || 3000);
  } catch (err) {
    console.error('Failed to start application:', err);
    process.exit(1);
  }
}

bootstrap();
