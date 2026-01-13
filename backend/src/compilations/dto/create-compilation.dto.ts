import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompilationDto {
  @ApiProperty({ description: '任务名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '模版ID' })
  @IsUUID()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ description: '模版版本ID' })
  @IsUUID()
  @IsNotEmpty()
  templateVersionId: string;

  @ApiProperty({ description: '客户ID' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ description: '环境ID' })
  @IsUUID()
  @IsNotEmpty()
  environmentId: string;

  @ApiProperty({ description: '描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
