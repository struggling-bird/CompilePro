import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称（唯一）', example: 'admin' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '角色描述',
    example: '系统管理员',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
