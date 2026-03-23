import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { ToolsModule } from '../tools/tools.module';
import { CasesModule } from '../cases/cases.module';
import { ClawModule } from '../claw/claw.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [ToolsModule, CasesModule, ClawModule, SearchModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
