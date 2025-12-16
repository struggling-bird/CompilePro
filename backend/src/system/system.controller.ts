import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('system')
@ApiTags('系统环境')
@UseGuards(AuthenticatedGuard)
export class SystemController {
  constructor(private readonly sys: SystemService) {}

  @Get('git')
  @ApiOperation({ summary: '检测 Git 环境' })
  @ApiResponse({ status: 200, description: '成功' })
  async checkGit() {
    return this.sys.checkGit();
  }

  @Post('git/install')
  @ApiOperation({ summary: '安装 Git 指引' })
  @ApiResponse({ status: 200, description: '成功' })
  installGit() {
    return this.sys.installGit();
  }
}

