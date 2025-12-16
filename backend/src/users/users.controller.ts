import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuditService } from '../audit/audit.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@ApiTags('用户管理')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly audit: AuditService,
  ) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000)
  @CacheKey('users:get')
  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户ID', type: String })
  @ApiResponse({ status: 200, description: '成功', type: UserResponseDto })
  async getUser(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @Put(':id/status')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '更新用户状态（停用/启用）' })
  @ApiParam({ name: 'id', description: '用户ID', type: String })
  @ApiResponse({ status: 200, description: '成功' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Req() req: { user: { userId: string } },
  ) {
    const result = await this.usersService.setStatus(id, dto.status);
    await this.audit.log({
      action: 'user:status',
      userId: id,
      actorId: req.user.userId,
      details: { status: dto.status },
    });
    return result;
  }

  @Put(':id/role')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiParam({ name: 'id', description: '用户ID', type: String })
  @ApiResponse({ status: 200, description: '成功' })
  async assignRole(
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
    @Req() req: { user: { userId: string } },
  ) {
    const result = await this.usersService.assignRole(id, dto.roleName);
    await this.audit.log({
      action: 'user:role',
      userId: id,
      actorId: req.user.userId,
      details: { roleName: dto.roleName },
    });
    return result;
  }

  @Put('me')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '更新当前用户账号设置' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: '成功' })
  async updateMe(
    @Body() dto: UpdateProfileDto,
    @Req() req: { user: { userId: string } },
  ) {
    const result = await this.usersService.updateProfile(req.user.userId, dto);
    await this.audit.log({
      action: 'user:profile',
      userId: req.user.userId,
      actorId: req.user.userId,
      details: { username: dto.username, email: dto.email },
    });
    return result;
  }
}
