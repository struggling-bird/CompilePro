import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'alice' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码', example: 'P@ssw0rd' })
  @IsString()
  @MinLength(6)
  password: string;
}
