import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  async getTodayCase() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Try pinned first, then most recent published today
    const c = await this.prisma.dailyCase.findFirst({
      where: { publishedAt: { gte: today, lt: tomorrow } },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    });
    if (c) return c;

    // Fall back to most recent published case
    return this.prisma.dailyCase.findFirst({
      orderBy: { publishedAt: 'desc' },
    });
  }

  async listCases(page = 1, limit = 12, scenario?: string) {
    const skip = (page - 1) * limit;
    const where: any = { publishedAt: { lte: new Date() } };
    if (scenario) where.scenario = scenario;

    const [total, items] = await Promise.all([
      this.prisma.dailyCase.count({ where }),
      this.prisma.dailyCase.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getCaseById(id: string) {
    const c = await this.prisma.dailyCase.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Case not found');
    return c;
  }

  async createCase(data: any) {
    return this.prisma.dailyCase.create({ data });
  }

  async updateCase(id: string, data: any) {
    return this.prisma.dailyCase.update({ where: { id }, data });
  }

  async deleteCase(id: string) {
    return this.prisma.dailyCase.delete({ where: { id } });
  }

  async getScenarios(): Promise<string[]> {
    const rows = await this.prisma.dailyCase.groupBy({
      by: ['scenario'],
      _count: true,
    });
    return rows.map((r) => r.scenario);
  }
}
