import { ApiProperty } from '@nestjs/swagger';

export class RoleSummaryDto {
  @ApiProperty({ description: '角色名称', example: 'admin' })
  name: string;

  @ApiProperty({ description: '角色描述', example: '系统管理员' })
  description?: string;

  @ApiProperty({
    description: '权限配置（JSON）',
    example: { user_manage: true },
  })
  permissions?: Record<string, any>;
}
