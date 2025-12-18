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
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @Inject(LocalStorageStrategy)
    private readonly storageStrategy: StorageStrategy,
    private readonly strategyResolver: StorageStrategyResolver,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId?: string,
    isTemp: boolean = false,
  ): Promise<FileEntity> {
    const folder = isTemp ? 'temp' : this.buildPathRule(file.mimetype);

    const md5 = createHash('md5').update(file.buffer).digest('hex');
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');

    const encrypted = this.shouldEncrypt(file.mimetype);
    let fileInfo;
    if (encrypted) {
      const iv = randomBytes(16);
      const keyHex = this.config.get<string>('STORAGE_ENCRYPTION_KEY');
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
      const newFile = this.fileRepository.create({
        originalName: file.originalname,
        filename: fileInfo.filename,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
        path: fileInfo.path,
        storageType: 'local',
        userId: userId,
        isTemp: isTemp,
        expiresAt: isTemp ? new Date(Date.now() + this.tempTtlMs()) : undefined,
        checksumMd5: md5,
        checksumSha256: sha256,
        isEncrypted: true,
        encryptionIv: iv.toString('hex'),
        scanStatus: 'clean',
      });
      await this.audit.log({
        action: 'file.upload',
        userId: userId ?? 'unknown',
        details: { fileId: newFile.id },
      });
      return this.fileRepository.save(newFile);
    } else {
      fileInfo = await this.storageStrategy.upload(file, folder);
      const newFile = this.fileRepository.create({
        originalName: file.originalname,
        filename: fileInfo.filename,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
        path: fileInfo.path,
        storageType: 'local',
        userId: userId,
        isTemp: isTemp,
        expiresAt: isTemp ? new Date(Date.now() + this.tempTtlMs()) : undefined,
        checksumMd5: md5,
        checksumSha256: sha256,
        isEncrypted: false,
        scanStatus: 'clean',
      });
      await this.audit.log({
        action: 'file.upload',
        userId: userId ?? 'unknown',
        details: { fileId: newFile.id },
      });
      return this.fileRepository.save(newFile);
    }
  }

  async getFileStream(id: string, range?: { start: number; end?: number }) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');

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

  async generateThumbnail(
    id: string,
    width: number,
    height?: number,
  ): Promise<{ buffer: Buffer; mimetype: string }> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) throw new NotFoundException('文件不存在');

    // Ensure it's an image
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('文件不是图片');
    }

    const strategy = this.strategyResolver.resolve(file.storageType);
    const { stream } = await strategy.download(file.path);
    const input = await this.readStreamToBuffer(stream);
    const buffer = await sharp(input)
      .resize(width, height)
      .webp({ quality: this.previewQuality() })
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

  private tempTtlMs(): number {
    const hours = Number(
      this.config.get<string>('STORAGE_TEMP_TTL_HOURS') ?? '24',
    );
    return Math.max(1, hours) * 60 * 60 * 1000;
  }

  private shouldEncrypt(mime: string): boolean {
    const enabled =
      (this.config.get<string>('STORAGE_ENCRYPTION_ENABLED') ?? 'false') ===
      'true';
    if (!enabled) return false;
    const list = (this.config.get<string>('STORAGE_ENCRYPT_MIME_TYPES') ?? '')
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

  private previewQuality(): number {
    return Number(this.config.get<string>('IMAGE_PREVIEW_QUALITY') ?? '80');
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
