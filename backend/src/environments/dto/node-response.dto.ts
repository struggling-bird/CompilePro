import { ApiProperty } from '@nestjs/swagger';

export class NodeResponseDto {
  @ApiProperty({ description: '节点ID' })
  id: string;

  @ApiProperty({ description: '节点IP' })
  ip: string;

  @ApiProperty({ description: '主机名' })
  host: string;

  @ApiProperty({ description: '关联域名', required: false })
  domain?: string | null;

  @ApiProperty({ description: '内存' })
  memory: string;

  @ApiProperty({ description: 'CPU' })
  cpu: string;

  @ApiProperty({ description: '芯片' })
  chip: string;

  @ApiProperty({ description: '操作系统' })
  os: string;

  @ApiProperty({ description: '磁盘类型' })
  diskType: string;

  @ApiProperty({ description: '磁盘空间' })
  diskSize: string;

  @ApiProperty({ description: '备注', required: false })
  remark?: string | null;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}
