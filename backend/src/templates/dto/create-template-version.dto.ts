import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import {
  TemplateVersionStatus,
  TemplateVersionType,
} from '../entities/template-version.entity';

export class CreateTemplateVersionDto {
  @ApiProperty({ description: '版本号' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiPropertyOptional({ description: '是否为分支版本', default: false })
  @IsBoolean()
  @IsOptional()
  isBranch?: boolean;

  @ApiPropertyOptional({ description: '基础版本号' })
  @IsString()
  @IsOptional()
  baseVersion?: string;

  @ApiPropertyOptional({
    enum: TemplateVersionStatus,
    description: '状态',
    default: TemplateVersionStatus.ACTIVE,
  })
  @IsEnum(TemplateVersionStatus)
  @IsOptional()
  status?: TemplateVersionStatus;

  @ApiPropertyOptional({ description: '构建文档' })
  @IsString()
  @IsOptional()
  buildDoc?: string;

  @ApiPropertyOptional({ description: '更新文档' })
  @IsString()
  @IsOptional()
  updateDoc?: string;

  @ApiPropertyOptional({ description: '版本描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TemplateVersionType, description: '版本类型' })
  @IsEnum(TemplateVersionType)
  @IsOptional()
  versionType?: TemplateVersionType;

  @ApiPropertyOptional({ description: '父版本ID' })
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class UpdateTemplateVersionDto extends CreateTemplateVersionDto {}
