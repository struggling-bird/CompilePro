import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import {
  TemplateVersion,
  TemplateVersionStatus,
} from './entities/template-version.entity';
import {
  TemplateGlobalConfig,
  ConfigType,
} from './entities/template-global-config.entity';
import { TemplateModule } from './entities/template-module.entity';
import { TemplateModuleConfig } from './entities/template-module-config.entity';
import { User } from '../users/user.entity';
import { StorageService } from '../storage/storage.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
} from './dto/create-template.dto';
import {
  CreateTemplateVersionDto,
  UpdateTemplateVersionDto,
} from './dto/create-template-version.dto';
import {
  CreateGlobalConfigDto,
  UpdateGlobalConfigDto,
} from './dto/create-global-config.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/create-module.dto';
import {
  CreateModuleConfigDto,
  UpdateModuleConfigDto,
} from './dto/create-module-config.dto';
import { TemplateListQueryDto } from './dto/list-query.dto';
import type { TemplateListItemSimple } from './dto/response.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
    @InjectRepository(TemplateVersion)
    private readonly versionRepository: Repository<TemplateVersion>,
    @InjectRepository(TemplateGlobalConfig)
    private readonly globalConfigRepository: Repository<TemplateGlobalConfig>,
    @InjectRepository(TemplateModule)
    private readonly moduleRepository: Repository<TemplateModule>,
    @InjectRepository(TemplateModuleConfig)
    private readonly moduleConfigRepository: Repository<TemplateModuleConfig>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createTemplateDto: CreateTemplateDto,
    authorId: string,
  ): Promise<Template> {
    const { initialVersion, ...templateData } = createTemplateDto;

    // Create template basic info
    const template = this.templateRepository.create({
      ...templateData,
      isEnabled: true,
      author: authorId,
    });
    const savedTemplate = await this.templateRepository.save(template);

    // If initial version is provided, create it
    if (initialVersion) {
      const version = this.versionRepository.create({
        ...initialVersion,
        template: savedTemplate,
      });
      await this.versionRepository.save(version);

      // Update latest version field if needed (though we compute it on list, some legacy/cache fields might need it)
      savedTemplate.latestVersion = version.version;
      await this.templateRepository.save(savedTemplate);

      // Attach the created version to the returned object
      savedTemplate.versions = [version];
    } else {
      savedTemplate.versions = [];
    }

    // Return template with initial version (if created)
    return savedTemplate;
  }

  async findAll(q?: TemplateListQueryDto): Promise<{
    items: TemplateListItemSimple[];
    meta: { total: number; page: number; pageSize: number };
  }> {
    const qb = this.templateRepository.createQueryBuilder('t');

    qb.leftJoinAndSelect('t.versions', 'v');

    if (q?.name) qb.andWhere('t.name LIKE :name', { name: `%${q.name}%` });
    if (q?.author)
      qb.andWhere('t.author LIKE :author', { author: `%${q.author}%` });
    if (q?.description)
      qb.andWhere('t.description LIKE :description', {
        description: `%${q.description}%`,
      });
    if (q?.createdFrom)
      qb.andWhere('t.createdAt >= :createdFrom', {
        createdFrom: q.createdFrom,
      });
    if (q?.createdTo)
      qb.andWhere('t.createdAt <= :createdTo', { createdTo: q.createdTo });
    if (q?.updatedFrom)
      qb.andWhere('t.updatedAt >= :updatedFrom', {
        updatedFrom: q.updatedFrom,
      });
    if (q?.updatedTo)
      qb.andWhere('t.updatedAt <= :updatedTo', { updatedTo: q.updatedTo });

    qb.orderBy('t.updatedAt', 'DESC');

    const page = Number(q?.page ?? 1);
    const pageSize = Number(q?.pageSize ?? 10);
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [templates, total] = await qb.getManyAndCount();

    const authorIds = Array.from(
      new Set(templates.map((t) => t.author).filter(Boolean)),
    );
    const authors = authorIds.length
      ? await this.usersRepository.find({
          where: authorIds.map((id) => ({ id })),
        })
      : [];
    const authorMap = new Map<string, string>();
    authors.forEach((u) => authorMap.set(u.id, u.username));

    const list: TemplateListItemSimple[] = templates.map((t) => {
      const mainActiveVersions = (t.versions ?? []).filter(
        (ver) => !ver.isBranch && ver.status === TemplateVersionStatus.ACTIVE,
      );
      const latest = mainActiveVersions.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )[mainActiveVersions.length - 1]?.version;

      return {
        id: t.id,
        name: t.name,
        description: t.description,
        author: authorMap.get(t.author) ?? t.author,
        updater: t.updater,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        latestVersion: latest ?? t.latestVersion ?? undefined,
      } as TemplateListItemSimple;
    });

    return {
      items: list,
      meta: {
        total,
        page,
        pageSize,
      },
    };
  }

  async findOne(id: string): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    if (template.author) {
      const u = await this.usersRepository.findOne({
        where: { id: template.author },
      });
      if (u) template.author = u.username;
    }
    return template;
  }

  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    const template = await this.findOne(id);

    // Update basic fields
    Object.assign(template, {
      name: updateTemplateDto.name,
      description: updateTemplateDto.description,
      // isEnabled, latestVersion, author are NOT in UpdateTemplateDto (it extends CreateTemplateDto)
      // If we want to allow updating them, we need to add them to UpdateTemplateDto or separate method
      // Assuming for now user only updates name/description via this endpoint
    });

    if (updateTemplateDto.isEnabled !== undefined) {
      template.isEnabled = updateTemplateDto.isEnabled;
    }

    // Note: We no longer handle nested version updates here as per requirement

    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }

  // --- Version Specific Methods ---

  async addVersion(
    templateId: string,
    createVersionDto: CreateTemplateVersionDto,
  ): Promise<TemplateVersion> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });
    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    const version = this.versionRepository.create({
      ...createVersionDto,
      template,
    });

    return this.versionRepository.save(version);
  }

  async listVersionsByTemplate(templateId: string): Promise<TemplateVersion[]> {
    return this.versionRepository.find({
      where: { templateId },
      order: { createdAt: 'DESC' },
      relations: [],
    });
  }

  async listModuleConfigs(
    versionId: string,
    moduleId: string,
  ): Promise<TemplateModuleConfig[]> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });
    if (!module || module.versionId !== versionId) {
      throw new NotFoundException(
        `Module with ID ${moduleId} not found for version ${versionId}`,
      );
    }
    return this.moduleConfigRepository.find({
      where: { moduleId, isHidden: false },
      order: { name: 'ASC' },
    });
  }

  async getVersionDocs(
    versionId: string,
  ): Promise<{ buildDoc?: string; updateDoc?: string }> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
    });
    if (!version)
      throw new NotFoundException(`Version with ID ${versionId} not found`);
    return { buildDoc: version.buildDoc, updateDoc: version.updateDoc };
  }

  async updateVersion(
    versionId: string,
    updateVersionDto: UpdateTemplateVersionDto,
  ): Promise<TemplateVersion> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
    });

    if (!version) {
      throw new NotFoundException(`Version with ID ${versionId} not found`);
    }

    // Merge updates (only fields in DTO)
    Object.assign(version, updateVersionDto);

    return this.versionRepository.save(version);
  }

  async deleteVersion(versionId: string): Promise<void> {
    const result = await this.versionRepository.delete(versionId);
    if (result.affected === 0) {
      throw new NotFoundException(`Version with ID ${versionId} not found`);
    }
  }

  // --- Global Config Methods ---

  private async bindFile(fileId: string): Promise<void> {
    await this.storageService.promoteFile(fileId);
  }

  async addGlobalConfig(
    versionId: string,
    createConfigDto: CreateGlobalConfigDto,
  ): Promise<TemplateGlobalConfig> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
    });
    if (!version)
      throw new NotFoundException(`Version with ID ${versionId} not found`);

    if (
      createConfigDto.type === ConfigType.FILE &&
      createConfigDto.defaultValue
    ) {
      await this.bindFile(createConfigDto.defaultValue);
    }

    const config = this.globalConfigRepository.create({
      ...createConfigDto,
      version,
    });
    return this.globalConfigRepository.save(config);
  }

  async listGlobalConfigs(versionId: string): Promise<TemplateGlobalConfig[]> {
    return this.globalConfigRepository.find({
      where: { versionId },
      order: { name: 'ASC' },
    });
  }

  async updateGlobalConfig(
    configId: string,
    updateConfigDto: UpdateGlobalConfigDto,
  ): Promise<TemplateGlobalConfig> {
    const config = await this.globalConfigRepository.findOne({
      where: { id: configId },
    });
    if (!config)
      throw new NotFoundException(
        `Global config with ID ${configId} not found`,
      );

    if (
      updateConfigDto.type === ConfigType.FILE &&
      updateConfigDto.defaultValue &&
      updateConfigDto.defaultValue !== config.defaultValue
    ) {
      await this.bindFile(updateConfigDto.defaultValue);
    }

    Object.assign(config, updateConfigDto);
    return this.globalConfigRepository.save(config);
  }

  async deleteGlobalConfig(configId: string, userId: string): Promise<void> {
    const config = await this.globalConfigRepository.findOne({
      where: { id: configId },
    });
    if (!config)
      throw new NotFoundException(
        `Global config with ID ${configId} not found`,
      );

    if (config.type === ConfigType.FILE && config.defaultValue) {
      try {
        const file = await this.storageService.getFile(config.defaultValue);
        if (file) {
          // Use file's owner ID to ensure quota refund and permission check passes
          // If file has no owner (system file), fallback to current user (might fail but safe default)
          await this.storageService.deleteFile(
            config.defaultValue,
            file.userId || userId,
          );
        }
      } catch (e) {
        console.warn(`Failed to delete file ${config.defaultValue}: ${e}`);
      }
    }

    const result = await this.globalConfigRepository.delete(configId);
    if (result.affected === 0)
      throw new NotFoundException(
        `Global config with ID ${configId} not found`,
      );
  }

  // --- Module Methods ---

  async addModule(
    versionId: string,
    createModuleDto: CreateModuleDto,
  ): Promise<TemplateModule> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
    });
    if (!version)
      throw new NotFoundException(`Version with ID ${versionId} not found`);

    const { configs, ...moduleData } = createModuleDto;
    const module = this.moduleRepository.create({
      ...moduleData,
      version,
    });

    const savedModule = await this.moduleRepository.save(module);

    // If configs provided in create DTO, create them
    if (configs && configs.length > 0) {
      const configEntities = configs.map((c) =>
        this.moduleConfigRepository.create({
          ...c,
          module: savedModule,
        }),
      );
      await this.moduleConfigRepository.save(configEntities);
      savedModule.configs = configEntities;
    }

    return savedModule;
  }

  async updateModule(
    moduleId: string,
    updateModuleDto: UpdateModuleDto,
  ): Promise<TemplateModule> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });
    if (!module)
      throw new NotFoundException(`Module with ID ${moduleId} not found`);

    // Only update module fields, not nested configs
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { configs, ...moduleData } = updateModuleDto;
    Object.assign(module, moduleData);

    return this.moduleRepository.save(module);
  }

  async deleteModule(moduleId: string): Promise<void> {
    const result = await this.moduleRepository.delete(moduleId);
    if (result.affected === 0)
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
  }

  // --- Module Config Methods ---

  async addModuleConfig(
    moduleId: string,
    createConfigDto: CreateModuleConfigDto,
  ): Promise<TemplateModuleConfig> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId },
    });
    if (!module)
      throw new NotFoundException(`Module with ID ${moduleId} not found`);

    const config = this.moduleConfigRepository.create({
      ...createConfigDto,
      module,
    });
    return this.moduleConfigRepository.save(config);
  }

  async updateModuleConfig(
    configId: string,
    updateConfigDto: UpdateModuleConfigDto,
  ): Promise<TemplateModuleConfig> {
    const config = await this.moduleConfigRepository.findOne({
      where: { id: configId },
    });
    if (!config)
      throw new NotFoundException(
        `Module config with ID ${configId} not found`,
      );

    Object.assign(config, updateConfigDto);
    return this.moduleConfigRepository.save(config);
  }

  async deleteModuleConfig(configId: string): Promise<void> {
    const result = await this.moduleConfigRepository.delete(configId);
    if (result.affected === 0)
      throw new NotFoundException(
        `Module config with ID ${configId} not found`,
      );
  }
}
