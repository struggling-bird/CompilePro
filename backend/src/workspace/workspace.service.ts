import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { spawn } from 'child_process';
import * as readline from 'readline';
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
    const rlOut = readline.createInterface({ input: child.stdout });
    const rlErr = readline.createInterface({ input: child.stderr });
    rlOut.on('line', (line: string) => {
      const msg = line;
      this.logger.log(
        JSON.stringify({ event: 'git_clone_stdout', message: msg }),
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
    rlErr.on('line', (line: string) => {
      const msg = line;
      lastStderr = msg.trim();
      this.logger.warn(
        JSON.stringify({ event: 'git_clone_stderr', message: msg }),
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
    if (raw) {
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
        // ignore parse error
      }
    }

    // If no status in redis, check file system
    const root = await this.ensureUserDir(userId);
    const targetDir = this.safeJoin(root, projectId);
    try {
      await stat(targetDir);
      const ok = await this.isGitRepo(targetDir);
      if (ok) {
        // Restore success status to redis to avoid fs check next time
        await this.redis.set(
          key,
          JSON.stringify({ status: 'success', message: '已就绪' }),
          3600,
        );
        return { status: 'success', message: '已就绪' };
      }
    } catch {
      // ignore
    }

    return { status: 'idle' };
  }

  async scanWorkspace() {
    const root = await this.ensureRoot();
    const users = await readdir(root).catch(() => []);
    const result: {
      userId: string;
      size: number;
      projects: { projectId: string; size: number }[];
    }[] = [];

    for (const u of users) {
      const up = path.join(root, u);
      const uStat = await lstat(up).catch(() => null);
      if (!uStat || !uStat.isDirectory()) continue;

      const projects: { projectId: string; size: number }[] = [];
      const projectDirs = await readdir(up).catch(() => []);

      for (const p of projectDirs) {
        const pp = path.join(up, p);
        const pStat = await lstat(pp).catch(() => null);
        if (!pStat || !pStat.isDirectory()) continue;

        const pSize = await this.dirSize(pp);
        projects.push({ projectId: p, size: pSize });
      }

      // Add files in user root to size if any (though structure should be user/project)
      // For now we assume size is sum of projects + user dir metadata
      // But dirSize recursive already covers everything in 'up'
      const realUserSize = await this.dirSize(up);

      result.push({
        userId: u,
        size: realUserSize,
        projects,
      });
    }
    return result;
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

  async listFiles(
    userId: string,
    projectId: string,
  ): Promise<
    Array<{
      title: string;
      key: string;
      isLeaf: boolean;
      children?: Array<{
        title: string;
        key: string;
        isLeaf: boolean;
        children?: any[];
      }>;
    }>
  > {
    const root = await this.ensureUserDir(userId);
    const projDir = this.safeJoin(root, projectId);
    try {
      await stat(projDir);
    } catch {
      throw new HttpException('项目尚未克隆或不存在', 404);
    }

    const buildTree = async (
      currentPath: string,
      relativePath: string = '',
    ): Promise<
      Array<{ title: string; key: string; isLeaf: boolean; children?: any[] }>
    > => {
      const entries = await readdir(currentPath, { withFileTypes: true });
      const result: Array<{
        title: string;
        key: string;
        isLeaf: boolean;
        children?: any[];
      }> = [];
      for (const entry of entries) {
        if (entry.name === '.git') continue;
        const fullPath = path.join(currentPath, entry.name);
        const relPath = path.join(relativePath, entry.name);
        const node: {
          title: string;
          key: string;
          isLeaf: boolean;
          children?: any[];
        } = {
          title: entry.name,
          key: relPath,
          isLeaf: false,
        };
        if (entry.isDirectory()) {
          node.children = await buildTree(fullPath, relPath);
          node.isLeaf = false;
        } else {
          node.isLeaf = true;
        }
        result.push(node);
      }
      return result.sort((a, b) => {
        if (a.children && !b.children) return -1;
        if (!a.children && b.children) return 1;
        return a.title.localeCompare(b.title);
      });
    };

    return buildTree(projDir);
  }

  async getFileContent(
    userId: string,
    projectId: string,
    filePath: string,
  ): Promise<string> {
    const root = await this.ensureUserDir(userId);
    const projDir = this.safeJoin(root, projectId);
    const targetPath = this.safeJoin(projDir, filePath);
    try {
      const content = await fs.promises.readFile(targetPath, 'utf-8');
      return content;
    } catch {
      throw new HttpException('无法读取文件', 404);
    }
  }

  async getFileStream(
    userId: string,
    projectId: string,
    filePath: string,
  ): Promise<{ stream: fs.ReadStream; size: number; mimetype: string }> {
    const root = await this.ensureUserDir(userId);
    const projDir = this.safeJoin(root, projectId);
    const targetPath = this.safeJoin(projDir, filePath);
    const statInfo = await stat(targetPath).catch(() => null);
    if (!statInfo || !statInfo.isFile()) {
      throw new HttpException('文件不存在', 404);
    }

    const ext = path.extname(targetPath).toLowerCase().replace(/^\./, '');
    const mimeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      mp4: 'video/mp4',
      pdf: 'application/pdf',
      txt: 'text/plain; charset=utf-8',
      js: 'application/javascript; charset=utf-8',
      ts: 'application/typescript; charset=utf-8',
      json: 'application/json; charset=utf-8',
      css: 'text/css; charset=utf-8',
      html: 'text/html; charset=utf-8',
      md: 'text/markdown; charset=utf-8',
      yml: 'text/yaml; charset=utf-8',
      yaml: 'text/yaml; charset=utf-8',
    };
    const mimetype = mimeMap[ext] || 'application/octet-stream';
    const stream = fs.createReadStream(targetPath);
    return { stream, size: statInfo.size, mimetype };
  }
}
