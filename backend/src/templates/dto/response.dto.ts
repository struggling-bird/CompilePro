import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';
import { Template } from '../entities/template.entity';
import { TemplateVersion } from '../entities/template-version.entity';
import { TemplateGlobalConfig } from '../entities/template-global-config.entity';
import { TemplateModule } from '../entities/template-module.entity';
import { TemplateModuleConfig } from '../entities/template-module-config.entity';

// --- Simplified DTOs for Creation Response ---

export class TemplateVersionSimple extends PickType(TemplateVersion, [
  'id',
  'version',
  'createdAt',
  'isBranch',
  'baseVersion',
  'status',
  'buildDoc',
  'updateDoc',
  'description',
  'versionType',
  'creator',
  'templateId',
  'parentId',
] as const) {}

export class TemplateSimple extends PickType(Template, [
  'id',
  'name',
  'description',
  'isEnabled',
  'latestVersion',
  'author',
  'updater',
  'createdAt',
  'updatedAt',
] as const) {
  @ApiProperty({
    type: [TemplateVersionSimple],
    description: '版本列表（仅基础信息）',
  })
  versions: TemplateVersionSimple[];
}

export class TemplateBasic extends PickType(Template, [
  'id',
  'name',
  'description',
  'isEnabled',
  'latestVersion',
  'author',
  'updater',
  'createdAt',
  'updatedAt',
] as const) {}

export class TemplateCreateResponseDto extends ApiResponseDto<TemplateSimple> {
  @ApiProperty({ type: TemplateSimple })
  declare data: TemplateSimple;
}

// --- Standard DTOs ---

export class TemplateResponseDto extends ApiResponseDto<Template> {
  @ApiProperty({ type: Template })
  declare data: Template;
}

export class TemplateDetailResponseDto extends ApiResponseDto<TemplateBasic> {
  @ApiProperty({ type: TemplateBasic })
  declare data: TemplateBasic;
}

export class TemplateListItemSimple extends PickType(Template, [
  'id',
  'name',
  'description',
  'author',
  'updater',
  'createdAt',
  'updatedAt',
] as const) {
  @ApiPropertyOptional({ description: '最新主线可用版本号' })
  latestVersion?: string;
}

export class TemplateListResponseDto extends ApiResponseDto<
  TemplateListItemSimple[]
> {
  @ApiProperty({ type: [TemplateListItemSimple] })
  declare data: TemplateListItemSimple[];
}

export class TemplateVersionResponseDto extends ApiResponseDto<TemplateVersion> {
  @ApiProperty({ type: TemplateVersion })
  declare data: TemplateVersion;
}

export class TemplateVersionListResponseDto extends ApiResponseDto<
  TemplateVersionSimple[]
> {
  @ApiProperty({ type: [TemplateVersionSimple] })
  declare data: TemplateVersionSimple[];
}

export class GlobalConfigResponseDto extends ApiResponseDto<TemplateGlobalConfig> {
  @ApiProperty({ type: TemplateGlobalConfig })
  declare data: TemplateGlobalConfig;
}

export class GlobalConfigListResponseDto extends ApiResponseDto<
  TemplateGlobalConfig[]
> {
  @ApiProperty({ type: [TemplateGlobalConfig] })
  declare data: TemplateGlobalConfig[];
}

export class ModuleResponseDto extends ApiResponseDto<TemplateModule> {
  @ApiProperty({ type: TemplateModule })
  declare data: TemplateModule;
}

export class ModuleConfigResponseDto extends ApiResponseDto<TemplateModuleConfig> {
  @ApiProperty({ type: TemplateModuleConfig })
  declare data: TemplateModuleConfig;
}

export class ModuleConfigListResponseDto extends ApiResponseDto<
  TemplateModuleConfig[]
> {
  @ApiProperty({ type: [TemplateModuleConfig] })
  declare data: TemplateModuleConfig[];
}

export class VersionDocsDto {
  @ApiPropertyOptional({ description: '构建文档' })
  buildDoc?: string;

  @ApiPropertyOptional({ description: '更新文档' })
  updateDoc?: string;
}

export class VersionDocsResponseDto extends ApiResponseDto<VersionDocsDto> {
  @ApiProperty({ type: VersionDocsDto })
  declare data: VersionDocsDto;
}
