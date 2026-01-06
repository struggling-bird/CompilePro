import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private readonly repo: Repository<Customer>,
  ) {}

  async create(payload: {
    name: string;
    status: 'active' | 'inactive';
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactDate?: string;
    contactAddress?: string;
  }) {
    const record = this.repo.create({
      name: payload.name,
      status: payload.status,
      contactPerson: payload.contactPerson ?? null,
      contactPhone: payload.contactPhone ?? null,
      contactEmail: payload.contactEmail ?? null,
      contractDate: payload.contactDate ?? null,
      contactAddress: payload.contactAddress ?? null,
    } as Partial<Customer>);
    const saved = await this.repo.save(record);
    return { id: saved.id };
  }

  async update(
    id: string,
    payload: {
      name?: string;
      status?: 'active' | 'inactive';
      contactPerson?: string;
      contactPhone?: string;
      contactEmail?: string;
      contactDate?: string;
      contactAddress?: string;
    },
  ) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new Error('客户不存在');
    if (payload.name !== undefined) found.name = payload.name;
    if (payload.status !== undefined) found.status = payload.status;
    if (payload.contactPerson !== undefined)
      found.contactPerson = payload.contactPerson ?? null;
    if (payload.contactPhone !== undefined)
      found.contactPhone = payload.contactPhone ?? null;
    if (payload.contactEmail !== undefined)
      found.contactEmail = payload.contactEmail ?? null;
    if (payload.contactDate !== undefined)
      found.contractDate = payload.contactDate ?? null;
    if (payload.contactAddress !== undefined)
      found.contactAddress = payload.contactAddress ?? null;
    await this.repo.save(found);
    return { id: found.id };
  }

  async remove(id: string) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new Error('客户不存在');
    await this.repo.remove(found);
    return { id };
  }

  async getById(id: string) {
    const c = await this.repo
      .createQueryBuilder('c')
      .where('c.id = :id', { id })
      .getOne();
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      contactPerson: c.contactPerson ?? null,
      contactPhone: c.contactPhone ?? null,
      contactEmail: c.contactEmail ?? null,
      contactDate: c.contractDate ?? null,
      contactAddress: c.contactAddress ?? null,
      createdAt: c.createdAt,
    };
  }

  async list() {
    const items = await this.repo.find({ order: { createdAt: 'DESC' } });
    return items.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      contactPerson: c.contactPerson ?? null,
      contactPhone: c.contactPhone ?? null,
      contactEmail: c.contactEmail ?? null,
      contactDate: c.contractDate ?? null,
      contactAddress: c.contactAddress ?? null,
      createdAt: c.createdAt,
    }));
  }
}
