import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ESSA É A LINHA MÁGICA QUE LIBERA O ACESSO:
  app.enableCors(); 
  
  await app.listen(3000);
}
bootstrap();