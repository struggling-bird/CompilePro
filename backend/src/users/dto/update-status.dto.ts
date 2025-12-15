import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    description: '用户状态',
    enum: ['active', 'inactive'],
    example: 'inactive',
  })
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';
}
