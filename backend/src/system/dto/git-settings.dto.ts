import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class GitSettingsDto {
  @ApiProperty({
    description: 'git名称（例如：GitLab 生产集群）',
    example: 'GitLab',
  })
  @IsString()
  @IsNotEmpty()
  gitName: string;

  @ApiProperty({
    description: 'API接口访问地址（GitLab API v4 根路径或基础域名）',
    example: 'https://gitlab.example.com/api/v4',
  })
  @IsString()
  @IsUrl({ require_tld: false })
  apiEndpoint: string;

  @ApiProperty({
    description: '访问令牌（Personal Access Token 或 OAuth2 Token）',
    example: 'glpat-xxxx',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
