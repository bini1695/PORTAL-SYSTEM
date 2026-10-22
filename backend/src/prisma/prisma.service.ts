import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    this.logger.log('🔄 Attempting to connect to the MySQL database...');
    try {
      await this.$connect();
      this.logger.log('✅ Successfully connected to the MySQL database!');
    } catch (error) {
      this.logger.error('❌ Failed to connect to the MySQL database!');
      this.logger.error(error);
      process.exit(1); // Stop the app if DB fails
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}