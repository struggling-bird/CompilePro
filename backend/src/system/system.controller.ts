import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { GitSettingsDto } from './dto/git-settings.dto';

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

  @Put('git/settings')
  @ApiOperation({ summary: '保存 Git 绑定并校验' })
  @ApiBody({ type: GitSettingsDto })
  @ApiResponse({ status: 200, description: '成功' })
  async saveGitSettings(
    @Req() req: { user: { userId: string } },
    @Body() dto: GitSettingsDto,
  ) {
    return this.sys.saveGitSettings(req.user.userId, dto);
  }
}
