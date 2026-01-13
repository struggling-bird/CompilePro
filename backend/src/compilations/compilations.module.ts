import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompilationsService } from './compilations.service';
import { CompilationsController } from './compilations.controller';
import { Compilation } from './entities/compilation.entity';
import { TemplateVersion } from '../templates/entities/template-version.entity';
import { TemplateGlobalConfig } from '../templates/entities/template-global-config.entity';
import { TemplateModule } from '../templates/entities/template-module.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Compilation,
      TemplateVersion,
      TemplateGlobalConfig,
      TemplateModule,
    ]),
  ],
  controllers: [CompilationsController],
  providers: [CompilationsService],
  exports: [CompilationsService],
})
export class CompilationsModule {}
