import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../shared/dto/api-response.dto';
import { Compilation } from '../entities/compilation.entity';

export class PaginationMetaDto {
  @ApiProperty({ description: '总数' })
  total: number;

  @ApiProperty({ description: '页码' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  pageSize: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}

export class CompilationListPaginatedData {
  @ApiProperty({ type: [Compilation] })
  items: Compilation[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class CompilationResponseDto extends ApiResponseDto<Compilation> {
  @ApiProperty({ type: Compilation })
  declare data: Compilation;
}

export class CompilationListResponseDto extends ApiResponseDto<CompilationListPaginatedData> {
  @ApiProperty({ type: CompilationListPaginatedData })
  declare data: CompilationListPaginatedData;
}

export class GlobalConfigItemDto {
  @ApiProperty({ description: '配置项ID' })
  configId: string;

  @ApiProperty({ description: '配置名称' })
  name: string;

  @ApiProperty({ description: '配置类型' })
  type: string;

  @ApiProperty({ description: '描述', required: false })
  description?: string;

  @ApiProperty({ description: '配置值' })
  value: string;
}

export class GlobalConfigListResponseDto extends ApiResponseDto<
  GlobalConfigItemDto[]
> {
  @ApiProperty({ type: [GlobalConfigItemDto] })
  declare data: GlobalConfigItemDto[];
}

export class ModuleConfigItemDto {
  @ApiProperty({ description: '模块ID' })
  moduleId: string;

  @ApiProperty({ description: '配置项ID' })
  configId: string;

  @ApiProperty({ description: '配置名称' })
  name: string;

  @ApiProperty({ description: '文件位置' })
  fileLocation: string;

  @ApiProperty({ description: '映射类型' })
  mappingType: string;

  @ApiProperty({ description: '映射值', required: false })
  mappingValue?: string;

  @ApiProperty({ description: '正则匹配', required: false })
  regex?: string;

  @ApiProperty({ description: '描述', required: false })
  description?: string;

  @ApiProperty({ description: '是否隐藏' })
  isHidden: boolean;

  @ApiProperty({ description: '是否选中' })
  isSelected: boolean;

  @ApiProperty({ description: '配置值' })
  value: string;
}

export class ModuleConfigListResponseDto extends ApiResponseDto<
  ModuleConfigItemDto[]
> {
  @ApiProperty({ type: [ModuleConfigItemDto] })
  declare data: ModuleConfigItemDto[];
}

export class SuccessResponseDto extends ApiResponseDto<{ success: boolean }> {
  @ApiProperty({
    type: 'object',
    properties: { success: { type: 'boolean' } },
  })
  declare data: { success: boolean };
}
