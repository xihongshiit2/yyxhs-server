import { Module } from '@nestjs/common';
import { AppLogger } from './logger.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}
