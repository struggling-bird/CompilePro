import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(payload: {
    username: string;
    password: string;
    email: string;
    roleName?: string;
  }) {
    return this.users.createUser(payload);
  }

  async login(username: string, password: string) {
    const user = await this.users.getByUsername(username);
    if (!user) throw new HttpException('用户不存在', 404);
    if (user.status !== 'active') throw new HttpException('用户已停用', 403);
    const ok = await this.users.validatePassword(user, password);
    if (!ok) throw new HttpException('密码错误', 401);
    const payload = { sub: user.id, username: user.username };
    const token = await this.jwt.signAsync(payload);
    return { token };
  }

  async me(userId: string) {
    return this.users.getById(userId);
  }
}
