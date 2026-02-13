import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Provide a safe fallback for test / CI environments where DATABASE_URL is not injected.
    const fallback = 'file:./dev.db';
    const effectiveUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0
      ? process.env.DATABASE_URL
      : fallback;

    if (!process.env.DATABASE_URL) {
      // Surface a single clear warning but continue so tests / local builds don't explode.
      // In production (container) DATABASE_URL is always set via Dockerfile/ENV.
      // eslint-disable-next-line no-console
      console.warn(`[PrismaService] DATABASE_URL not set – using fallback '${fallback}'.`);
    }

    super({
      datasources: {
        db: { url: effectiveUrl },
      },
      log: ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    // Enable WAL journal mode and set busy timeout for better concurrent write handling.
    // SQLite default journal mode (DELETE) serialises writes aggressively; WAL allows
    // readers and a single writer to proceed concurrently, which prevents the Prisma
    // interactive-transaction timeout that occurs under load (e.g. SCIM validator).
    try {
      const walResult = await this.$queryRawUnsafe<Array<{ journal_mode: string }>>('PRAGMA journal_mode = WAL;');
      const busyResult = await this.$queryRawUnsafe<Array<{ busy_timeout: number }>>('PRAGMA busy_timeout = 15000;');
      this.logger.log(`SQLite PRAGMAs set: journal_mode=${JSON.stringify(walResult)}, busy_timeout=${JSON.stringify(busyResult)}`);
    } catch (err) {
      // Non-fatal: if the database is not SQLite (e.g. tests with in-memory), silently skip.
      this.logger.warn(`Could not set SQLite PRAGMAs: ${err instanceof Error ? err.message : String(err)}`);
    }

    this.logger.log('Database connected successfully');
    this.logger.log(`Using database: ${process.env.DATABASE_URL || 'file:./dev.db (fallback)'}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
