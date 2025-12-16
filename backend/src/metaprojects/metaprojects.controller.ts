import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { MetaprojectsService } from './metaprojects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ListQueryDto } from './dto/list-query.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpsertConfigDto } from './dto/upsert-config.dto';
import { UpdateCommandsDto } from './dto/commands.dto';

@Controller('metaprojects')
@ApiTags('元项目管理')
@UseGuards(AuthenticatedGuard)
export class MetaprojectsController {
  constructor(private readonly svc: MetaprojectsService) {}

  @Post()
  @ApiOperation({ summary: '新建元项目' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 200, description: '成功' })
  async create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateProjectDto,
  ) {
    return this.svc.createProject(req.user.userId, dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(5)
  @ApiOperation({ summary: '列表查询' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiResponse({ status: 200, description: '成功' })
  async list(@Query() q: ListQueryDto) {
    const page = Number(q.page ?? 1);
    const pageSize = Number(q.pageSize ?? 10);
    return this.svc.listProjects({ page, pageSize, q: q.q });
  }

  @Get(':projectId')
  @ApiOperation({ summary: '详情查询' })
  @ApiParam({ name: 'projectId', description: '项目ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async detail(@Param('projectId') projectId: string) {
    return this.svc.getProjectDetail(projectId);
  }

  @Post(':projectId/versions')
  @ApiOperation({ summary: '版本新增' })
  @ApiParam({ name: 'projectId', description: '项目ID' })
  @ApiBody({ type: CreateVersionDto })
  @ApiResponse({ status: 200, description: '成功' })
  async createVersion(
    @Param('projectId') projectId: string,
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateVersionDto,
  ) {
    return this.svc.createVersion(projectId, req.user.userId, dto);
  }

  @Put(':projectId/versions/:versionId')
  @ApiOperation({ summary: '版本修改' })
  @ApiParam({ name: 'projectId', description: '项目ID' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiBody({ type: UpdateVersionDto })
  @ApiResponse({ status: 200, description: '成功' })
  async updateVersion(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpdateVersionDto,
  ) {
    return this.svc.updateVersion(projectId, versionId, dto);
  }

  @Patch(':projectId/versions/:versionId/status')
  @ApiOperation({ summary: '版本状态管理' })
  @ApiParam({ name: 'projectId', description: '项目ID' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ status: 200, description: '成功' })
  async updateStatus(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateStatusDto,
  ) {
    return this.svc.updateVersionStatus(
      projectId,
      versionId,
      dto,
      req.user.userId,
    );
  }

  @Post(':projectId/versions/:versionId/configs')
  @ApiOperation({ summary: '新增或修改配置项' })
  @ApiParam({ name: 'projectId', description: '项目ID' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiBody({ type: UpsertConfigDto })
  @ApiResponse({ status: 200, description: '成功' })
  async upsertConfig(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Body() dto: UpsertConfigDto,
  ) {
    return this.svc.upsertConfig(projectId, versionId, dto);
  }

  @Delete(':projectId/versions/:versionId/configs/:configId')
  @ApiOperation({ summary: '删除配置项' })
  @ApiParam({ name: 'projectId', description: '项目ID' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiParam({ name: 'configId', description: '配置ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async deleteConfig(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Param('configId') configId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.svc.deleteConfig(
      projectId,
      versionId,
      configId,
      req.user.userId,
    );
  }

  @Get(':projectId/versions/:versionId/configs')
  @ApiOperation({ summary: '查询版本配置项' })
  @ApiParam({ name: 'projectId', description: '项目ID' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async listConfigs(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.svc.listConfigs(projectId, versionId);
  }

  @Put(':projectId/versions/:versionId/commands')
  @ApiOperation({ summary: '更新编译命令组' })
  @ApiParam({ name: 'projectId', description: '项目ID' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiBody({ type: UpdateCommandsDto })
  @ApiResponse({ status: 200, description: '成功' })
  async updateCommands(
    @Param('projectId') projectId: string,
    @Param('versionId') versionId: string,
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateCommandsDto,
  ) {
    return this.svc.updateCommands(projectId, versionId, req.user.userId, dto);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: '删除元项目（软删除）' })
  @ApiParam({ name: 'projectId', description: '项目ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async deleteProject(
    @Param('projectId') projectId: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.svc.deleteProject(projectId, req.user.userId);
  }
}
