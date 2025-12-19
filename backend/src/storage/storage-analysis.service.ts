import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';
import { UsersService } from '../users/users.service';

export interface StorageTrend {
  date: string;
  size: number;
}

export interface FileTypeStat {
  type: string;
  size: number;
  count: number;
}

export interface HotFile {
  id: string;
  name: string;
  path: string;
  size: number;
  accessCount: number;
  lastAccessed: Date;
  owner: string;
}

export interface QuotaInfo {
  total: number;
  used: number;
  warningThreshold: number;
}

interface RawTypeStat {
  type: string;
  size: string; // SUM returns string in some DB drivers
  count: string; // COUNT returns string
}

@Injectable()
export class StorageAnalysisService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly usersService: UsersService,
  ) {}

  async getStorageTrends(userId: string): Promise<StorageTrend[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const files = await this.fileRepository
      .createQueryBuilder('file')
      .where('file.userId = :userId', { userId })
      .andWhere('file.created_at >= :date', { date: thirtyDaysAgo })
      .select(['file.created_at', 'file.size'])
      .getMany();

    const trendMap = new Map<string, number>();

    files.forEach((f) => {
      const date = f.createdAt.toISOString().split('T')[0];
      const current = trendMap.get(date) || 0;
      trendMap.set(date, current + f.size);
    });

    const trends: StorageTrend[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trends.push({
        date: dateStr,
        size: (trendMap.get(dateStr) || 0) / (1024 * 1024), // MB
      });
    }

    return trends.reverse();
  }

  async getFileTypeDistribution(userId: string): Promise<FileTypeStat[]> {
    const stats = await this.fileRepository
      .createQueryBuilder('file')
      .where('file.userId = :userId', { userId })
      .andWhere('file.isFolder = :isFolder', { isFolder: false })
      .select('file.mimetype', 'type')
      .addSelect('SUM(file.size)', 'size')
      .addSelect('COUNT(file.id)', 'count')
      .groupBy('file.mimetype')
      .getRawMany();

    const categories: Record<string, { size: number; count: number }> = {};

    (stats as unknown as RawTypeStat[]).forEach((s) => {
      let type = 'Others';
      const mime = s.type || '';
      if (mime.startsWith('image/')) type = 'Images';
      else if (mime.startsWith('video/')) type = 'Videos';
      else if (mime.startsWith('audio/')) type = 'Audio';
      else if (
        mime.includes('pdf') ||
        mime.includes('document') ||
        mime.includes('msword')
      ) {
        type = 'Documents';
      } else if (mime.includes('zip') || mime.includes('compressed')) {
        type = 'Archives';
      }

      if (!categories[type]) categories[type] = { size: 0, count: 0 };
      categories[type].size += Number(s.size);
      categories[type].count += Number(s.count);
    });

    return Object.entries(categories).map(([type, data]) => ({
      type,
      size: data.size / (1024 * 1024), // MB
      count: data.count,
    }));
  }

  async getHotFiles(userId: string): Promise<HotFile[]> {
    const files = await this.fileRepository.find({
      where: { userId, isFolder: false },
      order: { accessCount: 'DESC' },
      take: 10,
    });

    return files.map((f) => ({
      id: f.id,
      name: f.originalName,
      path: f.path,
      size: f.size,
      accessCount: f.accessCount,
      lastAccessed: f.lastAccessedAt || f.updatedAt,
      owner: 'Me',
    }));
  }

  async getQuotaInfo(userId: string): Promise<QuotaInfo> {
    const quota = await this.usersService.getUserQuota(userId);
    return {
      total: quota.total / (1024 * 1024 * 1024), // GB
      used: quota.used / (1024 * 1024 * 1024), // GB
      warningThreshold: 80,
    };
  }
}
