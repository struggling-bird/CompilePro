import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ description: '业务状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '响应描述', example: 'success' })
  message: string;

  @ApiProperty({ description: '响应时间戳', example: 1627890123456 })
  timestamp: number;

  data?: T;
}
