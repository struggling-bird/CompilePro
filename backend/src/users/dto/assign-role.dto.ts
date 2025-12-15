import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: '角色名称', example: 'admin' })
  @IsString()
  roleName: string;
}
