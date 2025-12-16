import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('workspace')
@ApiTags('工作空间')
@UseGuards(AuthenticatedGuard)
export class WorkspaceController {
  constructor(private readonly ws: WorkspaceService) {}

  @Get('root')
  @ApiOperation({ summary: '工作空间根目录' })
  @ApiResponse({ status: 200, description: '成功' })
  async root() {
    return { root: await this.ws.ensureRoot() };
  }

  @Get('stats')
  @ApiOperation({ summary: '工作空间统计' })
  @ApiResponse({ status: 200, description: '成功' })
  async stats() {
    return await this.ws.stats();
  }

  @Get('clone/status')
  @ApiOperation({ summary: '克隆进度查询' })
  @ApiQuery({ name: 'projectId', description: '项目ID', type: String })
  @ApiResponse({ status: 200, description: '成功' })
  async cloneStatus(
    @Req() req: { user: { userId: string } },
    @Query('projectId') projectId: string,
  ) {
    return this.ws.cloneStatus(req.user.userId, projectId);
  }
}
