import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsBoolean,
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

  @ApiPropertyOptional({
    type: CreateTemplateVersionDto,
    description: '初始版本信息（可选）',
  })
  @ValidateNested()
  @Type(() => CreateTemplateVersionDto)
  @IsOptional()
  initialVersion?: CreateTemplateVersionDto;
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}
