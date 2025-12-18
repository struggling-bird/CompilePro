import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { StorageConfig, ConfigType } from './entities/storage-config.entity';
import { StorageConfigHistory } from './entities/storage-config-history.entity';
import { UpdateConfigDto } from './dto/update-config.dto';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from 'crypto';

export interface ConfigOption {
  label: string;
  value: string | number;
}

interface ConfigDefinition {
  key: string;
  type: ConfigType;
  group: string;
  description: string;
  defaultValue: any;
  isSensitive?: boolean;
  options?: ConfigOption[];
  tip?: string;
}

interface CreateConfigInternalDto {
  key: string;
  value: any;
  type: ConfigType;
  group: string;
  description: string;
  isSensitive: boolean;
  options?: ConfigOption[];
  tip?: string;
}

@Injectable()
export class StorageConfigService implements OnModuleInit {
  private readonly logger = new Logger(StorageConfigService.name);
  private readonly CACHE_PREFIX = 'storage_config:';
  private encryptionKey: Buffer;

  private readonly defaultConfigs: ConfigDefinition[] = [
    {
      key: 'STORAGE_MAX_SIZE_MB',
      type: ConfigType.NUMBER,
      group: 'storage',
      description: '最大上传大小 (MB)',
      defaultValue: 1024,
      tip: '限制单个文件上传的最大体积，单位MB',
    },
    {
      key: 'STORAGE_ALLOWED_TYPES',
      type: ConfigType.STRING,
      group: 'storage',
      description: '允许的 MIME 类型',
      defaultValue: '*',
      tip: '限制允许上传的文件类型，使用MIME类型，支持通配符，如 image/*',
    },
    {
      key: 'STORAGE_DEFAULT_TYPE',
      type: ConfigType.STRING,
      group: 'storage',
      description: '默认存储策略',
      defaultValue: 'local',
      options: [{ label: '本地存储', value: 'local' }],
      tip: '系统默认使用的文件存储策略，当前仅支持本地存储',
    },
    {
      key: 'STORAGE_TEMP_TTL_HOURS',
      type: ConfigType.NUMBER,
      group: 'storage',
      description: '临时文件保留时长 (小时)',
      defaultValue: 24,
      tip: '临时文件在系统中的保留时间，过期后将自动清理',
    },
    {
      key: 'STORAGE_ENCRYPTION_ENABLED',
      type: ConfigType.BOOLEAN,
      group: 'storage',
      description: '是否启用加密',
      defaultValue: false,
      tip: '启用后，所有上传的文件将在存储前进行加密处理',
    },
    {
      key: 'STORAGE_ENCRYPT_MIME_TYPES',
      type: ConfigType.STRING,
      group: 'storage',
      description: '指定加密的 MIME 类型',
      defaultValue: '',
      tip: '仅对指定类型的文件进行加密，留空则加密所有文件',
    },
    {
      key: 'DOWNLOAD_LIMIT_KBPS',
      type: ConfigType.NUMBER,
      group: 'storage',
      description: '全局默认下载限速 (0为不限)',
      defaultValue: 0,
      tip: '限制文件下载速度，0表示不限制',
    },
    {
      key: 'IMAGE_PREVIEW_QUALITY',
      type: ConfigType.NUMBER,
      group: 'storage',
      description: '缩略图质量 (1-100)',
      defaultValue: 80,
      tip: '生成的缩略图质量，值越高图片越清晰但体积越大',
    },
  ];

  constructor(
    @InjectRepository(StorageConfig)
    private configRepo: Repository<StorageConfig>,
    @InjectRepository(StorageConfigHistory)
    private historyRepo: Repository<StorageConfigHistory>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    const key =
      this.configService.get<string>('STORAGE_ENCRYPTION_KEY') ||
      'default-secret-key-32-chars-long!';
    // Ensure key is 32 bytes for AES-256
    this.encryptionKey = createHash('sha256').update(key).digest();
  }

  async onModuleInit() {
    await this.initializeConfigs();
  }

