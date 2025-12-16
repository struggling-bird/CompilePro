import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray } from 'class-validator';

export class UpdateCommandsDto {
  @ApiProperty({ description: '编译命令组' })
  @IsArray()
  @ArrayMaxSize(20)
  commands: string[];
}
