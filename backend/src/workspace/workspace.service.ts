import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { spawn } from 'child_process';
import { RedisService } from '../redis/redis.service';

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  rootDir(): string {
    const fromEnv = this.config.get<string>('WORKSPACE_ROOT');
    if (fromEnv && path.isAbsolute(fromEnv)) return fromEnv;
    const backendCwd = process.cwd();
    const repoRoot = path.resolve(path.join(backendCwd, '..'));
    return path.join(repoRoot, 'compile-space');
  }

  async ensureRoot(): Promise<string> {
    const root = this.rootDir();
    try {
      await stat(root);
    } catch {
      await mkdir(root, { recursive: true, mode: 0o755 });
      void 0;
    }
    return root;
  }

  safeJoin(root: string, seg: string): string {
    const candidate = path.join(root, seg);
    const rel = path.relative(root, candidate);
    if (rel.startsWith('..') || path.isAbsolute(rel))
      throw new HttpException('非法路径', 400);
    return candidate;
  }

  async ensureUserDir(userId: string): Promise<string> {
    const root = await this.ensureRoot();
    const userPath = this.safeJoin(root, userId);
    try {
      await stat(userPath);
    } catch {
      await mkdir(userPath, { recursive: true, mode: 0o700 });
      try {
        fs.chmodSync(userPath, 0o700);
      } catch {
        void 0;
      }
    }
    return userPath;
  }

  async cloneProject(
    userId: string,
    projectId: string,
    gitUrl: string,
    sourceType?: 'branch' | 'tag',
    sourceValue?: string,
  ): Promise<void> {
    const root = await this.ensureUserDir(userId);
    const projDirName = projectId;
    const targetDir = this.safeJoin(root, projDirName);
    const progressKey = `workspace:clone:${userId}:${projectId}`;
    try {
      await stat(targetDir);
      await this.redis.set(
        progressKey,
        JSON.stringify({ status: 'success', message: '已存在' }),
        3600,
      );
      return;
    } catch {
      void 0;
    }
    await mkdir(targetDir, { recursive: true, mode: 0o700 });
    const args: string[] = ['clone'];
    if (sourceType === 'branch' && sourceValue) {
      args.push('--branch', sourceValue);
    }
    args.push(gitUrl, targetDir);
    const child = spawn('git', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    await this.redis.set(
      progressKey,
      JSON.stringify({ status: 'running', message: '开始克隆' }),
      3600,
    );
    child.stdout.on('data', (buf: Buffer) => {
      const msg = buf.toString();
      this.redis
        .set(
          progressKey,
          JSON.stringify({ status: 'running', message: msg }),
          3600,
        )
        .catch(() => undefined);
    });
    child.stderr.on('data', (buf: Buffer) => {
      const msg = buf.toString();
      this.redis
        .set(
          progressKey,
          JSON.stringify({ status: 'running', message: msg }),
          3600,
        )
        .catch(() => undefined);
    });
    await new Promise<void>((resolve) => {
      child.on('close', (code) => {
        if (code === 0) {
          if (sourceType === 'tag' && sourceValue) {
            this.checkoutTag(targetDir, sourceValue).catch(() => undefined);
          }
          this.redis
            .set(
              progressKey,
              JSON.stringify({ status: 'success', message: '克隆完成' }),
              3600,
            )
            .catch(() => undefined);
        } else {
          this.redis
            .set(
              progressKey,
              JSON.stringify({ status: 'error', message: `失败 ${code}` }),
              3600,
            )
            .catch(() => undefined);
        }
        resolve();
      });
    });
  }

  private async checkoutTag(dir: string, tag: string): Promise<void> {
    await new Promise<void>((resolve) => {
      const child = spawn('git', ['-C', dir, 'checkout', `tags/${tag}`], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      child.on('close', () => resolve());
    });
  }

  async cloneStatus(userId: string, projectId: string) {
    const key = `workspace:clone:${userId}:${projectId}`;
    const raw = await this.redis.get(key);
    if (!raw) return { status: 'idle' };
    try {
      const parsed = JSON.parse(raw) as {
        status?: string;
        message?: string;
      };
      return {
        status: parsed.status ?? 'idle',
        message: parsed.message,
      };
    } catch {
      return { status: 'idle' };
    }
  }

  async stats() {
    const root = await this.ensureRoot();
    const users = await readdir(root).catch(() => []);
    let totalSize = 0;
    for (const u of users) {
      const up = path.join(root, u);
      totalSize += await this.dirSize(up).catch(() => 0);
    }
    return { root, users: users.length, size: totalSize };
  }

  private async dirSize(dir: string): Promise<number> {
    let size = 0;
    const items = await readdir(dir).catch(() => []);
    for (const name of items) {
      const p = path.join(dir, name);
      const s = await lstat(p).catch(() => null);
      if (!s) continue;
      if (s.isDirectory()) size += await this.dirSize(p);
      else size += s.size;
    }
    return size;
  }
}
