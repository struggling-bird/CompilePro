import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async getById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return null;
    return { id: user.id, username: user.username, createdAt: user.createdAt };
  }
}
