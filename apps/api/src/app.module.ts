import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./common/health.controller";
import { PrismaModule } from "./common/prisma/prisma.module";
import { ToolsModule } from "./modules/tools/tools.module";
import { SearchModule } from "./modules/search/search.module";
import { CasesModule } from "./modules/cases/cases.module";
import { AdsModule } from "./modules/ads/ads.module";
import { AgentModule } from "./modules/agent/agent.module";
import { ClawModule } from "./modules/claw/claw.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { AdminModule } from "./modules/admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../../.env", ".env"] }),
    PrismaModule,
    ToolsModule,
    SearchModule,
    CasesModule,
    AdsModule,
    AgentModule,
    ClawModule,
    CategoriesModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
