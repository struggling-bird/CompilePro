import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class TemplateListQueryDto {
  @ApiPropertyOptional({ description: '名称（模糊搜索）' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '创建人（模糊搜索）' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: '描述（模糊搜索）' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '创建时间起（ISO 日期字符串）' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ description: '创建时间止（ISO 日期字符串）' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({ description: '更新时间起（ISO 日期字符串）' })
  @IsOptional()
  @IsDateString()
  updatedFrom?: string;

  @ApiPropertyOptional({ description: '更新时间止（ISO 日期字符串）' })
  @IsOptional()
  @IsDateString()
  updatedTo?: string;
}
