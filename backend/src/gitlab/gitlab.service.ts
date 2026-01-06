import { Injectable } from '@nestjs/common';
import * as https from 'https';
import { URL } from 'url';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

@Injectable()
export class GitlabService {
  normalizeRoot(raw: string): string {
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

  async validate(apiRoot: string, token: string): Promise<boolean> {
    const ok = await this.request<boolean>(apiRoot, token, '/projects', 'GET')
      .then(() => true)
      .catch((e) => {
        const status = (e as { status?: number }).status ?? 0;
        if (status === 401 || status === 403) return false;
        return false;
      });
    if (ok) return true;
    return this.request<boolean>(
      apiRoot,
      token,
      '/projects',
      'GET',
      undefined,
      { usePrivateToken: true },
    )
      .then(() => true)
      .catch(() => false);
  }

  async validateAny(
    apiRoot: string,
    token?: string,
    basicAuth?: { username: string; password: string },
  ): Promise<boolean> {
    if (token) {
      const okByToken = await this.validate(apiRoot, token);
      if (okByToken) return true;
    }
    if (basicAuth) {
      return this.request<boolean>(
        apiRoot,
        token ?? '',
        '/projects',
        'GET',
        undefined,
        { basicAuth },
      )
        .then(() => true)
        .catch(() => false);
    }
    return false;
  }

  request<T = unknown>(
    apiRoot: string,
    token: string,
    path: string,
    method: HttpMethod,
    body?: unknown,
    options?: {
      usePrivateToken?: boolean;
      basicAuth?: { username: string; password: string };
    },
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const root = this.normalizeRoot(apiRoot);
      const url = new URL(`${root}${path}`);
      const headers: Record<string, string> = {
        'User-Agent': 'CompilePro/1.0',
        Accept: 'application/json',
      };
      if (options?.basicAuth) {
        const base = Buffer.from(
          `${options.basicAuth.username}:${options.basicAuth.password}`,
        ).toString('base64');
        headers['Authorization'] = `Basic ${base}`;
      } else if (options?.usePrivateToken) headers['Private-Token'] = token;
      else headers['Authorization'] = `Bearer ${token}`;
      let payload = '';
      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
      }
      const req = https.request(url, { method, headers }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const status = res.statusCode ?? 0;
          if (status < 200 || status >= 300) {
            const err = Object.assign(new Error('GitLab request failed'), {
              status,
              body: data,
            });
            return reject(err);
          }
          try {
            const parsed = data ? (JSON.parse(data) as T) : ({} as T);
            resolve(parsed);
          } catch {
            resolve({} as T);
          }
        });
      });
      req.on('error', (err) => reject(err));
      if (payload) req.write(payload);
      req.end();
    });
  }
}
