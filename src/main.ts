import { NestFactory } from '@nestjs/core';
import { HelloModule } from './hello/hello.module';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    cors: false,
    snapshot:true
  });
  await app.listen(process.env.HTTP_PORT ?? 3000, '0.0.0.0');
}
bootstrap();
