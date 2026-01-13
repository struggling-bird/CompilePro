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
import { UpdateConfigValueDto } from './dto/update-config-value.dto';
import { CompilationGlobalConfig } from './entities/compilation-global-config.entity';
import { CompilationModuleConfig } from './entities/compilation-module-config.entity';
import { MappingType } from '../templates/entities/template-module-config.entity';

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
    @InjectRepository(CompilationGlobalConfig)
    private readonly compilationGlobalRepo: Repository<CompilationGlobalConfig>,
    @InjectRepository(CompilationModuleConfig)
    private readonly compilationModuleRepo: Repository<CompilationModuleConfig>,
  ) {}

  async create(createDto: CreateCompilationDto, creator: string) {
    // 1. Fetch Template Version to inherit configs

    const version: any = await this.versionRepo.findOne({
      where: { id: createDto.templateVersionId },
    });
    if (!version) {
      throw new NotFoundException('Template Version not found');
    }

    // 2. Create Compilation Entity (basic info)
    const compilation = await this.compilationRepo.save(
      this.compilationRepo.create({
        ...createDto,
        createdBy: creator,
      }),
    );

    // 3. Inherit Global Configs from Template Version
    const templateGlobalConfigs: TemplateGlobalConfig[] =
      await this.globalConfigRepo.find({
        where: { versionId: (version as TemplateVersion).id },
      });

    const inheritedGlobalConfigs: CompilationGlobalConfig[] = [];
    const globalIdMap = new Map<string, string>();
    for (const gc of templateGlobalConfigs) {
      const entity = this.compilationGlobalRepo.create({
        compilationId: compilation.id,
        name: gc.name,
        type: gc.type,
        description: gc.description,
        value: gc.defaultValue || '',
        templateConfigId: gc.id,
      });
      const saved = await this.compilationGlobalRepo.save(entity);
      inheritedGlobalConfigs.push(saved);
      globalIdMap.set(gc.id, saved.id);
    }

    // 4. Inherit Module Configs for all modules within version
    const templateModules: TemplateModule[] = await this.moduleRepo.find({
      where: { versionId: (version as TemplateVersion).id },
      relations: ['configs'],
    });

    const inheritedModuleConfigs: CompilationModuleConfig[] = [];
    for (const mod of templateModules) {
      const configs = mod.configs || [];
      for (const c of configs) {
        const mappingType: MappingType = c.mappingType;
        let mappingValue: string = c.mappingValue || '';
        let value = '';

        if (mappingType === MappingType.GLOBAL && mappingValue) {
          const compGlobalId = globalIdMap.get(mappingValue);
          if (compGlobalId) {
            mappingValue = compGlobalId;
            const target = inheritedGlobalConfigs.find(
              (i) => i.id === compGlobalId,
            );
            value = target?.value ?? '';
          }
        } else if (mappingType === MappingType.FIXED) {
          value = mappingValue || '';
        } else {
          value = '';
        }

        const entity = this.compilationModuleRepo.create({
          compilationId: compilation.id,
          moduleId: mod.id,
          value,
          templateConfigId: c.id,
        });
        const saved = await this.compilationModuleRepo.save(entity);
        inheritedModuleConfigs.push(saved);
      }
    }

    return compilation;
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
    await this.findOne(id);
    const items = await this.compilationGlobalRepo.find({
      where: { compilationId: id },
      order: { name: 'ASC' },
    });
    return items.map((e) => ({
      configId: e.id,
      name: e.name,
      type: e.type,
      description: e.description,
      value: e.value || '',
    }));
  }

  async updateGlobalConfig(
    id: string,
    configId: string,
    dto: UpdateConfigValueDto,
  ) {
    await this.findOne(id);
    const config = await this.compilationGlobalRepo.findOne({
      where: { id: configId, compilationId: id },
    });
    if (!config) throw new NotFoundException('Global config not found');
    config.value = dto.value;
    await this.compilationGlobalRepo.save(config);
    return this.getGlobalConfigs(id);
  }

  async deleteGlobalConfig(id: string, configId: string) {
    await this.findOne(id);
    await this.compilationGlobalRepo.delete({
      id: configId,
      compilationId: id,
    });
    return { success: true };
  }

  async getModuleConfigs(id: string) {
    await this.findOne(id);
    const items = await this.compilationModuleRepo.find({
      where: { compilationId: id },
      relations: ['templateConfig'],
    });

    // Sort in memory since we need to sort by related entity field
    items.sort((a, b) => {
      if (a.moduleId !== b.moduleId) {
        return a.moduleId.localeCompare(b.moduleId);
      }
      return (a.templateConfig?.name || '').localeCompare(
        b.templateConfig?.name || '',
      );
    });

    return items.map((e) => ({
      moduleId: e.moduleId,
      configId: e.id,
      templateConfigId: e.templateConfigId,
      name: e.templateConfig?.name,
      fileLocation: e.templateConfig?.fileLocation,
      mappingType: e.templateConfig?.mappingType,
      mappingValue: e.templateConfig?.mappingValue,
      regex: e.templateConfig?.regex,
      description: e.templateConfig?.description,
      isHidden: e.templateConfig?.isHidden,
      isSelected: e.templateConfig?.isSelected,
      value: e.value || '',
    }));
  }

  async updateModuleConfig(
    id: string,
    moduleId: string,
    configId: string,
    dto: UpdateConfigValueDto,
  ) {
    await this.findOne(id);
    const config = await this.compilationModuleRepo.findOne({
      where: { id: configId, compilationId: id, moduleId },
    });
    if (!config) throw new NotFoundException('Module config not found');
    config.value = dto.value;
    await this.compilationModuleRepo.save(config);
    return this.getModuleConfigs(id);
  }

  async deleteModuleConfig(id: string, moduleId: string, configId: string) {
    await this.findOne(id);
    await this.compilationModuleRepo.delete({
      id: configId,
      compilationId: id,
      moduleId,
    });
    return { success: true };
  }
}
