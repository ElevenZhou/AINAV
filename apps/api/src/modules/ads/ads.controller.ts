import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { AdsService } from './ads.service';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('slots')
  getSlots() {
    return this.adsService.getSlots();
  }

  @Get('slot/:code')
  getSlotAd(@Param('code') code: string) {
    return this.adsService.getActiveAdForSlot(code);
  }

  @Post('impression/:id')
  recordImpression(@Param('id') id: string) {
    return this.adsService.recordImpression(id);
  }

  @Post('click/:id')
  recordClick(@Param('id') id: string) {
    return this.adsService.recordClick(id);
  }
}
