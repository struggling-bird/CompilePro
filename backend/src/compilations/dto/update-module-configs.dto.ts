import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ModuleConfigItemDto {
  @ApiProperty({ description: '模块ID' })
  @IsString()
  @IsNotEmpty()
  moduleId: string;

  @ApiProperty({ description: '配置项ID' })
  @IsString()
  @IsNotEmpty()
  configId: string;

  @ApiProperty({ description: '配置值' })
  @IsString()
  value: string;
}

export class UpdateModuleConfigsDto {
  @ApiProperty({ type: [ModuleConfigItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleConfigItemDto)
  configs: ModuleConfigItemDto[];
}
