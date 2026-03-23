import { Module } from '@nestjs/common';
import { ClawController } from './claw.controller';
import { ClawService } from './claw.service';

@Module({
  controllers: [ClawController],
  providers: [ClawService],
  exports: [ClawService],
})
export class ClawModule {}
