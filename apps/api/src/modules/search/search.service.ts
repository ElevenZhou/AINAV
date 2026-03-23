import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ToolStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  private meili: MeiliSearch;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.meili = new MeiliSearch({
      host: this.config.get<string>('MEILI_HOST', 'http://localhost:7700'),
      apiKey: this.config.get<string>('MEILI_MASTER_KEY', ''),
    });
  }

  async search(q: string, page = 1, limit = 20) {
    if (!q || q.trim() === '') {
      return { query: q, hits: [], total: 0, page, limit };
    }

    try {
      const offset = (page - 1) * limit;
      const index = this.meili.index('tools');
      const result = await index.search(q, {
        limit,
        offset,
        attributesToHighlight: ['name', 'description'],
        attributesToCrop: ['description'],
        cropLength: 60,
      });
      return {
        query: q,
        hits: result.hits,
        total: result.estimatedTotalHits ?? result.hits.length,
        page,
        limit,
      };
    } catch {
      // Meilisearch not available — fall back to DB LIKE query
      const items = await this.prisma.tool.findMany({
        where: {
          status: ToolStatus.PUBLISHED,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { hotScore: 'desc' },
        include: { category: { select: { name: true, slug: true } } },
      });
      return { query: q, hits: items, total: items.length, page, limit };
    }
  }

  async syncToolToIndex(toolId: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { id: toolId },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!tool) return;
    const doc = {
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      category: tool.category.name,
      categorySlug: tool.category.slug,
      tags: tool.tags.map((tt) => tt.tag.name),
      isClaw: tool.isClaw,
      hotScore: tool.hotScore,
      status: tool.status,
    };
    try {
      await this.meili.index('tools').addDocuments([doc]);
    } catch { /* ignore if meili down */ }
  }

  async syncAllTools() {
    const tools = await this.prisma.tool.findMany({
      where: { status: ToolStatus.PUBLISHED },
      include: { category: true, tags: { include: { tag: true } } },
    });
    const docs = tools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      description: tool.description,
      category: tool.category.name,
      categorySlug: tool.category.slug,
      tags: tool.tags.map((tt) => tt.tag.name),
      isClaw: tool.isClaw,
      hotScore: tool.hotScore,
    }));
    try {
      await this.meili.index('tools').addDocuments(docs);
      return { synced: docs.length };
    } catch (e) {
      return { synced: 0, error: String(e) };
    }
  }
}
