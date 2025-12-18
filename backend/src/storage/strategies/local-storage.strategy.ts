import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StorageStrategy, FileInfo } from './storage-strategy.interface';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import 'multer';

@Injectable()
export class LocalStorageStrategy implements StorageStrategy {
  private readonly uploadRoot = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadRoot)) {
      fs.mkdirSync(this.uploadRoot, { recursive: true });
    }
  }

  async upload(
    file: Express.Multer.File,
    folder: string = '',
  ): Promise<FileInfo> {
    const fileId = randomUUID();
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const uploadPath = path.join(this.uploadRoot, folder);

    if (!fs.existsSync(uploadPath)) {
      await fs.promises.mkdir(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, filename);

    try {
      await fs.promises.writeFile(filePath, file.buffer);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`写入文件失败: ${msg}`);
    }

    return {
      filename: filename,
      path: path.join(folder, filename), // Relative path
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async uploadRaw(
    payload: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    folder: string = '',
  ): Promise<FileInfo> {
    const fileId = randomUUID();
    const ext = path.extname(payload.originalname);
    const filename = `${fileId}${ext}`;
    const uploadPath = path.join(this.uploadRoot, folder);

    if (!fs.existsSync(uploadPath)) {
      await fs.promises.mkdir(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, filename);

    try {
      await fs.promises.writeFile(filePath, payload.buffer);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Failed to write file: ${msg}`);
    }

    return {
      filename,
      path: path.join(folder, filename),
      size: payload.size,
      mimetype: payload.mimetype,
    };
  }

  async download(
    relativePath: string,
    range?: { start: number; end?: number },
  ): Promise<{ stream: Readable; size: number }> {
    const fullPath = path.join(this.uploadRoot, relativePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File not found');
    }

    const stat = await fs.promises.stat(fullPath);

    let stream: Readable;
    if (range) {
      stream = fs.createReadStream(fullPath, {
        start: range.start,
        end: range.end,
      });
    } else {
      stream = fs.createReadStream(fullPath);
    }

    return { stream, size: stat.size };
  }

  async delete(relativePath: string): Promise<void> {
    const fullPath = path.join(this.uploadRoot, relativePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadRoot, relativePath);
    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
