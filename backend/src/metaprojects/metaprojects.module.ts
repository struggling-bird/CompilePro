import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaProject } from './metaproject.entity';
import { ProjectVersion } from './version.entity';
import { VersionConfig } from './version_config.entity';
import { MetaprojectsService } from './metaprojects.service';
import { MetaprojectsController } from './metaprojects.controller';
import { AuditModule } from '../audit/audit.module';
import { RedisModule } from '../redis/redis.module';
import { GitlabModule } from '../gitlab/gitlab.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetaProject, ProjectVersion, VersionConfig]),
    AuditModule,
    RedisModule,
    GitlabModule,
  ],
  providers: [MetaprojectsService],
  controllers: [MetaprojectsController],
})
export class MetaprojectsModule {}
