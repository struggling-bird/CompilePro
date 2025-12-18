import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StorageConfigService } from './storage-config.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@ApiTags('文件存储设置')
@Controller('storage/config')
@UseGuards(AuthenticatedGuard)
@ApiBearerAuth()
export class StorageConfigController {
  constructor(private readonly configService: StorageConfigService) {}

  @Put(':key')
  @ApiOperation({ summary: '更新配置' })
  update(
    @Param('key') key: string,
    @Body() dto: UpdateConfigDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.configService.update(key, dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取配置列表' })
  list(@Query('group') group?: string) {
    return this.configService.list(group);
  }

  @Get(':key')
  @ApiOperation({ summary: '获取指定配置' })
  get(@Param('key') key: string) {
    return this.configService.get(key);
  }
}
