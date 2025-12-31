import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Res,
  UploadedFiles,
  UseInterceptors,
  Query,
  Headers,
  BadRequestException,
  UseGuards,
  StreamableFile,
  Req,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { StorageAnalysisService } from './storage-analysis.service';
import { StorageConfigService } from '../storage-config/storage-config.service';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { ReplayGuard } from '../shared/replay.guard';
import multer from 'multer';
import { ThrottleTransform } from './utils/throttle.transform';
import sharp from 'sharp';
import { IsNumber } from 'class-validator';

export class UpdateQuotaDto {
  @ApiProperty({ description: '总配额 (GB)', example: 10 })
  @IsNumber()
  total: number;

  @ApiProperty({ description: '预警阈值 (%)', example: 80 })
  @IsNumber()
  warningThreshold: number;
}

@ApiTags('存储模块')
@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly analysisService: StorageAnalysisService,
    private readonly storageConfig: StorageConfigService,
  ) {}

  @Post('folder')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '创建文件夹' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { name: { type: 'string' }, parentId: { type: 'string' } },
    },
  })
  async createFolder(
    @Body() body: { name: string; parentId?: string },
    @Req() req: { user: { id: string } },
  ) {
    return this.storageService.createFolder(
      body.name,
      req.user.id,
      body.parentId,
    );
  }

  @Get('files')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '获取文件列表' })
  @ApiQuery({ name: 'parentId', required: false })
  async listFiles(
    @Query('parentId') parentId: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.storageService.listFiles(req.user.id, parentId);
  }

  @Get('files/:id')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '获取文件详情' })
  async getFile(@Param('id') id: string) {
    return this.storageService.getFile(id);
  }

  @Put('files/:id/rename')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '重命名文件' })
  async renameFile(
    @Param('id') id: string,
    @Body('name') name: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.storageService.renameFile(id, name, req.user.id);
  }

  @Delete('files/:id')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '删除文件' })
  async deleteFile(
    @Param('id') id: string,
    @Req() req: { user: { id: string } },
  ) {
    return this.storageService.deleteFile(id, req.user.id);
  }

  @Get('quota')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '获取存储配额' })
  async getQuota(@Req() req: { user: { id: string } }) {
    return this.analysisService.getQuotaInfo(req.user.id);
  }

  @Put('quota')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '更新存储配额' })
  @ApiBody({ type: UpdateQuotaDto })
  async updateQuota(
    @Body() dto: UpdateQuotaDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.analysisService.updateQuota(
      req.user.id,
      dto.total,
      dto.warningThreshold,
    );
  }

  @Get('analysis/trends')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '获取存储趋势' })
  async getTrends(@Req() req: { user: { id: string } }) {
    return this.analysisService.getStorageTrends(req.user.id);
  }

  @Get('analysis/types')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '获取文件类型分布' })
  async getTypes(@Req() req: { user: { id: string } }) {
    return this.analysisService.getFileTypeDistribution(req.user.id);
  }

  @Get('analysis/hot-files')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '获取热点文件' })
  async getHotFiles(@Req() req: { user: { id: string } }) {
    return this.analysisService.getHotFiles(req.user.id);
  }

  @Post('upload')
  @UseGuards(AuthenticatedGuard, ReplayGuard)
  @ApiOperation({ summary: '上传文件' })
  @ApiResponse({ status: 200, description: '成功' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        isTemp: {
          type: 'boolean',
          default: false,
          description: '是否为临时文件',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: multer.memoryStorage(),
      fileFilter: (_req, file, cb) => {
        const raw =
          process.env.STORAGE_ALLOWED_TYPES ??
          'image/,application/pdf,application/zip,text/';
        const allowed = raw
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
        const ok = allowed.some((a: string) =>
          a.endsWith('/') ? file.mimetype.startsWith(a) : file.mimetype === a,
        );
        if (!ok) return cb(new BadRequestException('文件类型不被允许'), false);
        cb(null, true);
      },
      limits: {
        fileSize: Number(process.env.STORAGE_MAX_SIZE_MB ?? '50') * 1024 * 1024,
      },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Query('isTemp') isTemp: boolean = false,
    @Body() body: { parentId?: string },
    @Req() req: { user?: { id?: string } },
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('未上传文件');
    }

    const userId: string | undefined = req.user?.id;

    const uploadedFiles = await Promise.all(
      files.map((file) =>
        this.storageService.uploadFile(
          file,
          userId,
          Boolean(isTemp),
          body.parentId,
        ),
      ),
    );

    return uploadedFiles;
  }

  @Get('download/:id')
  @UseGuards(AuthenticatedGuard, ReplayGuard)
  @ApiOperation({ summary: '下载文件' })
  @ApiParam({ name: 'id', description: '文件ID', type: String })
  @ApiQuery({
    name: 'limitKbps',
    required: false,
    description: '限制下载速度(kbps)',
  })
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('range') range: string,
    @Query('limitKbps') limitKbps?: string,
  ) {
    let rangeOptions;
    let start = 0;
    let end: number | undefined;

    // We fetch size first? No, we need size to handle range if end is missing.
    // But getFileStream returns size.

    // First pass: parse range if exists
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : undefined;
      rangeOptions = { start, end };
    }

    const { stream, size, mimetype, filename, checksumMd5, checksumSha256 } =
      await this.storageService.getFileStream(id, rangeOptions);

    const headers: Record<string, any> = {
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
    };
    if (checksumMd5) {
      headers['Content-MD5'] = Buffer.from(checksumMd5, 'hex').toString(
        'base64',
      );
    }
    if (checksumSha256) {
      headers['Digest'] =
        `sha-256=${Buffer.from(checksumSha256, 'hex').toString('base64')}`;
    }
    res.set(headers);

    if (range) {
      const effectiveEnd = end !== undefined ? end : size - 1;
      const chunkSize = effectiveEnd - start + 1;

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${effectiveEnd}/${size}`,
        'Content-Length': chunkSize,
      });
    } else {
      res.set({
        'Content-Length': size,
      });
    }

    const globalLimit = await this.storageConfig.get<number>(
      'DOWNLOAD_LIMIT_KBPS',
      0,
    );
    const kbps = Number(limitKbps ?? globalLimit);
    const throttled =
      kbps > 0 ? stream.pipe(new ThrottleTransform(kbps)) : stream;
    return new StreamableFile(throttled);
  }

  @Get('preview/:id')
  @ApiOperation({ summary: '预览图片' })
  @ApiParam({ name: 'id', description: '文件ID', type: String })
  @ApiQuery({ name: 'w', required: false, description: '宽度' })
  @ApiQuery({ name: 'h', required: false, description: '高度' })
  @ApiResponse({ status: 200, description: '成功' })
  @UseGuards(AuthenticatedGuard)
  async previewFile(
    @Param('id') id: string,
    @Query('w') w: string,
    @Query('h') h: string,
    @Res() res: Response,
  ) {
    const width = w ? parseInt(w) : 200;
    const height = h ? parseInt(h) : undefined;

    const { buffer, mimetype } = await this.storageService.generateThumbnail(
      id,
      width,
      height,
    );

    res.set('Content-Type', mimetype);
    res.send(buffer);
  }

  @Get('exif/:id')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '获取图片EXIF信息' })
  @ApiParam({ name: 'id', description: '文件ID', type: String })
  @ApiResponse({ status: 200, description: '成功' })
  async exif(@Param('id') id: string) {
    const { buffer } = await this.storageService.generateThumbnail(id, 1, 1); // Ensure image can be read
    const meta = await sharp(buffer).metadata();
    return meta.exif ?? {};
  }

  @Post('cleanup')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: '手动清理过期临时文件' })
  @ApiResponse({ status: 200, description: '成功' })
  async cleanup() {
    await this.storageService.cleanupTempFiles();
    return { success: true };
  }
}
