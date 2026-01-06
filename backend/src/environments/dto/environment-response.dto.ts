import { ApiProperty } from '@nestjs/swagger';

export class EnvironmentResponseDto {
  @ApiProperty({ description: '环境ID' })
  id: string;

  @ApiProperty({ description: '环境名称' })
  name: string;

  @ApiProperty({ description: '环境访问地址' })
  url: string;

  @ApiProperty({ description: '环境访问账号', required: false })
  account?: string | null;

  @ApiProperty({ description: '环境访问密码', required: false })
  password?: string | null;

  @ApiProperty({ description: '是否支持远程' })
  supportRemote: boolean;

  @ApiProperty({ description: '远程连接方式', required: false })
  remoteMethod?: string | null;

  @ApiProperty({ description: '环境备注说明', required: false })
  remark?: string | null;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}
