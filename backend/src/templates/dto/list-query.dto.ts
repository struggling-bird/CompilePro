import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
