import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateVersionStatusDto {
  @ApiProperty({ description: '版本状态', enum: ['enabled', 'disabled'] })
  @IsIn(['enabled', 'disabled'])
  status: 'enabled' | 'disabled';
}
