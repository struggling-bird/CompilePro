import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
} from './dto/create-template.dto';
import {
  CreateTemplateVersionDto,
  UpdateTemplateVersionDto,
} from './dto/create-template-version.dto';
import {
  CreateGlobalConfigDto,
  UpdateGlobalConfigDto,
} from './dto/create-global-config.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';
import {
  CreateModuleConfigDto,
  UpdateModuleConfigDto,
} from './dto/create-module-config.dto';
import {
  TemplateCreateResponseDto,
  TemplateListPaginatedResponseDto,
  TemplateVersionResponseDto,
  GlobalConfigResponseDto,
  ModuleResponseDto,
  ModuleConfigResponseDto,
  TemplateDetailResponseDto,
  TemplateVersionListResponseDto,
  GlobalConfigListResponseDto,
  ModuleConfigListResponseDto,
  ModuleListResponseDto,
  VersionDocsResponseDto,
} from './dto/response.dto';
// Removed local ApiResponseInterceptor to avoid double wrapping (global already applied)
import type { Request } from 'express';
import { TemplateListQueryDto } from './dto/list-query.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string;
    username?: string;
    name?: string;
  };
}

@ApiTags('模版管理')
@Controller('templates')
@UseGuards(AuthenticatedGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: '创建模版' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    type: TemplateCreateResponseDto,
  })
  create(
    @Body() createTemplateDto: CreateTemplateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const authorId = req.user?.userId ?? 'Unknown';
    return this.templatesService.create(createTemplateDto, authorId);
  }

  @Get()
  @ApiOperation({ summary: '获取模版列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TemplateListPaginatedResponseDto,
  })
  findAll(@Query() q: TemplateListQueryDto) {
    return this.templatesService.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取模版详情' })
  @ApiParam({ name: 'id', description: '模版ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TemplateDetailResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新模版' })
  @ApiParam({ name: 'id', description: '模版ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: TemplateDetailResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除模版' })
  @ApiParam({ name: 'id', description: '模版ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  // --- Version Endpoints ---

  @Post(':id/versions')
  @ApiOperation({ summary: '添加版本' })
  @ApiParam({ name: 'id', description: '模版ID' })
  @ApiResponse({
    status: 201,
    description: '添加成功',
    type: TemplateVersionResponseDto,
  })
  addVersion(
    @Param('id') id: string,
    @Body() createVersionDto: CreateTemplateVersionDto,
  ) {
    return this.templatesService.addVersion(id, createVersionDto);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: '版本列表（基础信息）' })
  @ApiParam({ name: 'id', description: '模版ID' })
  @ApiResponse({
    status: 200,
    description: '成功',
    type: TemplateVersionListResponseDto,
  })
  listVersions(@Param('id') id: string) {
    return this.templatesService.listVersionsByTemplate(id);
  }

  @Patch('versions/:versionId')
  @ApiOperation({ summary: '更新版本' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: TemplateVersionResponseDto,
  })
  updateVersion(
    @Param('versionId') versionId: string,
    @Body() updateVersionDto: UpdateTemplateVersionDto,
  ) {
    return this.templatesService.updateVersion(versionId, updateVersionDto);
  }

  @Delete('versions/:versionId')
  @ApiOperation({ summary: '删除版本' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  deleteVersion(@Param('versionId') versionId: string) {
    return this.templatesService.deleteVersion(versionId);
  }

  // --- Global Config Endpoints ---

  @Post('versions/:versionId/global-configs')
  @ApiOperation({ summary: '添加全局配置' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiResponse({
    status: 201,
    description: '添加成功',
    type: GlobalConfigResponseDto,
  })
  addGlobalConfig(
    @Param('versionId') versionId: string,
    @Body() createConfigDto: CreateGlobalConfigDto,
  ) {
    return this.templatesService.addGlobalConfig(versionId, createConfigDto);
  }

  @Get('versions/:versionId/global-configs')
  @ApiOperation({ summary: '查询版本全局配置' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiResponse({
    status: 200,
    description: '成功',
    type: GlobalConfigListResponseDto,
  })
  listGlobalConfigs(@Param('versionId') versionId: string) {
    return this.templatesService.listGlobalConfigs(versionId);
  }

  @Patch('global-configs/:configId')
  @ApiOperation({ summary: '更新全局配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: GlobalConfigResponseDto,
  })
  updateGlobalConfig(
    @Param('configId') configId: string,
    @Body() updateConfigDto: UpdateGlobalConfigDto,
  ) {
    return this.templatesService.updateGlobalConfig(configId, updateConfigDto);
  }

  @Delete('global-configs/:configId')
  @ApiOperation({ summary: '删除全局配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  deleteGlobalConfig(
    @Param('configId') configId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId ?? 'Unknown';
    return this.templatesService.deleteGlobalConfig(configId, userId);
  }

  // --- Module Endpoints ---

  @Get('versions/:versionId/modules')
  @ApiOperation({ summary: '查询版本下的模块列表' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiResponse({
    status: 200,
    description: '成功',
    type: ModuleListResponseDto,
  })
  listModules(@Param('versionId') versionId: string) {
    return this.templatesService.listModules(versionId);
  }

  @Post('versions/:versionId/modules')
  @ApiOperation({ summary: '添加模块' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiResponse({
    status: 201,
    description: '添加成功',
    type: ModuleResponseDto,
  })
  addModule(
    @Param('versionId') versionId: string,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.templatesService.addModule(versionId, createModuleDto);
  }

  @Patch('modules/:moduleId')
  @ApiOperation({ summary: '更新模块' })
  @ApiParam({ name: 'moduleId', description: '模块ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: ModuleResponseDto,
  })
  updateModule(
    @Param('moduleId') moduleId: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.templatesService.updateModule(moduleId, updateModuleDto);
  }

  @Delete('modules/:moduleId')
  @ApiOperation({ summary: '删除模块' })
  @ApiParam({ name: 'moduleId', description: '模块ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  deleteModule(@Param('moduleId') moduleId: string) {
    return this.templatesService.deleteModule(moduleId);
  }

  // --- Module Config Endpoints ---

  @Post('modules/:moduleId/configs')
  @ApiOperation({ summary: '添加模块配置' })
  @ApiParam({ name: 'moduleId', description: '模块ID' })
  @ApiResponse({
    status: 201,
    description: '添加成功',
    type: ModuleConfigResponseDto,
  })
  addModuleConfig(
    @Param('moduleId') moduleId: string,
    @Body() createConfigDto: CreateModuleConfigDto,
  ) {
    return this.templatesService.addModuleConfig(moduleId, createConfigDto);
  }

  @Get('versions/:versionId/modules/:moduleId/configs')
  @ApiOperation({ summary: '查询元项目编辑配置项清单' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiParam({ name: 'moduleId', description: '模块ID' })
  @ApiResponse({
    status: 200,
    description: '成功',
    type: ModuleConfigListResponseDto,
  })
  listModuleConfigs(
    @Param('versionId') versionId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.templatesService.listModuleConfigs(versionId, moduleId);
  }

  @Patch('module-configs/:configId')
  @ApiOperation({ summary: '更新模块配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: ModuleConfigResponseDto,
  })
  updateModuleConfig(
    @Param('configId') configId: string,
    @Body() updateConfigDto: UpdateModuleConfigDto,
  ) {
    return this.templatesService.updateModuleConfig(configId, updateConfigDto);
  }

  @Delete('module-configs/:configId')
  @ApiOperation({ summary: '删除模块配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  deleteModuleConfig(@Param('configId') configId: string) {
    return this.templatesService.deleteModuleConfig(configId);
  }

  @Get('versions/:versionId/docs')
  @ApiOperation({ summary: '查询版本文档' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiResponse({
    status: 200,
    description: '成功',
    type: VersionDocsResponseDto,
  })
  getVersionDocs(@Param('versionId') versionId: string) {
    return this.templatesService.getVersionDocs(versionId);
  }
}
