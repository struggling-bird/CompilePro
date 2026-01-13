import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GlobalConfigItemDto {
  @ApiProperty({ description: '配置项ID' })
  @IsString()
  @IsNotEmpty()
  configId: string;

  @ApiProperty({ description: '配置值' })
  @IsString()
  value: string;
}

export class UpdateGlobalConfigsDto {
  @ApiProperty({ type: [GlobalConfigItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GlobalConfigItemDto)
  configs: GlobalConfigItemDto[];
}
