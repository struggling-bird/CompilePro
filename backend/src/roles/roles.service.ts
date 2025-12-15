import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly repo: Repository<Role>,
  ) {}

  async createRole(payload: { name: string; description?: string }) {
    const exists = await this.repo.findOne({ where: { name: payload.name } });
    if (exists) throw new Error('角色已存在');
    const role = this.repo.create(payload);
    const saved = await this.repo.save(role);
    return { id: saved.id };
  }

  async updatePermissions(name: string, permissions: Record<string, any>) {
    const role = await this.repo.findOne({ where: { name } });
    if (!role) throw new Error('角色不存在');
    role.permissions = permissions;
    await this.repo.save(role);
    return { name: role.name, permissions: role.permissions };
  }

  async findByName(name: string) {
    return this.repo.findOne({ where: { name } });
  }
}
