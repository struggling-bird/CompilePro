import { Test, TestingModule } from '@nestjs/testing';
import { SystemService } from './system.service';
import { RedisService } from '../redis/redis.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { WorkspaceService } from '../workspace/workspace.service';
import { UsersService } from '../users/users.service';
import { MetaprojectsService } from '../metaprojects/metaprojects.service';
import { MetaProject } from '../metaprojects/metaproject.entity';

describe('SystemService', () => {
  let service: SystemService;
  let workspaceService: WorkspaceService;
  let usersService: UsersService;
  let projectsService: MetaprojectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemService,
        {
          provide: RedisService,
          useValue: {},
        },
        {
          provide: GitlabService,
          useValue: {},
        },
        {
          provide: WorkspaceService,
          useValue: {
            scanWorkspace: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: MetaprojectsService,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SystemService>(SystemService);
    workspaceService = module.get<WorkspaceService>(WorkspaceService);
    usersService = module.get<UsersService>(UsersService);
    projectsService = module.get<MetaprojectsService>(MetaprojectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWorkspaceStatsDetail', () => {
    it('should return detailed stats', async () => {
      const mockScanResult = [
        {
          userId: 'user1',
          size: 2000,
          projects: [{ projectId: 'proj1', size: 1000 }],
        },
      ];
      const mockUser = {
        id: 'u1',
        username: 'Alice',
        email: 'alice@example.com',
        status: 'active',
        isSuperAdmin: false,
        role: null,
        createdAt: new Date(),
      };
      const mockProject = {
        name: 'Project A',
        description: 'Desc A',
      } as unknown as MetaProject;

      jest
        .spyOn(workspaceService, 'scanWorkspace')
        .mockResolvedValue(mockScanResult);
      jest
        .spyOn(usersService, 'getById')
        .mockResolvedValue(
          mockUser as unknown as Awaited<ReturnType<UsersService['getById']>>,
        );
      jest.spyOn(projectsService, 'getById').mockResolvedValue(mockProject);

      const result = await service.getWorkspaceStatsDetail();

      expect(result.totalSize).toBe(2000);
      expect(result.totalUsers).toBe(1);
      expect(result.totalProjects).toBe(1);
      expect(result.userSpaces[0].username).toBe('Alice');
      expect(result.userSpaces[0].projects[0].name).toBe('Project A');
    });

    it('should handle missing user/project info', async () => {
      const mockScanResult = [
        {
          userId: 'user2',
          size: 500,
          projects: [{ projectId: 'proj2', size: 500 }],
        },
      ];

      jest
        .spyOn(workspaceService, 'scanWorkspace')
        .mockResolvedValue(mockScanResult);
      jest
        .spyOn(usersService, 'getById')
        .mockRejectedValue(new Error('Not found'));
      jest.spyOn(projectsService, 'getById').mockResolvedValue(null);

      const result = await service.getWorkspaceStatsDetail();

      expect(result.userSpaces[0].username).toBe('Unknown User');
      expect(result.userSpaces[0].projects[0].name).toBe('Unknown Project');
    });
  });
});
