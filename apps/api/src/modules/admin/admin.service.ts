import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ToolsService } from '../tools/tools.service';
import { CasesService } from '../cases/cases.service';
import { AdsService } from '../ads/ads.service';
import { CategoriesService } from '../categories/categories.service';
import { SearchService } from '../search/search.service';
import { ToolStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private tools: ToolsService,
    private cases: CasesService,
    private ads: AdsService,
    private categories: CategoriesService,
    private search: SearchService,
  ) {}

  // ── Dashboard Overview ──────────────────────────────────────────────
  async getDashboardStats() {
    const [totalTools, pendingTools, totalCases, totalCategories] = await Promise.all([
      this.prisma.tool.count({ where: { status: ToolStatus.PUBLISHED } }),
      this.prisma.tool.count({ where: { status: ToolStatus.PENDING } }),
      this.prisma.dailyCase.count(),
      this.prisma.category.count(),
    ]);
    return { totalTools, pendingTools, totalCases, totalCategories };
  }

  // ── Tools ────────────────────────────────────────────────────────────
  async listAllTools(page = 1, limit = 20, status?: ToolStatus) {
    return this.tools.listTools({ page, limit, status });
  }

  async getPendingQueue() {
    return this.tools.getPendingQueue();
  }

  async createTool(data: any, operator = 'admin') {
    const tool = await this.tools.createTool(data, operator);
    return tool;
  }

  async updateTool(id: string, data: any, operator = 'admin') {
    const tool = await this.tools.updateTool(id, data, operator);
    return tool;
  }

  async approveTool(id: string, note = '', operator = 'admin') {
    const tool = await this.tools.setStatus(id, ToolStatus.PUBLISHED, note, operator);
    // Sync to Meilisearch
    await this.search.syncToolToIndex(id);
    return tool;
  }

  async rejectTool(id: string, note = '', operator = 'admin') {
    return this.tools.setStatus(id, ToolStatus.OFFLINE, note, operator);
  }

  async offlineTool(id: string, note = '', operator = 'admin') {
    return this.tools.setStatus(id, ToolStatus.OFFLINE, note, operator);
  }

  // ── Cases ────────────────────────────────────────────────────────────
  async listCases(page = 1, limit = 20) {
    return this.cases.listCases(page, limit);
  }

  async createCase(data: any) {
    return this.cases.createCase(data);
  }

  async updateCase(id: string, data: any) {
    return this.cases.updateCase(id, data);
  }

  async deleteCase(id: string) {
    return this.cases.deleteCase(id);
  }

  // ── Ads ──────────────────────────────────────────────────────────────
  async getAdSlots() {
    return this.ads.getSlots();
  }

  async createAdSlot(code: string, name: string) {
    return this.ads.createSlot(code, name);
  }

  async createAd(data: any) {
    return this.ads.createAd(data);
  }

  async updateAd(id: string, data: any) {
    return this.ads.updateAd(id, data);
  }

  // ── Categories ───────────────────────────────────────────────────────
  async listCategories() {
    return this.categories.list();
  }

  async createCategory(data: any) {
    return this.categories.create(data);
  }

  async updateCategory(id: string, data: any) {
    return this.categories.update(id, data);
  }

  async deleteCategory(id: string) {
    return this.categories.delete(id);
  }

  // ── Search Sync ──────────────────────────────────────────────────────
  async syncSearchIndex() {
    return this.search.syncAllTools();
  }

  // ── Audit Logs ───────────────────────────────────────────────────────
  async getAuditLogs(toolId?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (toolId) where.toolId = toolId;
    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { tool: { select: { id: true, name: true, slug: true } } },
      }),
    ]);
    return { items, total, page, limit };
  }
}
