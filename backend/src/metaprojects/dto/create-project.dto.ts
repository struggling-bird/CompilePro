import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsEnum,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'git地址（支持 https/ssh/git 以及 git@host:group/repo.git）',
    example: 'git@gl.example.com:group/repo.git',
  })
  @IsString()
  @Matches(/^(?:(?:https?:\/\/|ssh:\/\/|git:\/\/)[^\s]+|[\w.-]+@[^:]+:[^\s]+)$/)
  gitUrl: string;

  @ApiProperty({ description: '描述', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: '初始版本号（支持可选 v 前缀，2-3段版本）' })
  @IsString()
  @Matches(/^v?\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z.-]+)?$/)
  initialVersion: string;

  @ApiProperty({ description: '版本来源类型', enum: ['branch', 'tag'] })
  @IsEnum(['branch', 'tag'])
  sourceType: 'branch' | 'tag';

  @ApiProperty({ description: '版本来源值（分支或标签名称）' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  sourceValue: string;

  @ApiPropertyOptional({ description: '版本概要描述', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  summary?: string;
}
