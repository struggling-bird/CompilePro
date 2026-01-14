import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertConfigDto {
  @ApiProperty({ description: '配置名称', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '配置类型', enum: ['TEXT', 'FILE'] })
  @IsIn(['TEXT', 'FILE'])
  type: 'TEXT' | 'FILE';

  @ApiPropertyOptional({ description: '文本原始值' })
  @IsOptional()
  @IsString()
  textOrigin?: string;

  @ApiPropertyOptional({ description: '匹配项索引', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  matchIndex?: number;

  @ApiPropertyOptional({ description: '分组索引', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  groupIndex?: number;

  @ApiPropertyOptional({ description: '文件原始路径' })
  @IsOptional()
  @IsString()
  fileOriginPath?: string;

  @ApiPropertyOptional({ description: '配置描述', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
