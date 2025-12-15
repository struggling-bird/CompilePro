import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>) {}

  async log(payload: { action: string; userId: string; actorId?: string; details?: Record<string, any> }) {
    const record = this.repo.create(payload);
    await this.repo.save(record);
    return { id: record.id };
  }
}
