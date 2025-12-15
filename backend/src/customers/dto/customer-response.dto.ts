import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: '客户ID', example: 'uuid-xxxx' })
  id: string;

  @ApiProperty({ description: '客户名称' })
  name: string;

  @ApiProperty({ description: '客户状态', enum: ['active', 'inactive'] })
  status: 'active' | 'inactive';

  @ApiProperty({ description: '联系人', required: false })
  contactPerson?: string | null;

  @ApiProperty({ description: '联系电话', required: false })
  contactPhone?: string | null;

  @ApiProperty({ description: '联系邮箱', required: false })
  contactEmail?: string | null;

  @ApiProperty({ description: '签约日期(YYYY-MM-DD)', required: false })
  contactDate?: string | null;

  @ApiProperty({ description: '联系地址', required: false })
  contactAddress?: string | null;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}
