import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCompilationDto } from './create-compilation.dto';
import { IsArray, IsOptional, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class GlobalConfigUpdateItem {
  @ApiProperty()
  @IsString()
  configId: string;

  @ApiProperty()
  @IsString()
  value: string;
}

class ModuleConfigUpdateItem {
  @ApiProperty()
  @IsString()
  moduleId: string;

  @ApiProperty()
  @IsString()
  configId: string;

  @ApiProperty()
  @IsString()
  value: string;
}

export class UpdateCompilationDto extends PartialType(CreateCompilationDto) {
  @ApiProperty({ type: [GlobalConfigUpdateItem], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GlobalConfigUpdateItem)
  globalConfigs?: GlobalConfigUpdateItem[];

  @ApiProperty({ type: [ModuleConfigUpdateItem], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleConfigUpdateItem)
  moduleConfigs?: ModuleConfigUpdateItem[];
}
