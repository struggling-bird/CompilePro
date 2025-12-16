import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class SystemService {
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
        instructions: [
          'brew update',
          'brew install git',
          'git --version',
        ],
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
      instructions: [
        '请参考 https://git-scm.com/downloads 安装 Git',
      ],
    };
  }
}

