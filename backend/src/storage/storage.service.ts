import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { FileEntity } from './file.entity';
import type { StorageStrategy } from './strategies/storage-strategy.interface';
import { LocalStorageStrategy } from './strategies/local-storage.strategy';
import { StorageStrategyResolver } from './strategies/storage-strategy.resolver';
import sharp from 'sharp';
import type { Readable } from 'stream';
import { Cron, CronExpression } from '@nestjs/schedule';
import 'multer';
import { createHash, randomBytes, createCipheriv } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { StorageConfigService } from '../storage-config/storage-config.service';
import { UsersService } from '../users/users.service';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @Inject(LocalStorageStrategy)
    private readonly storageStrategy: StorageStrategy,
    private readonly strategyResolver: StorageStrategyResolver,
    private readonly audit: AuditService,
    private readonly storageConfig: StorageConfigService,
    private readonly usersService: UsersService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId?: string,
    isTemp: boolean = false,
    parentId?: string,
  ): Promise<FileEntity> {
    if (userId && !isTemp) {
      const allowed = await this.usersService.checkQuota(userId, file.size);
      if (!allowed) {
        throw new BadRequestException('存储空间不足');
      }
    }

    if (parentId) {
      const parent = await this.fileRepository.findOne({
        where: { id: parentId, isFolder: true },
      });
      if (!parent) throw new NotFoundException('父文件夹不存在');
    }

    const folder = isTemp ? 'temp' : this.buildPathRule(file.mimetype);

    const md5 = createHash('md5').update(file.buffer).digest('hex');
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');

    const encrypted = await this.shouldEncrypt(file.mimetype);
    let fileInfo;
    let newFile: FileEntity;

    if (encrypted) {
      const iv = randomBytes(16);
      const keyHex = await this.storageConfig.get<string>(
        'STORAGE_ENCRYPTION_KEY',
      );
      if (!keyHex) {
        throw new BadRequestException('Encryption key not configured');
      }
      const key = Buffer.from(keyHex, 'hex');
      const cipher = createCipheriv('aes-256-ctr', key, iv);
      const encBuffer = Buffer.concat([
        cipher.update(file.buffer),
        cipher.final(),
      ]);
      fileInfo = await this.storageStrategy.uploadRaw(
        {
          buffer: encBuffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: encBuffer.length,
        },
        folder,
      );
      newFile = this.fileRepository.create({
        originalName: file.originalname,
        filename: fileInfo.filename,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
        path: fileInfo.path,
        storageType: 'local',
        userId: userId,
        isTemp: isTemp,
        expiresAt: isTemp
          ? new Date(Date.now() + (await this.tempTtlMs()))
          : undefined,
        checksumMd5: md5,
        checksumSha256: sha256,
        isEncrypted: true,
        encryptionIv: iv.toString('hex'),
        scanStatus: 'clean',
        parentId,
        isFolder: false,
      });
    } else {
      fileInfo = await this.storageStrategy.upload(file, folder);
      newFile = this.fileRepository.create({
        originalName: file.originalname,
        filename: fileInfo.filename,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
        path: fileInfo.path,
        storageType: 'local',
        userId: userId,
        isTemp: isTemp,
        expiresAt: isTemp
          ? new Date(Date.now() + (await this.tempTtlMs()))
          : undefined,
        checksumMd5: md5,
        checksumSha256: sha256,
        isEncrypted: false,
        scanStatus: 'clean',
        parentId,
        isFolder: false,
      });
    }

    await this.audit.log({
      action: 'file.upload',
      userId: userId ?? 'unknown',
      details: { fileId: newFile.id },
    });

    const savedFile = await this.fileRepository.save(newFile);

    if (userId && !isTemp) {
      await this.usersService.updateStorageUsage(userId, file.size);
    }

    return savedFile;
  }

  async createFolder(
    name: string,
    userId: string,
    parentId?: string,
  ): Promise<FileEntity> {
    if (parentId) {
      const parent = await this.fileRepository.findOne({
        where: { id: parentId, isFolder: true },
      });
      if (!parent) throw new NotFoundException('父文件夹不存在');
    }

    const folder = this.fileRepository.create({
      originalName: name,
      filename: `folder_${Date.now()}_${randomBytes(4).toString('hex')}`,
      mimetype: 'application/x-directory',
      size: 0,
      path: '',
      storageType: 'local',
      userId,
      isFolder: true,
      parentId,
      scanStatus: 'clean',
    });

    return this.fileRepository.save(folder);
  }

  async listFiles(userId?: string, parentId?: string): Promise<FileEntity[]> {
    const query = this.fileRepository.createQueryBuilder('file');

    if (parentId) {
      query.where('file.parentId = :parentId', { parentId });
    } else {
      query.where('file.parentId IS NULL');
    }

    if (userId) {
      query.andWhere('file.userId = :userId', { userId });
    }

    return query
      .orderBy('file.isFolder', 'DESC')
      .addOrderBy('file.createdAt', 'DESC')
      .getMany();
  }

  async getFile(id: string): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async renameFile(
    id: string,
    name: string,
    userId: string,
  ): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({ where: { id, userId } });
    if (!file) throw new NotFoundException('文件不存在');

    file.originalName = name;
    return this.fileRepository.save(file);
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id, userId } });
    if (!file) throw new NotFoundException('文件不存在');

    if (file.isFolder) {
      const count = await this.fileRepository.count({
        where: { parentId: id },
      });
      if (count > 0) throw new BadRequestException('文件夹不为空');
      await this.fileRepository.remove(file);
    } else {
      try {
        const strategy = this.strategyResolver.resolve(file.storageType);
        await strategy.delete(file.path);
      } catch (e) {
        this.logger.error(`Failed to delete physical file: ${e}`);
      }

      await this.usersService.updateStorageUsage(userId, -file.size);

      await this.fileRepository.remove(file);
    }
  }

  async getFileStream(id: string, range?: { start: number; end?: number }) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

    // Update access stats asynchronously
    this.fileRepository
      .update(id, {
        accessCount: () => 'accessCount + 1',
        lastAccessedAt: new Date(),
      })
      .catch((e) => this.logger.error(`Failed to update access stats: ${e}`));

    const { stream, size } = await this.storageStrategy.download(
      file.path,
      range,
    );
    return {
      stream,
      size,
      mimetype: file.mimetype,
      filename: file.originalName,
      checksumMd5: file.checksumMd5,
      checksumSha256: file.checksumSha256,
    };
  }

  async promoteFile(id: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

    if (!file.isTemp) return;

    const targetFolder = this.buildPathRule(file.mimetype);
    // Use path.join but ensure forward slashes for cross-platform compatibility if needed,
    // though LocalStorageStrategy handles it.
    // However, buildPathRule returns "type/y/m/d".
    // file.path currently is "temp/filename".
    // We want new path "type/y/m/d/filename".
    const newPath = path.join(targetFolder, file.filename);

    const strategy = this.strategyResolver.resolve(file.storageType);
    await strategy.move(file.path, newPath);

    file.isTemp = false;
    file.expiresAt = null as unknown as Date;
    file.path = newPath;

    await this.fileRepository.save(file);
  }

  async generateThumbnail(
    id: string,
    width: number,
    height?: number,
  ): Promise<{ buffer: Buffer; mimetype: string }> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('文件不存在');

    // Update access stats asynchronously
    this.fileRepository
      .update(id, {
        accessCount: () => 'accessCount + 1',
        lastAccessedAt: new Date(),
      })
      .catch((e) => this.logger.error(`Failed to update access stats: ${e}`));

    // Ensure it's an image
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('文件不是图片');
    }

    const strategy = this.strategyResolver.resolve(file.storageType);
    const { stream } = await strategy.download(file.path);
    const input = await this.readStreamToBuffer(stream);
    const buffer = await sharp(input)
      .resize(width, height)
      .webp({ quality: await this.previewQuality() })
      .toBuffer();
    return { buffer, mimetype: 'image/webp' };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupTempFiles() {
    this.logger.log('Starting temporary file cleanup...');
    const expiredFiles = await this.fileRepository.find({
      where: {
        isTemp: true,
        expiresAt: LessThan(new Date()),
      },
    });

    let count = 0;
    for (const file of expiredFiles) {
      try {
        const strategy = this.strategyResolver.resolve(file.storageType);
        await strategy.delete(file.path);
        await this.fileRepository.remove(file);
        count++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to delete file ${file.id}: ${msg}`);
      }
    }
    this.logger.log(`Cleanup complete. Deleted ${count} files.`);
  }

  private async tempTtlMs(): Promise<number> {
    const ttlHours = await this.storageConfig.get<number>(
      'STORAGE_TEMP_TTL_HOURS',
      24,
    );
    return Math.max(1, Number(ttlHours)) * 60 * 60 * 1000;
  }

  private async shouldEncrypt(mime: string): Promise<boolean> {
    const enabled = await this.storageConfig.get<boolean>(
      'STORAGE_ENCRYPTION_ENABLED',
      false,
    );
    if (!enabled) return false;
    const raw = await this.storageConfig.get<string>(
      'STORAGE_ENCRYPT_MIME_TYPES',
      '',
    );
    const list = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length === 0 ? true : list.includes(mime);
  }

  private buildPathRule(mime: string): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const type = mime.split('/')[0];
    return `${type}/${y}/${m}/${d}`;
  }

  private async previewQuality(): Promise<number> {
    return Number(
      await this.storageConfig.get<number>('IMAGE_PREVIEW_QUALITY', 80),
    );
  }

  private readStreamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
