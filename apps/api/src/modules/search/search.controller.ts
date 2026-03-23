import { Controller, Get, Post, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') q = '',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchService.search(q, Number(page) || 1, Number(limit) || 20);
  }

  @Post('sync')
  syncAll() {
    return this.searchService.syncAllTools();
  }
}
