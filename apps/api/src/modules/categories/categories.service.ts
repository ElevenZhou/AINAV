import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { tools: { where: { status: 'PUBLISHED' } } } } },
    });
  }

  async getBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: {
        tools: {
          where: { status: 'PUBLISHED' },
          orderBy: { hotScore: 'desc' },
          take: 50,
          include: { tags: { include: { tag: true } } },
        },
        _count: { select: { tools: true } },
      },
    });
  }

  async create(data: { name: string; slug: string; description?: string; iconEmoji?: string; sortOrder?: number }) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
