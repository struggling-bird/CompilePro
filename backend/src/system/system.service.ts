import { Injectable, HttpException } from '@nestjs/common';
import { exec } from 'child_process';
import { RedisService } from '../redis/redis.service';
import { GitlabService } from '../gitlab/gitlab.service';
import * as https from 'https';
import { URL } from 'url';
import { GitSettingsDto } from './dto/git-settings.dto';

@Injectable()
export class SystemService {
  constructor(
    private readonly redis: RedisService,
    private readonly gitlab: GitlabService,
  ) {}
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
      }),
    );

    const ok = await this.gitlab.validate(normalized, dto.accessToken);
    if (!ok) {
      throw new HttpException('Git 绑定校验失败（令牌或地址无效）', 400);
    }
    return { ok: true };
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

  private validateGitSettings(
    apiRoot: string,
    token: string,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const url = new URL(`${apiRoot}/projects`);
      const options: https.RequestOptions = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'CompilePro/1.0',
          Accept: 'application/json',
        },
      };
      const req = https.request(url, options, (res) => {
        const status = res.statusCode ?? 0;
        if (status === 200) return resolve(true);
        if (status === 401) return resolve(false);
        if (status === 403) return resolve(false);
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed: unknown = {};
          try {
            parsed = data ? (JSON.parse(data) as unknown) : {};
          } catch {
            parsed = {};
          }
          const body = parsed as { message?: string };
          if (body && body.message === '401 Unauthorized')
            return resolve(false);
          resolve(status >= 200 && status < 300);
        });
      });
      req.on('error', () => resolve(false));
      req.end();
    }).then(async (ok) => {
      if (ok) return true;
      return new Promise((resolve) => {
        const url = new URL(`${apiRoot}/projects`);
        const options: https.RequestOptions = {
          method: 'GET',
          headers: {
            'Private-Token': token,
            'User-Agent': 'CompilePro/1.0',
            Accept: 'application/json',
          },
        };
        const req = https.request(url, options, (res) => {
          const status = res.statusCode ?? 0;
          if (status === 200) return resolve(true);
          resolve(false);
        });
        req.on('error', () => resolve(false));
        req.end();
      });
    });
  }
}
