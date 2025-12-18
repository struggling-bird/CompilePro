import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfigDto {
  @ApiProperty()
  @IsOptional()
  value: any;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}
