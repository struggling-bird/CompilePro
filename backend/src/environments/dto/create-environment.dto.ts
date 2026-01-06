import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateEnvironmentDto {
  @ApiProperty({ description: '环境名称' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '环境访问地址' })
  @IsString()
  @Length(1, 255)
  url: string;

  @ApiProperty({ description: '环境访问账号', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  account?: string;

  @ApiProperty({ description: '环境访问密码', required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  password?: string;

  @ApiProperty({ description: '是否支持远程' })
  @IsBoolean()
  supportRemote: boolean;

  @ApiProperty({ description: '远程连接方式', required: false })
  @IsOptional()
  @IsString()
  remoteMethod?: string;

  @ApiProperty({ description: '环境备注说明', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
