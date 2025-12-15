import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdatePermissionsDto {
  @ApiProperty({
    description: '权限配置（JSON）',
    example: { user_manage: true },
  })
  @IsObject()
  permissions: Record<string, any>;
}
