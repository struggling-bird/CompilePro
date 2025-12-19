import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({ description: '文件ID' })
  id: string;

  @ApiProperty({ description: '原始文件名' })
  originalName: string;

  @ApiProperty({ description: '系统生成文件名' })
  filename: string;

  @ApiProperty({ description: 'MIME类型' })
  mimetype: string;

  @ApiProperty({ description: '文件大小(字节)' })
  size: number;

  @ApiProperty({ description: '存储路径' })
  path: string;

  @ApiProperty({ description: '是否为文件夹' })
  isFolder: boolean;

  @ApiProperty({ description: '父文件夹ID', required: false })
  parentId?: string;

  @ApiProperty({ description: '访问URL' })
  url: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
