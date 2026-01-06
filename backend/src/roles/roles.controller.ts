import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('roles')
@ApiTags('角色管理')
@UseGuards(AuthenticatedGuard)
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 200, description: '成功' })
  async create(@Body() dto: CreateRoleDto) {
    return this.roles.createRole(dto);
  }

  @Put(':name/permissions')
  @ApiOperation({ summary: '更新角色权限配置' })
  @ApiParam({ name: 'name', description: '角色名称', type: String })
  @ApiBody({ type: UpdatePermissionsDto })
  @ApiResponse({ status: 200, description: '成功' })
  async updatePermissions(
    @Param('name') name: string,
    @Body() dto: UpdatePermissionsDto,
  ) {
    return this.roles.updatePermissions(name, dto.permissions);
  }
}
