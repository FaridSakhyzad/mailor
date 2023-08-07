import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createConnection } from 'mysql';

export const connection = createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'cf-future'
});

connection.connect();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(3031);
}

bootstrap();
