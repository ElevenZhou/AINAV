import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ToolsModule } from '../tools/tools.module';
import { CasesModule } from '../cases/cases.module';
import { AdsModule } from '../ads/ads.module';
import { CategoriesModule } from '../categories/categories.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [ToolsModule, CasesModule, AdsModule, CategoriesModule, SearchModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
