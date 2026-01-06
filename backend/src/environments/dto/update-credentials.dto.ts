import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpsertCredentialDto {
  @ApiProperty({ description: '凭据类型' })
  @IsString()
  @Length(1, 40)
  type: string;

  @ApiProperty({ description: '登录账号' })
  @IsString()
  @Length(1, 100)
  username: string;

  @ApiProperty({ description: '登录密码' })
  @IsString()
  @Length(1, 100)
  password: string;

  @ApiProperty({ description: '账号描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCredentialsDto {
  @ApiProperty({ isArray: true, type: UpsertCredentialDto })
  credentials: UpsertCredentialDto[];
}
