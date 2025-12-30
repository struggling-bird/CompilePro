import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
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
import { ApiResponseInterceptor } from '../shared/api-response.interceptor';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    username?: string;
    name?: string;
  };
}

@ApiTags('模版管理')
@Controller('templates')
@UseInterceptors(ApiResponseInterceptor)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: '创建模版' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(
    @Body() createTemplateDto: CreateTemplateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Assuming user info is attached to request by AuthenticatedGuard
    // If not authenticated, we fallback to 'Unknown'
    const user = req.user;
    const author = user ? user.username || user.name || 'Unknown' : 'Unknown';
    return this.templatesService.create(createTemplateDto, author);
  }

  @Get()
  @ApiOperation({ summary: '获取模版列表' })
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取模版详情' })
  @ApiParam({ name: 'id', description: '模版ID' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新模版' })
  @ApiParam({ name: 'id', description: '模版ID' })
  update(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除模版' })
  @ApiParam({ name: 'id', description: '模版ID' })
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  // --- Version Endpoints ---

  @Post(':id/versions')
  @ApiOperation({ summary: '添加版本' })
  @ApiParam({ name: 'id', description: '模版ID' })
  addVersion(
    @Param('id') id: string,
    @Body() createVersionDto: CreateTemplateVersionDto,
  ) {
    return this.templatesService.addVersion(id, createVersionDto);
  }

  @Patch('versions/:versionId')
  @ApiOperation({ summary: '更新版本' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  updateVersion(
    @Param('versionId') versionId: string,
    @Body() updateVersionDto: UpdateTemplateVersionDto,
  ) {
    return this.templatesService.updateVersion(versionId, updateVersionDto);
  }

  @Delete('versions/:versionId')
  @ApiOperation({ summary: '删除版本' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  deleteVersion(@Param('versionId') versionId: string) {
    return this.templatesService.deleteVersion(versionId);
  }

  // --- Global Config Endpoints ---

  @Post('versions/:versionId/global-configs')
  @ApiOperation({ summary: '添加全局配置' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  addGlobalConfig(
    @Param('versionId') versionId: string,
    @Body() createConfigDto: CreateGlobalConfigDto,
  ) {
    return this.templatesService.addGlobalConfig(versionId, createConfigDto);
  }

  @Patch('global-configs/:configId')
  @ApiOperation({ summary: '更新全局配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  updateGlobalConfig(
    @Param('configId') configId: string,
    @Body() updateConfigDto: UpdateGlobalConfigDto,
  ) {
    return this.templatesService.updateGlobalConfig(configId, updateConfigDto);
  }

  @Delete('global-configs/:configId')
  @ApiOperation({ summary: '删除全局配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  deleteGlobalConfig(@Param('configId') configId: string) {
    return this.templatesService.deleteGlobalConfig(configId);
  }

  // --- Module Endpoints ---

  @Post('versions/:versionId/modules')
  @ApiOperation({ summary: '添加模块' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  addModule(
    @Param('versionId') versionId: string,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return this.templatesService.addModule(versionId, createModuleDto);
  }

  @Patch('modules/:moduleId')
  @ApiOperation({ summary: '更新模块' })
  @ApiParam({ name: 'moduleId', description: '模块ID' })
  updateModule(
    @Param('moduleId') moduleId: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.templatesService.updateModule(moduleId, updateModuleDto);
  }

  @Delete('modules/:moduleId')
  @ApiOperation({ summary: '删除模块' })
  @ApiParam({ name: 'moduleId', description: '模块ID' })
  deleteModule(@Param('moduleId') moduleId: string) {
    return this.templatesService.deleteModule(moduleId);
  }

  // --- Module Config Endpoints ---

  @Post('modules/:moduleId/configs')
  @ApiOperation({ summary: '添加模块配置' })
  @ApiParam({ name: 'moduleId', description: '模块ID' })
  addModuleConfig(
    @Param('moduleId') moduleId: string,
    @Body() createConfigDto: CreateModuleConfigDto,
  ) {
    return this.templatesService.addModuleConfig(moduleId, createConfigDto);
  }

  @Patch('module-configs/:configId')
  @ApiOperation({ summary: '更新模块配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  updateModuleConfig(
    @Param('configId') configId: string,
    @Body() updateConfigDto: UpdateModuleConfigDto,
  ) {
    return this.templatesService.updateModuleConfig(configId, updateConfigDto);
  }

  @Delete('module-configs/:configId')
  @ApiOperation({ summary: '删除模块配置' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  deleteModuleConfig(@Param('configId') configId: string) {
    return this.templatesService.deleteModuleConfig(configId);
  }
}
