import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({ description: '客户名称', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiProperty({
    description: '客户状态',
    required: false,
    enum: ['active', 'inactive'],
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiProperty({ description: '联系人', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  contactPerson?: string;

  @ApiProperty({ description: '联系电话', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  contactPhone?: string;

  @ApiProperty({ description: '联系邮箱', required: false })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({
    description: '签约日期(YYYY-MM-DD)',
    required: false,
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  contactDate?: string;

  @ApiProperty({ description: '联系地址', required: false })
  @IsOptional()
  @IsString()
  contactAddress?: string;
}
