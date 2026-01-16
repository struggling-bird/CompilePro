import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ConfigType } from '../entities/template-global-config.entity';

export class CreateGlobalConfigDto {
  @ApiProperty({ description: '配置项名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ConfigType, description: '配置类型' })
  @IsEnum(ConfigType)
  type: ConfigType;

  @ApiPropertyOptional({ description: '默认值' })
  @IsString()
  @IsOptional()
  defaultValue?: string;

  @ApiPropertyOptional({ description: '描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '是否隐藏', default: false })
  @IsBoolean()
  @IsOptional()
  isHidden?: boolean;
}

export class UpdateGlobalConfigDto extends PartialType(CreateGlobalConfigDto) {}
