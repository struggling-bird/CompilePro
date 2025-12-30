import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { MappingType } from '../entities/template-module-config.entity';

export class CreateModuleConfigDto {
  @ApiProperty({ description: '配置项名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '文件路径' })
  @IsString()
  @IsNotEmpty()
  fileLocation: string;

  @ApiProperty({ enum: MappingType, description: '映射类型' })
  @IsEnum(MappingType)
  mappingType: MappingType;

  @ApiPropertyOptional({ description: '映射值（全局配置ID或固定值）' })
  @IsString()
  @IsOptional()
  mappingValue?: string;

  @ApiPropertyOptional({ description: '正则匹配表达式' })
  @IsString()
  @IsOptional()
  regex?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '是否隐藏', default: false })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;

  @ApiPropertyOptional({ description: '是否选中', default: true })
  @IsBoolean()
  @IsOptional()
  isSelected?: boolean;
}

export class UpdateModuleConfigDto extends CreateModuleConfigDto {}
