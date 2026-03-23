import { Controller, Get, Param, Query } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { QueryToolDto } from './dto/tool.dto';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Get()
  getTools(@Query() query: QueryToolDto) {
    return this.toolsService.listTools(query);
  }

  @Get('top')
  getTopTools(@Query('limit') limit?: string) {
    return this.toolsService.getTopTools(Number(limit) || 10);
  }

  @Get('pending')
  getPendingQueue() {
    return this.toolsService.getPendingQueue();
  }

  @Get(':slug')
  getToolBySlug(@Param('slug') slug: string) {
    return this.toolsService.getToolBySlug(slug);
  }
}
