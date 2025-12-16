import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVersionDto {
  @ApiPropertyOptional({ description: '版本概要描述' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ description: '版本说明文档' })
  @IsOptional()
  @IsString()
  readmeDoc?: string;

  @ApiPropertyOptional({ description: '构建文档' })
  @IsOptional()
  @IsString()
  buildDoc?: string;

  @ApiPropertyOptional({ description: '版本更新文档' })
  @IsOptional()
  @IsString()
  updateDoc?: string;
}