  private async initializeConfigs() {
    for (const configDef of this.defaultConfigs) {
      const existing = await this.configRepo.findOne({
        where: { key: configDef.key },
      });

      if (!existing) {
        // Try to get from Env, else use default
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let value: any = this.configService.get(configDef.key);
        if (value === undefined || value === null) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value = configDef.defaultValue;
        }

        await this.createInternal({
          key: configDef.key,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          value,
          type: configDef.type,
          group: configDef.group,
          description: configDef.description,
          isSensitive: configDef.isSensitive ?? false,
          options: configDef.options,
        });
        this.logger.log(`Initialized Config ${configDef.key}`);
      } else {
        // Update options and description if they changed (sync code definition to DB)
        let changed = false;

        // Sync options
        if (
          JSON.stringify(existing.options) !== JSON.stringify(configDef.options)
        ) {
          existing.options = configDef.options || null;
          changed = true;
        }

        // Sync description (for i18n updates)
        if (existing.description !== configDef.description) {
          existing.description = configDef.description;
          changed = true;
        }

        if (changed) {
          await this.configRepo.save(existing);
          this.logger.log(`Updated Config Definition for ${configDef.key}`);
        }
      }
    }
  }

  private async createInternal(
    dto: CreateConfigInternalDto,
  ): Promise<StorageConfig> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let value = dto.value;
    if (dto.type === ConfigType.JSON && typeof value !== 'string') {
      value = JSON.stringify(value);
    } else {
      value = String(value);
    }

    let isEncrypted = false;
    if (dto.isSensitive) {
      value = this.encrypt(value as string);
      isEncrypted = true;
    }

    const config = this.configRepo.create({
      key: dto.key,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value: value,
      type: dto.type,
      group: dto.group,
      description: dto.description,
      isSensitive: dto.isSensitive,
      isEncrypted: isEncrypted,
      options: dto.options,
    });

    await this.configRepo.save(config);
    // Optional: cache it immediately, but get() will handle it.

    // Log history for initialization
    await this.historyRepo.save({
      key: dto.key,
      oldValue: null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      newValue: dto.isSensitive ? '***' : value,
      updatedBy: 'system',
    });

    return config;
  }

  async update(
    key: string,
    dto: UpdateConfigDto,
    userId: string,
  ): Promise<StorageConfig> {
    const config = await this.configRepo.findOne({ where: { key } });
    if (!config) {
      throw new NotFoundException(`Config ${key} not found`);
    }

    const oldValue = config.value;
    let newValue: string | undefined = undefined;

    if (dto.value !== undefined) {
      if (config.type === ConfigType.JSON && typeof dto.value !== 'string') {
        newValue = JSON.stringify(dto.value);
      } else {
        newValue = String(dto.value);
      }

      // Check if value is valid against options
      if (config.options) {
        // config.options is stored as JSON (array of objects), but TypeORM might return it as object or string depending on driver/version.
        // Assuming it's parsed as object array.
        const options = config.options as unknown as ConfigOption[];
        if (Array.isArray(options)) {
          // Validation logic here if needed
          // const isValid = options.some((opt) => String(opt.value) === String(dto.value));
        }
      }

      if (config.isSensitive) {
        newValue = this.encrypt(newValue);
        config.isEncrypted = true;
      } else {
        config.isEncrypted = false;
      }
      config.value = newValue;
    }

    if (dto.description) {
      config.description = dto.description;
    }

    await this.configRepo.save(config);

    // Invalidate cache
    await this.cacheManager.del(this.CACHE_PREFIX + key);

    await this.historyRepo.save({
      key,
      oldValue: config.isSensitive ? '***' : oldValue,
      newValue: config.isSensitive ? '***' : newValue,
      updatedBy: userId,
    });

    return config;
  }

  async get<T = any>(key: string, defaultValue?: T): Promise<T> {
    // 1. Check Cache
    const cached = await this.cacheManager.get<string>(this.CACHE_PREFIX + key);
    if (cached !== undefined && cached !== null) {
      return this.parseValue(cached) as T;
    }

    // 2. Check DB
    const config = await this.configRepo.findOne({ where: { key } });
    if (config) {
      let value = config.value;
      if (config.isEncrypted && value) {
        try {
          value = this.decrypt(value);
        } catch (e) {
          this.logger.error(`Failed to decrypt config ${key}`, e);
          value = config.value; // Return raw if decrypt fails? Or null?
        }
      }
      // Update Cache
      await this.cacheManager.set(this.CACHE_PREFIX + key, value, 300000); // Cache for 5 mins
      return this.castValue(value, config.type) as T;
    }

    // 3. Check Env
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const envValue = this.configService.get(key);
    if (envValue !== undefined) {
      return envValue as T;
    }

    // 4. Check Default Configs (Hardcoded) - fallback if DB record deleted
    const def = this.defaultConfigs.find((d) => d.key === key);
    if (def) {
      return def.defaultValue as T;
    }

    return defaultValue as T;
  }

  async list(group?: string) {
    const query = this.configRepo.createQueryBuilder('c');
    if (group) {
      query.where('c.group = :group', { group });
    }
    const configs = await query.getMany();
    return configs.map((c) => {
      if (c.isSensitive) {
        c.value = '******'; // Mask sensitive data in list
      }
      return c;
    });
  }

  // Helpers
  private encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  private parseValue(value: string): any {
    return value;
  }

  private castValue(value: string | null | undefined, type: ConfigType): any {
    if (value === null || value === undefined) return value;
    switch (type) {
      case ConfigType.NUMBER:
        return Number(value);
      case ConfigType.BOOLEAN:
        return value === 'true' || value === '1';
      case ConfigType.JSON:
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }
}
