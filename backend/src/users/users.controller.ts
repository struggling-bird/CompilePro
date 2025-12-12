import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
@ApiTags('用户管理')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
