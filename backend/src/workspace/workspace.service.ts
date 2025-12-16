import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { spawn } from 'child_process';
import { RedisService } from '../redis/redis.service';
import { WinstonLogger } from '../logger/logger.provider';

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const rm = promisify(fs.rm);

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly logger: WinstonLogger,
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
      const ok = await this.isGitRepo(targetDir);
      if (ok) {
        await this.redis.set(
          progressKey,
          JSON.stringify({ status: 'success', message: '已存在' }),
          3600,
        );
        return;
      } else {
        await rm(targetDir, { recursive: true, force: true });
      }
    } catch {
      void 0;
    }
    const args: string[] = [];
    const isHttp = this.isHttpUrl(gitUrl);
    if (isHttp) {
      const basic = await this.getUserGitBasicAuth(userId);
      if (!basic) {
        await this.redis.set(
          progressKey,
          JSON.stringify({
            status: 'error',
            message: 'HTTP 仓库需要配置用户名密码',
            event: 'credential_required',
          }),
          3600,
        );
        this.logger.warn(
          JSON.stringify({
            event: 'git_clone_blocked_no_credentials',
            gitUrl,
            targetDir,
          }),
          'Workspace',
        );
        return;
      }
      const base64 = Buffer.from(
        `${basic.username}:${basic.password}`,
      ).toString('base64');
      args.push('-c', `http.extraHeader=Authorization: Basic ${base64}`);
    }
    args.push('clone');
    if (sourceType === 'branch' && sourceValue) {
      args.push('--branch', sourceValue);
    }
    args.push(gitUrl, targetDir);
    const sanitizedArgs = args.map((a) =>
      a.startsWith('http.extraHeader=Authorization: Basic ')
        ? 'http.extraHeader=Authorization: Basic ***'
        : a,
    );
    const child = spawn('git', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
    this.logger.log(
      JSON.stringify({
        event: 'git_clone_start',
        gitUrl,
        targetDir,
        args: sanitizedArgs,
      }),
      'Workspace',
    );
    await this.redis.set(
      progressKey,
      JSON.stringify({ status: 'running', message: '开始克隆' }),
      3600,
    );
    let lastStderr = '';
    child.stdout.on('data', (buf: Buffer) => {
      const msg = buf.toString();
      this.logger.log(
        JSON.stringify({ event: 'git_clone_stdout', message: msg.trim() }),
        'Workspace',
      );
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
      lastStderr = msg.trim();
      this.logger.warn(
        JSON.stringify({ event: 'git_clone_stderr', message: msg.trim() }),
        'Workspace',
      );
      this.redis
        .set(
          progressKey,
          JSON.stringify({ status: 'running', message: msg }),
          3600,
        )
        .catch(() => undefined);
    });
    await new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
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
          this.logger.log(
            JSON.stringify({ event: 'git_clone_done', code }),
            'Workspace',
          );
        } else {
          const mapped = this.mapGitError(lastStderr, code ?? undefined);
          this.redis
            .set(
              progressKey,
              JSON.stringify({
                status: 'error',
                message: mapped.message,
                event: mapped.event,
              }),
              3600,
            )
            .catch(() => undefined);
          this.logger.error(
            JSON.stringify({ event: 'git_clone_fail', code, mapped }),
            undefined,
            'Workspace',
          );
        }
        finish();
      });
      child.on('error', (err) => {
        const emsg = String(err?.message ?? err);
        const mapped = this.mapGitError(emsg, undefined);
        this.redis
          .set(
            progressKey,
            JSON.stringify({
              status: 'error',
              message: mapped.message,
              event: mapped.event,
            }),
            3600,
          )
          .catch(() => undefined);
        this.logger.error(
          JSON.stringify({ event: 'git_clone_spawn_error', raw: emsg, mapped }),
          err?.stack,
          'Workspace',
        );
        finish();
      });
    });
  }

  private isHttpUrl(url: string): boolean {
    return /^https?:\/\//i.test(url.trim());
  }

  private async getUserGitBasicAuth(
    userId: string,
  ): Promise<{ username: string; password: string } | null> {
    const raw = await this.redis.get(`git:settings:${userId}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as {
        gitUsername?: string;
        gitPassword?: string;
      };
      if (!parsed.gitUsername || !parsed.gitPassword) return null;
      return { username: parsed.gitUsername, password: parsed.gitPassword };
    } catch {
      return null;
    }
  }

  private async checkoutTag(dir: string, tag: string): Promise<void> {
    await new Promise<void>((resolve) => {
      const child = spawn('git', ['-C', dir, 'checkout', `tags/${tag}`], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      this.logger.log(
        JSON.stringify({ event: 'git_checkout_tag_start', dir, tag }),
        'Workspace',
      );
      child.on('close', () => resolve());
    });
  }

  private async isGitRepo(dir: string): Promise<boolean> {
    try {
      await stat(path.join(dir, '.git'));
      return true;
    } catch {
      return false;
    }
  }

  private mapGitError(
    stderr: string,
    code?: number,
  ): { event: string; message: string } {
    const s = (stderr || '').toLowerCase();
    if (
      s.includes('authentication failed') ||
      s.includes('access denied') ||
      s.includes('http basic')
    ) {
      return {
        event: 'auth_failed',
        message: '认证失败：请检查访问令牌/账号密码',
      };
    }
    if (s.includes('repository not found') || s.includes('404')) {
      return { event: 'repo_not_found', message: '仓库不存在或地址错误' };
    }
    if (
      s.includes('could not resolve host') ||
      s.includes('name or service not known')
    ) {
      return { event: 'dns_error', message: '网络解析失败：请检查网络或域名' };
    }
    if (s.includes('permission denied (publickey)')) {
      return { event: 'ssh_key_missing', message: 'SSH 公钥未配置或无权限' };
    }
    if (s.includes('ssl certificate problem')) {
      return { event: 'ssl_error', message: 'SSL 证书异常：请检查证书配置' };
    }
    if (
      s.includes('unable to access') ||
      s.includes('rpc failed') ||
      s.includes('failed to connect')
    ) {
      return { event: 'network_error', message: '网络异常：无法访问远程仓库' };
    }
    if (s.includes('could not read username')) {
      return {
        event: 'credential_required',
        message: '需要凭据：请配置用户名/令牌',
      };
    }
    if (s.includes('fatal:') || (code && code !== 0)) {
      return { event: 'git_error', message: 'Git 操作失败：请检查仓库与凭据' };
    }
    return { event: 'unknown', message: '未知错误：请查看日志详情' };
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
