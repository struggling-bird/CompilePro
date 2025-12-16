import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import type { SourceType } from '../version.entity';

export class CreateVersionDto {
  @ApiProperty({ description: '版本号' })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/)
  version: string;

  @ApiProperty({ description: '版本来源类型', enum: ['branch', 'tag'] })
  @IsEnum(['branch', 'tag'])
  sourceType: SourceType;

  @ApiProperty({ description: '版本来源值' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  sourceValue: string;

  @ApiPropertyOptional({ description: '版本概要描述', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  summary?: string;

  @ApiPropertyOptional({ description: '版本说明文档' })
  @IsOptional()
  @IsString()
  readmeDoc?: string;

  @ApiPropertyOptional({ description: '构建文档' })
  @IsOptional()
  @IsString()
  buildDoc?: string;

  @ApiPropertyOptional({ description: '版本更新文档' })
  @IsOptional()
  @IsString()
  updateDoc?: string;

  @ApiPropertyOptional({ description: '编译命令组' })
  @IsOptional()
  @IsArray()
  compileCommands?: string[];
}
