import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(Role) private readonly roles: Repository<Role>,
  ) {}

  async getById(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role
        ? {
            name: user.role.name,
            description: user.role.description,
            permissions: user.role.permissions,
          }
        : null,
      createdAt: user.createdAt,
    };
  }

  async getByUsername(username: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.username = :username', { username })
      .getOne();
  }

  async getByEmail(email: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.email = :email', { email })
      .getOne();
  }

  async createUser(payload: {
    username: string;
    password: string;
    email: string;
    roleName?: string;
  }) {
    const exists = await this.getByUsername(payload.username);
    if (exists) throw new Error('用户名已存在');
    const existsEmail = await this.getByEmail(payload.email);
    if (existsEmail) throw new Error('邮箱已存在');
    const roleFound = payload.roleName
      ? await this.roles.findOne({ where: { name: payload.roleName } })
      : await this.roles.findOne({ where: { name: 'user' } });
    const role =
      roleFound ??
      (await this.roles.save(
        this.roles.create({
          name: 'user',
          description: '默认用户',
          permissions: {},
        }),
      ));
    const hashed = await bcrypt.hash(payload.password, 10);
    const user = this.repo.create({
      username: payload.username,
      password: hashed,
      email: payload.email,
      status: 'active',
      role,
    });
    const saved = await this.repo.save(user);
    return { id: saved.id };
  }

  validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async setStatus(userId: string, status: 'active' | 'inactive') {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new Error('用户不存在');
    user.status = status;
    await this.repo.save(user);
    return { id: user.id, status: user.status };
  }

  async assignRole(userId: string, roleName: string) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new Error('用户不存在');
    const role = await this.roles.findOne({ where: { name: roleName } });
    if (!role) throw new Error('角色不存在');
    user.role = role;
    await this.repo.save(user);
    return { id: user.id, role: { name: role.name } };
  }
}
