import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'git地址',
    example: 'https://gitlab.example.com/group/repo.git',
  })
  @IsString()
  @IsUrl({ require_tld: false })
  gitUrl: string;

  @ApiProperty({ description: '描述', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
