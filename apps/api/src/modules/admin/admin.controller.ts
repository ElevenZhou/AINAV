import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ToolStatus } from '@prisma/client';

// Simple admin key guard via header
function requireAdmin(apiKey: string | undefined) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || apiKey !== expected) {
    throw new UnauthorizedException('Admin access denied');
  }
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Dashboard ──────────────────────────────────────────────────────
  @Get('stats')
  getStats(@Headers('x-admin-key') key: string) {
    requireAdmin(key);
    return this.adminService.getDashboardStats();
  }

  @Get('audit-logs')
  getAuditLogs(
    @Headers('x-admin-key') key: string,
    @Query('toolId') toolId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    requireAdmin(key);
    return this.adminService.getAuditLogs(toolId, Number(page) || 1, Number(limit) || 20);
  }

  // ── Tools ──────────────────────────────────────────────────────────
  @Get('tools')
  listTools(
    @Headers('x-admin-key') key: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ToolStatus,
  ) {
    requireAdmin(key);
    return this.adminService.listAllTools(Number(page) || 1, Number(limit) || 20, status);
  }

  @Get('tools/pending')
  getPendingQueue(@Headers('x-admin-key') key: string) {
    requireAdmin(key);
    return this.adminService.getPendingQueue();
  }

  @Post('tools')
  createTool(@Headers('x-admin-key') key: string, @Body() body: any) {
    requireAdmin(key);
    return this.adminService.createTool(body);
  }

  @Put('tools/:id')
  updateTool(@Headers('x-admin-key') key: string, @Param('id') id: string, @Body() body: any) {
    requireAdmin(key);
    return this.adminService.updateTool(id, body);
  }

  @Post('tools/:id/approve')
  approveTool(
    @Headers('x-admin-key') key: string,
    @Param('id') id: string,
    @Body('note') note?: string,
  ) {
    requireAdmin(key);
    return this.adminService.approveTool(id, note);
  }

  @Post('tools/:id/reject')
  rejectTool(
    @Headers('x-admin-key') key: string,
    @Param('id') id: string,
    @Body('note') note?: string,
  ) {
    requireAdmin(key);
    return this.adminService.rejectTool(id, note);
  }

  @Post('tools/:id/offline')
  offlineTool(
    @Headers('x-admin-key') key: string,
    @Param('id') id: string,
    @Body('note') note?: string,
  ) {
    requireAdmin(key);
    return this.adminService.offlineTool(id, note);
  }

  // ── Cases ──────────────────────────────────────────────────────────
  @Get('cases')
  listCases(
    @Headers('x-admin-key') key: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    requireAdmin(key);
    return this.adminService.listCases(Number(page) || 1, Number(limit) || 20);
  }

  @Post('cases')
  createCase(@Headers('x-admin-key') key: string, @Body() body: any) {
    requireAdmin(key);
    return this.adminService.createCase(body);
  }

  @Put('cases/:id')
  updateCase(@Headers('x-admin-key') key: string, @Param('id') id: string, @Body() body: any) {
    requireAdmin(key);
    return this.adminService.updateCase(id, body);
  }

  @Delete('cases/:id')
  deleteCase(@Headers('x-admin-key') key: string, @Param('id') id: string) {
    requireAdmin(key);
    return this.adminService.deleteCase(id);
  }

  // ── Ads ────────────────────────────────────────────────────────────
  @Get('ads/slots')
  getAdSlots(@Headers('x-admin-key') key: string) {
    requireAdmin(key);
    return this.adminService.getAdSlots();
  }

  @Post('ads/slots')
  createAdSlot(
    @Headers('x-admin-key') key: string,
    @Body('code') code: string,
    @Body('name') name: string,
  ) {
    requireAdmin(key);
    return this.adminService.createAdSlot(code, name);
  }

  @Post('ads')
  createAd(@Headers('x-admin-key') key: string, @Body() body: any) {
    requireAdmin(key);
    return this.adminService.createAd(body);
  }

  @Put('ads/:id')
  updateAd(@Headers('x-admin-key') key: string, @Param('id') id: string, @Body() body: any) {
    requireAdmin(key);
    return this.adminService.updateAd(id, body);
  }

  // ── Categories ─────────────────────────────────────────────────────
  @Get('categories')
  listCategories(@Headers('x-admin-key') key: string) {
    requireAdmin(key);
    return this.adminService.listCategories();
  }

  @Post('categories')
  createCategory(@Headers('x-admin-key') key: string, @Body() body: any) {
    requireAdmin(key);
    return this.adminService.createCategory(body);
  }

  @Put('categories/:id')
  updateCategory(
    @Headers('x-admin-key') key: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    requireAdmin(key);
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Headers('x-admin-key') key: string, @Param('id') id: string) {
    requireAdmin(key);
    return this.adminService.deleteCategory(id);
  }

  // ── Search Sync ────────────────────────────────────────────────────
  @Post('search/sync')
  syncSearch(@Headers('x-admin-key') key: string) {
    requireAdmin(key);
    return this.adminService.syncSearchIndex();
  }
}
