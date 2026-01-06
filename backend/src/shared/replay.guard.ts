import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ReplayGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string> }>();
    const requestId: string | undefined = req.headers['x-request-id'];
    if (!requestId) {
      throw new BadRequestException('Missing X-Request-Id header');
    }
    const key = `replay:${requestId}`;
    const exists = await this.redis.get(key);
    if (exists) {
      throw new BadRequestException('Replay detected');
    }
    await this.redis.set(key, '1', 300); // 5 minutes TTL
    return true;
  }
}
