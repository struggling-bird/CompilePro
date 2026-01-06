import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray } from 'class-validator';

export class UpdateArtifactsDto {
  @ApiProperty({ description: '制品目录配置' })
  @IsArray()
  @ArrayMaxSize(20)
  artifacts: string[];
}
