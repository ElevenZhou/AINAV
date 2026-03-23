import { Controller, Get, Query } from '@nestjs/common';
import { ClawService } from './claw.service';

@Controller('claw')
export class ClawController {
  constructor(private readonly clawService: ClawService) {}

  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.clawService.listClawTools(Number(page) || 1, Number(limit) || 20);
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    return this.clawService.getFeatured(Number(limit) || 6);
  }
}
