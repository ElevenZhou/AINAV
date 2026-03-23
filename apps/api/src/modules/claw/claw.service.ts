import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ToolStatus } from '@prisma/client';

@Injectable()
export class ClawService {
  constructor(private prisma: PrismaService) {}

  async listClawTools(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      this.prisma.tool.count({ where: { isClaw: true, status: ToolStatus.PUBLISHED } }),
      this.prisma.tool.findMany({
        where: { isClaw: true, status: ToolStatus.PUBLISHED },
        skip,
        take: limit,
        orderBy: [{ hotScore: 'desc' }, { updatedAt: 'desc' }],
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getFeatured(limit = 6) {
    return this.prisma.tool.findMany({
      where: { isClaw: true, status: ToolStatus.PUBLISHED },
      orderBy: { hotScore: 'desc' },
      take: limit,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }
}
