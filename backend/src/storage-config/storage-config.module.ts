import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageConfigController } from './storage-config.controller';
import { StorageConfigService } from './storage-config.service';
import { StorageConfig } from './entities/storage-config.entity';
import { StorageConfigHistory } from './entities/storage-config-history.entity';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([StorageConfig, StorageConfigHistory]),
    ConfigModule,
  ],
  controllers: [StorageConfigController],
  providers: [StorageConfigService],
  exports: [StorageConfigService],
})
export class StorageConfigModule {}
