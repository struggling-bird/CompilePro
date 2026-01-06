import { Test, TestingModule } from '@nestjs/testing';
import { StorageConfigService } from './storage-config.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StorageConfig, ConfigType } from './entities/storage-config.entity';
import { StorageConfigHistory } from './entities/storage-config-history.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

const mockConfigRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockHistoryRepo = {
  save: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('StorageConfigService', () => {
  let service: StorageConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageConfigService,
        {
          provide: getRepositoryToken(StorageConfig),
          useValue: mockConfigRepo,
        },
        {
          provide: getRepositoryToken(StorageConfigHistory),
          useValue: mockHistoryRepo,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<StorageConfigService>(StorageConfigService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize default configs if not present', async () => {
      mockConfigRepo.findOne.mockResolvedValue(null); // Not found
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      mockConfigRepo.create.mockImplementation((dto: any) => dto);

      mockConfigRepo.save.mockImplementation((entity: any) =>
        Promise.resolve(entity),
      );
      mockConfigService.get.mockReturnValue(undefined); // No env override

      await service.onModuleInit();

      expect(mockConfigRepo.findOne).toHaveBeenCalled();
      expect(mockConfigRepo.create).toHaveBeenCalled();
      expect(mockConfigRepo.save).toHaveBeenCalled();
    });

    it('should sync options if config exists', async () => {
      const existingConfig = {
        key: 'STORAGE_DEFAULT_TYPE',
        options: null,
        description: 'Old Desc',
      };
      mockConfigRepo.findOne.mockResolvedValue(existingConfig);

      mockConfigRepo.save.mockImplementation((entity: any) =>
        Promise.resolve(entity),
      );

      await service.onModuleInit();

      expect(mockConfigRepo.save).toHaveBeenCalled();
      // Verify options are updated (STORAGE_DEFAULT_TYPE has options)
      // The mock object is mutated in place in the service, so checking it here works
      expect(existingConfig.options).toBeDefined();
    });
  });

  describe('get', () => {
    it('should return value from cache if available', async () => {
      mockCacheManager.get.mockResolvedValue('cached_value');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.get('some_key');
      expect(result).toBe('cached_value');
      expect(mockConfigRepo.findOne).not.toHaveBeenCalled();
    });

    it('should return value from db if not in cache', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockConfigRepo.findOne.mockResolvedValue({
        key: 'test',
        value: 'db_value',
        type: ConfigType.STRING,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await service.get('test');
      expect(result).toBe('db_value');
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update config value', async () => {
      const config = {
        key: 'test',
        value: 'old',
        type: ConfigType.STRING,
      };
      mockConfigRepo.findOne.mockResolvedValue(config);

      mockConfigRepo.save.mockImplementation((c: any) => Promise.resolve(c));

      await service.update('test', { value: 'new' }, 'user1');

      expect(config.value).toBe('new');
      expect(mockConfigRepo.save).toHaveBeenCalledWith(config);
      expect(mockCacheManager.del).toHaveBeenCalledWith('storage_config:test');
      expect(mockHistoryRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if config not found', async () => {
      mockConfigRepo.findOne.mockResolvedValue(null);
      await expect(
        service.update('test', { value: 'new' }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
