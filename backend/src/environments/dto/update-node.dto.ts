import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateNodeDto {
  @ApiProperty({ description: '节点IP', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  ip?: string;

  @ApiProperty({ description: '节点主机名', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  host?: string;

  @ApiProperty({ description: '关联域名', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  domain?: string;

  @ApiProperty({ description: '内存', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  memory?: string;

  @ApiProperty({ description: 'CPU', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  cpu?: string;

  @ApiProperty({ description: '芯片', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  chip?: string;

  @ApiProperty({ description: '操作系统', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  os?: string;

  @ApiProperty({ description: '磁盘类型', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  diskType?: string;

  @ApiProperty({ description: '磁盘空间', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  diskSize?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
