import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ToolStatus } from '@prisma/client';
import { CreateToolDto, UpdateToolDto, QueryToolDto } from './dto/tool.dto';

@Injectable()
export class ToolsService {
  constructor(private prisma: PrismaService) {}

  private buildSearchText(input: {
    name?: string;
    description?: string;
    categoryName?: string;
    tags?: string[];
  }) {
    return [input.name, input.description, input.categoryName, ...(input.tags ?? [])]
      .filter(Boolean)
      .join(' ');
  }

  async listTools(query: QueryToolDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;
    else where.status = ToolStatus.PUBLISHED;
    if (query.isClaw !== undefined) where.isClaw = String(query.isClaw) === 'true';

    const [total, items] = await Promise.all([
      this.prisma.tool.count({ where }),
      this.prisma.tool.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ hotScore: 'desc' }, { updatedAt: 'desc' }],
        include: {
          category: { select: { id: true, name: true, slug: true } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
      }),
    ]);

    return {
      items: items.map((t) => ({
        ...t,
        tags: t.tags.map((tt) => tt.tag),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getToolBySlug(slug: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
    if (!tool) throw new NotFoundException('Tool not found');
    // Increment view count asynchronously
    this.prisma.tool.update({ where: { slug }, data: { viewCount: { increment: 1 } } }).catch(() => {});
    return { ...tool, tags: tool.tags.map((tt) => tt.tag) };
  }

  async getTopTools(limit = 10) {
    const items = await this.prisma.tool.findMany({
      where: { status: ToolStatus.PUBLISHED },
      orderBy: { hotScore: 'desc' },
      take: limit,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return items;
  }

  async createTool(dto: CreateToolDto, operator = 'system') {
    const { tags, ...data } = dto;
    const category = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
    const tagRows = tags?.length
      ? await this.prisma.tag.findMany({ where: { id: { in: tags } } })
      : [];
    const tool = await this.prisma.tool.create({
      data: {
        ...data,
        searchText: this.buildSearchText({
          name: data.name,
          description: data.description,
          categoryName: category?.name,
          tags: tagRows.map((t) => t.name),
        }),
        tags: tags?.length
          ? { create: tags.map((tagId) => ({ tagId })) }
          : undefined,
        auditLogs: {
          create: { action: 'EDIT', operator, note: 'Created' },
        },
      },
      include: { category: true, tags: { include: { tag: true } } },
    });
    return { ...tool, tags: tool.tags.map((tt) => tt.tag) };
  }

  async updateTool(id: string, dto: UpdateToolDto, operator = 'admin') {
    const { tags, ...data } = dto;
    const current = await this.prisma.tool.findUnique({
      where: { id },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!current) {
      throw new NotFoundException('Tool not found');
    }

    const categoryName = data.categoryId
      ? (await this.prisma.category.findUnique({ where: { id: data.categoryId } }))?.name
      : current.category.name;
    const tagNames = tags !== undefined
      ? (await this.prisma.tag.findMany({ where: { id: { in: tags } } })).map((t) => t.name)
      : current.tags.map((tt) => tt.tag.name);

    const tool = await this.prisma.tool.update({
      where: { id },
      data: {
        ...data,
        searchText: this.buildSearchText({
          name: data.name ?? current.name,
          description: data.description ?? current.description,
          categoryName,
          tags: tagNames,
        }),
        ...(tags !== undefined && {
          tags: {
            deleteMany: {},
            create: tags.map((tagId) => ({ tagId })),
          },
        }),
        auditLogs: {
          create: { action: 'EDIT', operator, note: 'Updated' },
        },
      },
      include: { category: true, tags: { include: { tag: true } } },
    });
    return { ...tool, tags: tool.tags.map((tt) => tt.tag) };
  }

  async setStatus(id: string, status: ToolStatus, note = '', operator = 'admin') {
    const actionMap: Record<ToolStatus, any> = {
      PUBLISHED: 'APPROVE',
      OFFLINE: 'OFFLINE',
      PENDING: 'REVIVE',
    };
    const tool = await this.prisma.tool.update({
      where: { id },
      data: {
        status,
        auditLogs: { create: { action: actionMap[status], operator, note } },
      },
    });
    return tool;
  }

  async getPendingQueue() {
    return this.prisma.tool.findMany({
      where: { status: ToolStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: { category: true },
    });
  }
}
