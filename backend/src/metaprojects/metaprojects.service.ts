import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaProject } from './metaproject.entity';
import { ProjectVersion } from './version.entity';
import { VersionConfig } from './version_config.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpsertConfigDto } from './dto/upsert-config.dto';
import { UpdateCommandsDto } from './dto/commands.dto';
import { UpdateArtifactsDto } from './dto/update-artifacts.dto';
import { AuditService } from '../audit/audit.service';
import { RedisService } from '../redis/redis.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { WorkspaceService } from '../workspace/workspace.service';
import type { ReadStream } from 'fs';

@Injectable()
export class MetaprojectsService {
  constructor(
    @InjectRepository(MetaProject)
    private readonly projects: Repository<MetaProject>,
    @InjectRepository(ProjectVersion)
    private readonly versions: Repository<ProjectVersion>,
    @InjectRepository(VersionConfig)
    private readonly configs: Repository<VersionConfig>,
    private readonly audit: AuditService,
    private readonly redis: RedisService,
    private readonly gitlab: GitlabService,
    private readonly workspace: WorkspaceService,
  ) {}

  async getById(id: string) {
    return this.projects.findOne({ where: { id } });
  }

  async createProject(userId: string, dto: CreateProjectDto) {
    const exists = await this.projects.findOne({ where: { name: dto.name } });
    if (exists) throw new HttpException('项目名称已存在', 400);
    const p = this.projects.create({
      name: dto.name,
      gitUrl: dto.gitUrl,
      description: dto.description ?? undefined,
      createdBy: userId,
    } as Partial<MetaProject>);
    const saved = await this.projects.save(p);
    if (dto.initialVersion && dto.sourceType && dto.sourceValue) {
      const v = this.versions.create({
        project: saved,
        version: dto.initialVersion,
        sourceType: dto.sourceType,
        sourceValue: dto.sourceValue,
        summary: dto.summary ?? undefined,
        status: 'enabled',
        createdBy: userId,
      } as Partial<ProjectVersion>);
      await this.versions.save(v);
    }
    this.workspace
      .cloneProject(
        userId,
        saved.id,
        dto.gitUrl,
        dto.sourceType,
        dto.sourceValue,
      )
      .catch(() => undefined);
    return saved;
  }

