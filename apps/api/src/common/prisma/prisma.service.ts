import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { INestApplication } from '@nestjs/common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Call from main.ts to enable graceful shutdown with Nest
  enableShutdownHooks(app: INestApplication) {
    const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    shutdownSignals.forEach((signal) => {
      process.once(signal, async () => {
        await app.close();
      });
    });
  }
}
