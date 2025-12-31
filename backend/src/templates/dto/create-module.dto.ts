import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PublishMethod } from '../entities/template-module.entity';
import { CreateModuleConfigDto } from './create-module-config.dto';

export class CreateModuleDto {
  @ApiProperty({ description: '关联的 MetaProject ID' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: '项目名称', required: false })
  @IsString()
  @IsOptional()
  projectName?: string;

  @ApiProperty({ description: '项目版本' })
  @IsString()
  @IsNotEmpty()
  projectVersion: string;

  @ApiProperty({
    enum: PublishMethod,
    description: '发布方式',
    default: PublishMethod.GIT,
  })
  @IsEnum(PublishMethod)
  @IsOptional()
  publishMethod?: PublishMethod;

  @ApiPropertyOptional({
    type: [CreateModuleConfigDto],
    description: '模块配置列表',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleConfigDto)
  @IsOptional()
  configs?: CreateModuleConfigDto[];
}

export class UpdateModuleDto extends CreateModuleDto {}
