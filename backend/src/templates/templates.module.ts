import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { Template } from './entities/template.entity';
import { TemplateVersion } from './entities/template-version.entity';
import { TemplateGlobalConfig } from './entities/template-global-config.entity';
import { TemplateModule } from './entities/template-module.entity';
import { TemplateModuleConfig } from './entities/template-module-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Template,
      TemplateVersion,
      TemplateGlobalConfig,
      TemplateModule,
      TemplateModuleConfig,
    ]),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
