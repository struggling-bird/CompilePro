import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: '用户名（唯一）', example: 'alice' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: '密码（至少 6 位）', example: 'P@ssw0rd' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: '邮箱地址（唯一）',
    example: 'alice@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    required: false,
    description: '角色名称（可选，不传默认 user）',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  roleName?: string;
}
