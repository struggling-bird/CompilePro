import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { RedisModule } from '../redis/redis.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [RedisModule, LoggerModule],
  providers: [WorkspaceService],
  controllers: [WorkspaceController],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
