import { Module } from '@nestjs/common';
import { CallsGateway } from './calls.gateway';
import { CallsService } from './calls.service';

@Module({
  providers: [CallsGateway, CallsService]
})
export class CallsModule {}
