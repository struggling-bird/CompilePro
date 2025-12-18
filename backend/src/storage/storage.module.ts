import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { FileEntity } from './file.entity';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { StorageStrategyResolver } from './strategies/storage-strategy.resolver';
import { AuditModule } from '../audit/audit.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), AuditModule, RedisModule],
  controllers: [StorageController],
  providers: [StorageService, LocalStorageStrategy, StorageStrategyResolver],
  exports: [StorageService, StorageStrategyResolver],
})
export class StorageModule {}
