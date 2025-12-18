import { Injectable, Inject } from '@nestjs/common';
import { StorageStrategy } from './storage-strategy.interface';
import { LocalStorageStrategy } from './local-storage.strategy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageStrategyResolver {
  private strategies: Map<string, StorageStrategy> = new Map();

  constructor(
    @Inject(LocalStorageStrategy) local: LocalStorageStrategy,
    private readonly config: ConfigService,
  ) {
    this.strategies.set('local', local);
    // Future: this.strategies.set('s3', s3Strategy);
    // Future: this.strategies.set('oss', ossStrategy);
  }

  resolve(type?: string): StorageStrategy {
    const defaultType =
      this.config.get<string>('STORAGE_DEFAULT_TYPE') ?? 'local';
    const target = type ?? defaultType;
    const strategy = this.strategies.get(target);
    if (!strategy) {
      throw new Error(`未找到存储策略 ${target}`);
    }
    return strategy;
  }
}
