import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfigValueDto {
  @ApiProperty({ description: '配置值' })
  @IsString()
  value: string;
}
