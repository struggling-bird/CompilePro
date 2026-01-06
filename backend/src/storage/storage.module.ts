import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { FileEntity } from './file.entity';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { StorageStrategyResolver } from './strategies/storage-strategy.resolver';
import { AuditModule } from '../audit/audit.module';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';

import { StorageAnalysisService } from './storage-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    AuditModule,
    RedisModule,
    UsersModule,
  ],
  controllers: [StorageController],
  providers: [
    StorageService,
    StorageAnalysisService,
    LocalStorageStrategy,
    StorageStrategyResolver,
  ],
  exports: [StorageService, StorageAnalysisService, StorageStrategyResolver],
})
export class StorageModule {}
