import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CompilationsService } from './compilations.service';
import { CreateCompilationDto } from './dto/create-compilation.dto';
import { UpdateCompilationDto } from './dto/update-compilation.dto';
import { CompilationListQueryDto } from './dto/list-query.dto';
import { UpdateConfigValueDto } from './dto/update-config-value.dto';
import {
  CompilationResponseDto,
  CompilationListResponseDto,
  GlobalConfigListResponseDto,
  ModuleConfigListResponseDto,
  SuccessResponseDto,
} from './dto/response.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string;
    username?: string;
    name?: string;
  };
}

@ApiTags('编译任务管理')
@Controller('compilations')
@UseGuards(AuthenticatedGuard)
@ApiBearerAuth()
export class CompilationsController {
  constructor(private readonly compilationsService: CompilationsService) {}

  @Post()
  @ApiOperation({ summary: '创建编译任务' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: CompilationResponseDto,
  })
  create(
    @Body() createDto: CreateCompilationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const creator = req.user?.name || req.user?.username || 'Unknown';
    return this.compilationsService.create(createDto, creator);
  }

  @Get()
  @ApiOperation({ summary: '获取编译任务列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: CompilationListResponseDto,
  })
  findAll(@Query() query: CompilationListQueryDto) {
    return this.compilationsService.findAll(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新编译任务基础信息' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: CompilationResponseDto,
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateCompilationDto) {
    return this.compilationsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除编译任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    type: SuccessResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.compilationsService.remove(id);
  }

  // --- Global Configs ---

  @Get(':id/global-configs')
  @ApiOperation({ summary: '获取全局配置值' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: GlobalConfigListResponseDto,
  })
  getGlobalConfigs(@Param('id') id: string) {
    return this.compilationsService.getGlobalConfigs(id);
  }

  @Put(':id/global-configs/:configId')
  @ApiOperation({ summary: '更新全局配置值 (单个)' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiParam({ name: 'configId', description: '配置项ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: GlobalConfigListResponseDto,
  })
  updateGlobalConfig(
    @Param('id') id: string,
    @Param('configId') configId: string,
    @Body() dto: UpdateConfigValueDto,
  ) {
    return this.compilationsService.updateGlobalConfig(id, configId, dto);
  }

  @Delete(':id/global-configs/:configId')
  @ApiOperation({ summary: '删除/重置全局配置值' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiParam({ name: 'configId', description: '配置项ID' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    type: SuccessResponseDto,
  })
  deleteGlobalConfig(
    @Param('id') id: string,
    @Param('configId') configId: string,
  ) {
    return this.compilationsService.deleteGlobalConfig(id, configId);
  }

  // --- Module Configs ---

  @Get(':id/module-configs')
  @ApiOperation({ summary: '获取模块配置值' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ModuleConfigListResponseDto,
  })
  getModuleConfigs(@Param('id') id: string) {
    return this.compilationsService.getModuleConfigs(id);
  }

  @Put(':id/module-configs/:moduleId/:configId')
  @ApiOperation({ summary: '更新模块配置值 (单个)' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiParam({ name: 'moduleId', description: '模块ID' })
  @ApiParam({ name: 'configId', description: '配置项ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: ModuleConfigListResponseDto,
  })
  updateModuleConfig(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Param('configId') configId: string,
    @Body() dto: UpdateConfigValueDto,
  ) {
    return this.compilationsService.updateModuleConfig(
      id,
      moduleId,
      configId,
      dto,
    );
  }

  @Delete(':id/module-configs/:moduleId/:configId')
  @ApiOperation({ summary: '删除/重置模块配置值' })
  @ApiParam({ name: 'id', description: '任务ID' })
  @ApiParam({ name: 'moduleId', description: '模块ID' })
  @ApiParam({ name: 'configId', description: '配置项ID' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    type: SuccessResponseDto,
  })
  deleteModuleConfig(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
    @Param('configId') configId: string,
  ) {
    return this.compilationsService.deleteModuleConfig(id, moduleId, configId);
  }
}
