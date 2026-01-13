/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Compilation } from './entities/compilation.entity';
import { CreateCompilationDto } from './dto/create-compilation.dto';
import { UpdateCompilationDto } from './dto/update-compilation.dto';
import { CompilationListQueryDto } from './dto/list-query.dto';
import { TemplateVersion } from '../templates/entities/template-version.entity';
import { TemplateGlobalConfig } from '../templates/entities/template-global-config.entity';
import { TemplateModule } from '../templates/entities/template-module.entity';
import { UpdateGlobalConfigsDto } from './dto/update-global-configs.dto';
import { UpdateModuleConfigsDto } from './dto/update-module-configs.dto';

@Injectable()
export class CompilationsService {
  constructor(
    @InjectRepository(Compilation)
    private readonly compilationRepo: Repository<Compilation>,

    @InjectRepository(TemplateVersion)
    private readonly versionRepo: Repository<TemplateVersion>,

    @InjectRepository(TemplateGlobalConfig)
    private readonly globalConfigRepo: Repository<TemplateGlobalConfig>,

    @InjectRepository(TemplateModule)
    private readonly moduleRepo: Repository<TemplateModule>,
  ) {}

  async create(createDto: CreateCompilationDto, creator: string) {
    // 1. Fetch Template Version to inherit configs

    const version: any = await this.versionRepo.findOne({
      where: { id: createDto.templateVersionId },
    });
    if (!version) {
      throw new NotFoundException('Template Version not found');
    }

    // 2. Inherit Global Configs
    // Fetch all global configs for this version

    const templateGlobalConfigs: any[] = await this.globalConfigRepo.find({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where: { versionId: version.id },
    });

    const initialGlobalConfigs = templateGlobalConfigs.map((config) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      configId: config.id as string,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      value: (config.defaultValue || '') as string,
    }));

    // 3. Inherit Module Configs
    // Fetch all modules and their configs for this version

    const templateModules: any[] = await this.moduleRepo.find({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where: { versionId: version.id },
      relations: ['configs'],
    });

    const initialModuleConfigs: {
      moduleId: string;
      configId: string;
      value: string;
    }[] = [];

    templateModules.forEach((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (mod.configs) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        mod.configs.forEach((config: any) => {
          initialModuleConfigs.push({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            moduleId: mod.id as string,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            configId: config.id as string,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            value: (config.mappingValue || '') as string,
          });
        });
      }
    });

    // 4. Create Compilation Entity
    const compilation = this.compilationRepo.create({
      ...createDto,
      createdBy: creator,
      globalConfigs: initialGlobalConfigs,
      moduleConfigs: initialModuleConfigs,
    });

    return this.compilationRepo.save(compilation);
  }

  async findAll(query: CompilationListQueryDto) {
    const { page = 1, pageSize = 10, keyword, customerId, templateId } = query;
    const skip = (page - 1) * pageSize;

    const qb = this.compilationRepo
      .createQueryBuilder('compilation')
      .leftJoinAndSelect('compilation.template', 'template')
      .leftJoinAndSelect('compilation.templateVersion', 'version')
      .leftJoinAndSelect('compilation.customer', 'customer')
      .leftJoinAndSelect('compilation.environment', 'environment')
      .orderBy('compilation.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    if (keyword) {
      qb.andWhere('compilation.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    if (customerId) {
      qb.andWhere('compilation.customerId = :customerId', { customerId });
    }

    if (templateId) {
      qb.andWhere('compilation.templateId = :templateId', { templateId });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    const compilation = await this.compilationRepo.findOne({
      where: { id },
      relations: ['template', 'templateVersion', 'customer', 'environment'],
    });
    if (!compilation) {
      throw new NotFoundException('Compilation not found');
    }
    return compilation;
  }

  async update(id: string, updateDto: UpdateCompilationDto) {
    const compilation = await this.findOne(id);
    Object.assign(compilation, updateDto);
    return this.compilationRepo.save(compilation);
  }

  async remove(id: string) {
    const result = await this.compilationRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Compilation not found');
    }
    return { success: true };
  }

  // --- Configuration Management ---

  async getGlobalConfigs(id: string) {
    const compilation = await this.findOne(id);
    return compilation.globalConfigs || [];
  }

  async updateGlobalConfigs(id: string, dto: UpdateGlobalConfigsDto) {
    const compilation = await this.findOne(id);

    // Merge strategy: Update existing, Add new
    const currentConfigs = compilation.globalConfigs || [];
    const newConfigsMap = new Map(
      dto.configs.map((c) => [c.configId, c.value]),
    );

    // Update existing
    currentConfigs.forEach((c) => {
      if (newConfigsMap.has(c.configId)) {
        const newVal = newConfigsMap.get(c.configId);
        if (newVal !== undefined) {
          c.value = newVal;
        }
        newConfigsMap.delete(c.configId); // Remove handled
      }
    });

    // Add remaining new configs
    newConfigsMap.forEach((value, configId) => {
      currentConfigs.push({ configId, value });
    });

    compilation.globalConfigs = currentConfigs;
    await this.compilationRepo.save(compilation);
    return compilation.globalConfigs;
  }

  async deleteGlobalConfig(id: string, configId: string) {
    const compilation = await this.findOne(id);
    if (compilation.globalConfigs) {
      compilation.globalConfigs = compilation.globalConfigs.filter(
        (c) => c.configId !== configId,
      );
      await this.compilationRepo.save(compilation);
    }
    return { success: true };
  }

  async getModuleConfigs(id: string) {
    const compilation = await this.findOne(id);
    return compilation.moduleConfigs || [];
  }

  async updateModuleConfigs(id: string, dto: UpdateModuleConfigsDto) {
    const compilation = await this.findOne(id);

    const currentConfigs = compilation.moduleConfigs || [];
    // Key needs to be composite: moduleId + configId
    const getKey = (mId: string, cId: string) => `${mId}::${cId}`;

    const newConfigsMap = new Map<string, string>();
    dto.configs.forEach((c) => {
      newConfigsMap.set(getKey(c.moduleId, c.configId), c.value);
    });

    // Update existing
    currentConfigs.forEach((c) => {
      const key = getKey(c.moduleId, c.configId);
      if (newConfigsMap.has(key)) {
        const newVal = newConfigsMap.get(key);
        if (newVal !== undefined) {
          c.value = newVal;
        }
        newConfigsMap.delete(key);
      }
    });

    // Add remaining
    dto.configs.forEach((c) => {
      const key = getKey(c.moduleId, c.configId);
      if (newConfigsMap.has(key)) {
        // Only if not deleted (handled)
        currentConfigs.push({
          moduleId: c.moduleId,
          configId: c.configId,
          value: c.value,
        });
      }
    });

    compilation.moduleConfigs = currentConfigs;
    await this.compilationRepo.save(compilation);
    return compilation.moduleConfigs;
  }

  async deleteModuleConfig(id: string, moduleId: string, configId: string) {
    const compilation = await this.findOne(id);
    if (compilation.moduleConfigs) {
      compilation.moduleConfigs = compilation.moduleConfigs.filter(
        (c) => !(c.moduleId === moduleId && c.configId === configId),
      );
      await this.compilationRepo.save(compilation);
    }
    return { success: true };
  }
}