  async listProjects(query: { page: number; pageSize: number; q?: string }) {
    const qb = this.projects
      .createQueryBuilder('p')
      .where('p.deletedAt IS NULL');
    if (query.q) qb.andWhere('p.name LIKE :q', { q: `%${query.q}%` });
    qb.orderBy('p.createdAt', 'DESC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize);
    const [list, total] = await qb.getManyAndCount();
    const withLatest = await Promise.all(
      list.map(async (p) => {
        const v = await this.VLatestOfProject(p.id);
        return {
          id: p.id,
          name: p.name,
          gitUrl: p.gitUrl,
          description: p.description ?? null,
          createdBy: p.createdBy,
          createdAt: p.createdAt,
          latestVersion: v
            ? { version: v.version, status: v.status, summary: v.summary ?? '' }
            : null,
        };
      }),
    );
    return { list: withLatest, total };
  }

  private async VLatestOfProject(projectId: string) {
    return this.versions
      .createQueryBuilder('v')
      .where('v.projectId = :pid', { pid: projectId })
      .orderBy('v.updatedAt', 'DESC')
      .getOne();
  }

  async getProjectDetail(projectId: string) {
    const p = await this.projects.findOne({ where: { id: projectId } });
    if (!p) throw new HttpException('项目不存在', 404);
    const versions = await this.versions
      .createQueryBuilder('v')
      .where('v.projectId = :pid', { pid: projectId })
      .orderBy('v.createdAt', 'DESC')
      .getMany();
    return {
      id: p.id,
      name: p.name,
      gitUrl: p.gitUrl,
      description: p.description ?? null,
      createdBy: p.createdBy,
      createdAt: p.createdAt,
      versions,
    };
  }

  async retryClone(userId: string, projectId: string) {
    const p = await this.projects.findOne({ where: { id: projectId } });
    if (!p) throw new HttpException('项目不存在', 404);
    const v = await this.VLatestOfProject(projectId);
    this.workspace
      .cloneProject(userId, projectId, p.gitUrl, v?.sourceType, v?.sourceValue)
      .then(() => undefined)
      .catch(() => undefined);
    return { ok: true };
  }

  async cloneStatus(userId: string, projectId: string) {
    return this.workspace.cloneStatus(userId, projectId);
  }

  async createVersion(
    projectId: string,
    userId: string,
    dto: CreateVersionDto,
  ) {
    const p = await this.projects.findOne({ where: { id: projectId } });
    if (!p) throw new HttpException('项目不存在', 404);
    const v = this.versions.create({
      project: p,
      version: dto.version,
      sourceType: dto.sourceType,
      sourceValue: dto.sourceValue,
      summary: dto.summary ?? undefined,
      readmeDoc: dto.readmeDoc ?? undefined,
      buildDoc: dto.buildDoc ?? undefined,
      updateDoc: dto.updateDoc ?? undefined,
      compileCommands: dto.compileCommands ?? [],
      artifacts: dto.artifacts ?? [],
      status: 'enabled',
      createdBy: userId,
    } as Partial<ProjectVersion>);
    const saved = await this.versions.save(v);
    return saved;
  }

  async updateVersion(
    projectId: string,
    versionId: string,
    dto: UpdateVersionDto,
  ) {
    const v = await this.versions
      .createQueryBuilder('v')
      .where('v.id = :vid', { vid: versionId })
      .andWhere('v.projectId = :pid', { pid: projectId })
      .getOne();
    if (!v) throw new HttpException('版本不存在', 404);
    v.summary = dto.summary ?? v.summary;
    v.readmeDoc = dto.readmeDoc ?? v.readmeDoc;
    v.buildDoc = dto.buildDoc ?? v.buildDoc;
    v.updateDoc = dto.updateDoc ?? v.updateDoc;
    const saved = await this.versions.save(v);
    return saved;
  }

  async updateVersionStatus(
    projectId: string,
    versionId: string,
    dto: UpdateStatusDto,
    actorId: string,
  ) {
    const v = await this.versions
      .createQueryBuilder('v')
      .where('v.id = :vid', { vid: versionId })
      .andWhere('v.projectId = :pid', { pid: projectId })
      .getOne();
    if (!v) throw new HttpException('版本不存在', 404);
    if (v.status === dto.status) return { status: v.status };
    v.status = dto.status;
    await this.versions.save(v);
    await this.audit.log({
      action: 'version_status_change',
      userId: actorId,
      details: { projectId, versionId, status: dto.status },
    });
    return { status: v.status };
  }

  async upsertConfig(
    projectId: string,
    versionId: string,
    dto: UpsertConfigDto,
  ) {
    const v = await this.versions
      .createQueryBuilder('v')
      .where('v.id = :vid', { vid: versionId })
      .andWhere('v.projectId = :pid', { pid: projectId })
      .getOne();
    if (!v) throw new HttpException('版本不存在', 404);
    let c = await this.configs
      .createQueryBuilder('c')
      .where('c.versionId = :vid', { vid: versionId })
      .andWhere('c.name = :name', { name: dto.name })
      .getOne();
    if (!c)
      c = this.configs.create({ version: v, name: dto.name, type: dto.type });
    c.type = dto.type;
    c.textOrigin = dto.textOrigin ?? undefined;
    c.matchIndex = dto.matchIndex ?? 0;
    c.fileOriginPath = dto.fileOriginPath ?? undefined;
    c.description = dto.description ?? undefined;
    const saved = await this.configs.save(c);
    return saved;
  }

  async deleteConfig(
    projectId: string,
    versionId: string,
    configId: string,
    actorId: string,
  ) {
    const c = await this.configs
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.version', 'v')
      .where('c.id = :cid', { cid: configId })
      .andWhere('v.id = :vid', { vid: versionId })
      .andWhere('v.projectId = :pid', { pid: projectId })
      .getOne();
    if (!c) throw new HttpException('配置不存在', 404);
    await this.configs.softRemove(c);
    await this.audit.log({
      action: 'config_delete',
      userId: actorId,
      details: { projectId, versionId, configId },
    });
    return { id: configId };
  }

  async listConfigs(projectId: string, versionId: string) {
    const list = await this.configs
      .createQueryBuilder('c')
      .innerJoin('c.version', 'v')
      .where('v.id = :vid', { vid: versionId })
      .andWhere('v.projectId = :pid', { pid: projectId })
      .getMany();
    return { list };
  }

  async updateCommands(
    projectId: string,
    versionId: string,
    actorId: string,
    dto: UpdateCommandsDto,
  ) {
    const v = await this.versions
      .createQueryBuilder('v')
      .where('v.id = :vid', { vid: versionId })
      .andWhere('v.projectId = :pid', { pid: projectId })
      .getOne();
    if (!v) throw new HttpException('版本不存在', 404);
    if (dto.commands.length > 20)
      throw new HttpException('命令数量超过限制', 400);
    if (dto.commands.some((c) => typeof c !== 'string' || c.length > 1000))
      throw new HttpException('命令不合法', 400);
    v.compileCommands = dto.commands;
    await this.versions.save(v);
    await this.audit.log({
      action: 'commands_update',
      userId: actorId,
      details: { projectId, versionId, count: dto.commands.length },
    });
    return { ok: true };
  }

  async updateArtifacts(
    projectId: string,
    versionId: string,
    actorId: string,
    dto: UpdateArtifactsDto,
  ) {
    const v = await this.versions
      .createQueryBuilder('v')
      .where('v.id = :vid', { vid: versionId })
      .andWhere('v.projectId = :pid', { pid: projectId })
      .getOne();
    if (!v) throw new HttpException('版本不存在', 404);
    if (dto.artifacts.length > 20)
      throw new HttpException('制品配置数量超过限制', 400);
    if (dto.artifacts.some((c) => typeof c !== 'string' || c.length > 500))
      throw new HttpException('制品路径不合法', 400);
    v.artifacts = dto.artifacts;
    await this.versions.save(v);
    await this.audit.log({
      action: 'artifacts_update',
      userId: actorId,
      details: { projectId, versionId, count: dto.artifacts.length },
    });
    return { ok: true };
  }

  async deleteProject(projectId: string, actorId: string) {
    const p = await this.projects.findOne({ where: { id: projectId } });
    if (!p) throw new HttpException('项目不存在', 404);
    await this.projects.softRemove(p);
    await this.audit.log({
      action: 'project_delete',
      userId: actorId,
      details: { projectId },
    });
    return { id: projectId };
  }

  private async getGitSettings(userId: string): Promise<{
    apiEndpoint: string;
    accessToken?: string;
    basicAuth?: { username: string; password: string };
  } | null> {
    const raw = await this.redis.get(`git:settings:${userId}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as {
        apiEndpoint?: string;
        accessToken?: string;
        gitUsername?: string;
        gitPassword?: string;
      };
      if (!parsed.apiEndpoint) return null;
      const basicOk = parsed.gitUsername && parsed.gitPassword;
      const tokenOk = !!parsed.accessToken;
      if (!basicOk && !tokenOk) return null;
      return {
        apiEndpoint: parsed.apiEndpoint,
        accessToken: tokenOk ? parsed.accessToken : undefined,
        basicAuth: basicOk
          ? { username: parsed.gitUsername!, password: parsed.gitPassword! }
          : undefined,
      };
    } catch {
      return null;
    }
  }

  private parseProjectPath(gitUrl: string): string {
    const trimmed = gitUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const u = new URL(trimmed);
        const path = u.pathname.replace(/^\/+/, '').replace(/\.git$/i, '');
        return path;
      } catch {
        return trimmed;
      }
    }
    const sshMatch = trimmed.match(/^[\w.-]+@[^:]+:(.+)$/);
    if (sshMatch) {
      return sshMatch[1].replace(/\.git$/i, '');
    }
    const scpLike = trimmed.match(/^ssh:\/\/[^/]+\/(.+)$/i);
    if (scpLike) {
      return scpLike[1].replace(/\.git$/i, '');
    }
    return trimmed.replace(/\.git$/i, '');
  }

  async listGitBranches(userId: string, gitUrl: string) {
    const settings = await this.getGitSettings(userId);
    if (!settings) throw new HttpException('未配置 Git 绑定', 400);
    const projectPath = this.parseProjectPath(gitUrl);
    const encoded = encodeURIComponent(projectPath);
    const arr = await this.listAllPages(
      settings,
      `/projects/${encoded}/repository/branches`,
    );
    const list = arr.map((b) => {
      const name = (b as Record<string, unknown>)?.['name'];
      return { name: typeof name === 'string' ? name : '' };
    });
    return { list };
  }

  async listGitTags(userId: string, gitUrl: string) {
    const settings = await this.getGitSettings(userId);
    if (!settings) throw new HttpException('未配置 Git 绑定', 400);
    const projectPath = this.parseProjectPath(gitUrl);
    const encoded = encodeURIComponent(projectPath);
    const arr = await this.listAllPages(
      settings,
      `/projects/${encoded}/repository/tags`,
    );
    const list = arr.map((t) => {
      const name = (t as Record<string, unknown>)?.['name'];
      return { name: typeof name === 'string' ? name : '' };
    });
    return { list };
  }

  async listProjectFiles(userId: string, projectId: string) {
    return this.workspace.listFiles(userId, projectId);
  }

  async getFileContent(userId: string, projectId: string, filePath: string) {
    return this.workspace.getFileContent(userId, projectId, filePath);
  }

  async getFileStream(
    userId: string,
    projectId: string,
    filePath: string,
  ): Promise<{ stream: ReadStream; size: number; mimetype: string }> {
    return this.workspace.getFileStream(userId, projectId, filePath);
  }

  private async listAllPages(
    settings: {
      apiEndpoint: string;
      accessToken?: string;
      basicAuth?: { username: string; password: string };
    },
    basePath: string,
  ): Promise<unknown[]> {
    const perPage = 100;
    let page = 1;
    const all: unknown[] = [];

    while (true) {
      let res: unknown[] = [];
      const path = `${basePath}?per_page=${perPage}&page=${page}`;
      try {
        res = await this.gitlab.request<unknown[]>(
          settings.apiEndpoint,
          settings.accessToken ?? '',
          path,
          'GET',
        );
      } catch (e) {
        const status = (e as { status?: number }).status ?? 0;
        if (settings.basicAuth && (status === 401 || status === 403)) {
          res = await this.gitlab.request<unknown[]>(
            settings.apiEndpoint,
            '',
            path,
            'GET',
            undefined,
            { basicAuth: settings.basicAuth },
          );
        } else {
          throw e;
        }
      }
      const arr = Array.isArray(res) ? res : [];
      all.push(...arr);
      if (arr.length < perPage) break;
      page += 1;
      if (page > 1000) break;
    }
    return all;
  }
}
