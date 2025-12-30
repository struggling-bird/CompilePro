import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTemplateVersionDto } from './create-template-version.dto';

export class CreateTemplateDto {
  @ApiProperty({ description: '模版名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '模版描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: '最新版本号' })
  @IsString()
  @IsOptional()
  latestVersion?: string;

  @ApiPropertyOptional({ description: '作者' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({
    type: CreateTemplateVersionDto,
    description: '初始版本信息（可选）',
  })
  @ValidateNested()
  @Type(() => CreateTemplateVersionDto)
  @IsOptional()
  initialVersion?: CreateTemplateVersionDto;
}

export class UpdateTemplateDto extends CreateTemplateDto {}
