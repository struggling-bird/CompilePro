import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { GitlabModule } from '../gitlab/gitlab.module';
import { WorkspaceModule } from '../workspace/workspace.module';
import { UsersModule } from '../users/users.module';
import { MetaprojectsModule } from '../metaprojects/metaprojects.module';

@Module({
  imports: [GitlabModule, WorkspaceModule, UsersModule, MetaprojectsModule],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
