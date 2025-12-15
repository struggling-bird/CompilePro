import { ApiProperty } from '@nestjs/swagger';
import { RoleSummaryDto } from './role-summary.dto';

export class UserResponseDto {
  @ApiProperty({ description: '用户ID', example: 'uuid-xxxx' })
  id: string;

  @ApiProperty({ description: '用户名', example: 'alice' })
  username: string;

  @ApiProperty({ description: '邮箱地址', example: 'alice@example.com' })
  email: string;

  @ApiProperty({
    description: '用户状态（active:活跃，inactive:停用）',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status: 'active' | 'inactive';

  @ApiProperty({
    description: '角色信息',
    type: RoleSummaryDto,
    required: false,
  })
  role?: RoleSummaryDto | null;

  @ApiProperty({ description: '创建时间', example: '2025-01-01T00:00:00.000Z' })
  createdAt: Date;
}
