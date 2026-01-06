import { Injectable, HttpException } from '@nestjs/common';
import { exec } from 'child_process';
import { RedisService } from '../redis/redis.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { UsersService } from '../users/users.service';
import { MetaprojectsService } from '../metaprojects/metaprojects.service';
import { GitSettingsDto } from './dto/git-settings.dto';
import { URL } from 'url';

@Injectable()
export class SystemService {
  constructor(
    private readonly redis: RedisService,
    private readonly gitlab: GitlabService,
    private readonly workspace: WorkspaceService,
    private readonly users: UsersService,
    private readonly projects: MetaprojectsService,
  ) {}

  async getWorkspaceStatsDetail() {
    const rawStats = await this.workspace.scanWorkspace();

    // Collect IDs
    const userIds = rawStats.map((u) => u.userId);
    const projectIds = rawStats.flatMap((u) =>
      u.projects.map((p) => p.projectId),
    );

    // Fetch details
    const userMap = new Map<string, { username: string; email: string }>();
    await Promise.all(
      userIds.map(async (id) => {
        try {
          const u = await this.users.getById(id);
          if (u) userMap.set(id, u);
        } catch (e) {
          void e;
        }
      }),
    );

    const projectMap = new Map<
      string,
      { name: string; description?: string }
    >();
    await Promise.all(
      projectIds.map(async (id) => {
        try {
          const p = await this.projects.getById(id);
          if (p) projectMap.set(id, p);
        } catch (e) {
          void e;
        }
      }),
    );

    // Assemble result
    let totalSize = 0;
    let totalProjects = 0;
    const userDetails = rawStats.map((u) => {
      const userInfo = userMap.get(u.userId);
      const projects = u.projects.map((p) => {
        const projectInfo = projectMap.get(p.projectId);
        return {
          id: p.projectId,
          name: projectInfo?.name ?? 'Unknown Project',
          description: projectInfo?.description ?? '',
          size: p.size,
        };
      });

      totalSize += u.size;
      totalProjects += projects.length;

      return {
        id: u.userId,
        username: userInfo?.username ?? 'Unknown User',
        email: userInfo?.email ?? '',
        size: u.size,
        projectCount: projects.length,
        projects,
      };
    });

    return {
      totalSize,
      totalUsers: userDetails.length,
      totalProjects,
      userSpaces: userDetails,
    };
  }

  checkGit(): Promise<{ installed: boolean; version?: string }> {
    return new Promise((resolve) => {
      const child = exec('git --version', { timeout: 5000 }, (err, stdout) => {
        if (err) return resolve({ installed: false });
        const out = stdout?.toString()?.trim() ?? '';
        const match = out.match(/git\s+version\s+([\d.]+)/i);
        resolve({ installed: true, version: match?.[1] ?? out });
      });
      child.on('error', () => resolve({ installed: false }));
    });
  }

  installGit(): { os: string; instructions: string[] } {
    const platform = process.platform;
    if (platform === 'darwin') {
      return {
        os: 'macOS',
        instructions: ['brew update', 'brew install git', 'git --version'],
      };
    }
    if (platform === 'linux') {
      return {
        os: 'Linux',
        instructions: [
          'sudo apt-get update || sudo yum check-update',
          'sudo apt-get install -y git || sudo yum install -y git',
          'git --version',
        ],
      };
    }
    if (platform === 'win32') {
      return {
        os: 'Windows',
        instructions: [
          '请从 https://git-scm.com/download/win 下载并安装 Git',
          '安装完成后在命令行执行: git --version',
        ],
      };
    }
    return {
      os: platform,
      instructions: ['请参考 https://git-scm.com/downloads 安装 Git'],
    };
  }

  async saveGitSettings(userId: string, dto: GitSettingsDto) {
    const normalized = this.normalizeEndpoint(dto.apiEndpoint);

    await this.redis.set(
      this.redisKey(userId),
      JSON.stringify({
        gitName: dto.gitName,
        apiEndpoint: normalized,
        accessToken: dto.accessToken,
        gitUsername: dto.gitUsername ?? '',
        gitPassword: dto.gitPassword ?? '',
      }),
    );

    const ok = await this.gitlab.validateAny(
      normalized,
      dto.accessToken,
      dto.gitUsername && dto.gitPassword
        ? { username: dto.gitUsername, password: dto.gitPassword }
        : undefined,
    );
    if (!ok) {
      throw new HttpException('Git 绑定校验失败（令牌或地址无效）', 400);
    }
    return { ok: true };
  }

  async getGitSettings(userId: string) {
    const raw = await this.redis.get(this.redisKey(userId));
    if (!raw)
      return {
        gitName: '',
        apiEndpoint: '',
        hasToken: false,
        hasBasic: false,
        gitUsername: '',
      };
    try {
      const parsed = JSON.parse(raw) as {
        gitName?: string;
        apiEndpoint?: string;
        accessToken?: string;
        gitUsername?: string;
        gitPassword?: string;
      };
      return {
        gitName: parsed.gitName ?? '',
        apiEndpoint: parsed.apiEndpoint ?? '',
        hasToken: !!parsed.accessToken,
        hasBasic: !!(parsed.gitUsername && parsed.gitPassword),
        gitUsername: parsed.gitUsername ?? '',
      };
    } catch {
      return {
        gitName: '',
        apiEndpoint: '',
        hasToken: false,
        hasBasic: false,
        gitUsername: '',
      };
    }
  }

  private redisKey(userId: string) {
    return `git:settings:${userId}`;
  }

  private normalizeEndpoint(raw: string): string {
    try {
      const u = new URL(raw);
      const base = `${u.protocol}//${u.host}`;
      const path = u.pathname.replace(/\/+$/, '');
      if (/\/api\/v4$/i.test(path)) return `${base}${path}`;
      return `${base}/api/v4`;
    } catch {
      const host = raw.replace(/\/+$/, '');
      if (/^https?:\/\//i.test(host)) {
        return `${host}/api/v4`;
      }
      return `https://${host}/api/v4`;
    }
  }
}
