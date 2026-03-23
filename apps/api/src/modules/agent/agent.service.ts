import { Injectable } from '@nestjs/common';
import { ToolsService } from '../tools/tools.service';
import { CasesService } from '../cases/cases.service';
import { ClawService } from '../claw/claw.service';
import { SearchService } from '../search/search.service';

type AgentQueryInput = {
  type: 'tools' | 'cases' | 'claw' | 'search';
  q?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
};

@Injectable()
export class AgentService {
  constructor(
    private tools: ToolsService,
    private cases: CasesService,
    private claw: ClawService,
    private search: SearchService,
  ) {}

  async query(payload: AgentQueryInput) {
    const page = payload.page || 1;
    const limit = payload.limit || 10;
    let data: any;

    switch (payload.type) {
      case 'tools':
        data = await this.tools.listTools({
          page,
          limit,
          categoryId: payload.categoryId,
        });
        break;
      case 'cases':
        data = await this.cases.listCases(page, limit);
        break;
      case 'claw':
        data = await this.claw.listClawTools(page, limit);
        break;
      case 'search':
        data = await this.search.search(payload.q ?? '', page, limit);
        break;
      default:
        data = { error: 'unknown query type' };
    }

    return {
      type: payload.type,
      query: payload.q ?? '',
      timestamp: new Date().toISOString(),
      data,
    };
  }

  buildWebhookAck(event: string, signatureValid: boolean) {
    return {
      event,
      accepted: signatureValid,
      receivedAt: new Date().toISOString(),
    };
  }
}
