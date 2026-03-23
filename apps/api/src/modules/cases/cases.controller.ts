import { Controller, Get, Param, Query } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get('daily')
  getTodayCase() {
    return this.casesService.getTodayCase();
  }

  @Get('scenarios')
  getScenarios() {
    return this.casesService.getScenarios();
  }

  @Get()
  listCases(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('scenario') scenario?: string,
  ) {
    return this.casesService.listCases(Number(page) || 1, Number(limit) || 12, scenario);
  }

  @Get(':id')
  getCaseById(@Param('id') id: string) {
    return this.casesService.getCaseById(id);
  }
}
