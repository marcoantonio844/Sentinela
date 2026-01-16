import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DriversModule } from './drivers/drivers.module';

@Module({
  imports: [DriversModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
