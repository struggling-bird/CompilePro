import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';
import { Template } from '../entities/template.entity';
import { TemplateVersion } from '../entities/template-version.entity';
import { TemplateGlobalConfig } from '../entities/template-global-config.entity';
import { TemplateModule } from '../entities/template-module.entity';
import { TemplateModuleConfig } from '../entities/template-module-config.entity';

export class TemplateResponseDto extends ApiResponseDto<Template> {
  @ApiProperty({ type: Template })
  declare data: Template;
}

export class TemplateListResponseDto extends ApiResponseDto<Template[]> {
  @ApiProperty({ type: [Template] })
  declare data: Template[];
}

export class TemplateVersionResponseDto extends ApiResponseDto<TemplateVersion> {
  @ApiProperty({ type: TemplateVersion })
  declare data: TemplateVersion;
}

export class GlobalConfigResponseDto extends ApiResponseDto<TemplateGlobalConfig> {
  @ApiProperty({ type: TemplateGlobalConfig })
  declare data: TemplateGlobalConfig;
}

export class ModuleResponseDto extends ApiResponseDto<TemplateModule> {
  @ApiProperty({ type: TemplateModule })
  declare data: TemplateModule;
}

export class ModuleConfigResponseDto extends ApiResponseDto<TemplateModuleConfig> {
  @ApiProperty({ type: TemplateModuleConfig })
  declare data: TemplateModuleConfig;
}
