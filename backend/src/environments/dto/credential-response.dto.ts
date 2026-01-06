import { ApiProperty } from '@nestjs/swagger';

export class CredentialResponseDto {
  @ApiProperty({ description: '凭据ID' })
  id: string;

  @ApiProperty({ description: '类型' })
  type: string;

  @ApiProperty({ description: '登录账号' })
  username: string;

  @ApiProperty({ description: '登录密码' })
  password: string;

  @ApiProperty({ description: '账号描述', required: false })
  description?: string | null;
}
