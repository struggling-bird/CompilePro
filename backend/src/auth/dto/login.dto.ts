import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '邮箱地址', example: 'alice@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'P@ssw0rd' })
  @IsString()
  @MinLength(6)
  password: string;
}
