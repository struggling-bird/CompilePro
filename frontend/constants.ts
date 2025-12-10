import { Project, DeploymentConfig, ProjectTemplate, Customer, TeamMember, BuildRecord, Role, Permission } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'webapp',
    latestVersion: '12.0',
    readmeUrl: '#',
    buildDocUrl: '#',
    domain: 'https://zhugeio.com',
    logo: '/assets/images/logo.png',
    versions: [
      { id: 'v1', version: '10.0', date: '2019.02.18', type: 'tag' },
      { id: 'v2', version: '10.1', date: '2019.03.01', type: 'tag' },
      { id: 'v2-b1', version: '10.1-fix-login', date: '2019.03.05', type: 'branch', sourceVersion: '10.1' },
      { id: 'v2-b2', version: '10.1-customer-a', date: '2019.03.10', type: 'branch', sourceVersion: '10.1' },
      { id: 'v3', version: '10.9', date: '2019.06.15', type: 'tag', isDeprecated: true },
      { id: 'v4', version: '11.0', date: '2020.01.20', type: 'tag' },
      { id: 'v5', version: '12.0', date: 'Today', type: 'tag' },
      { id: 'v5-b1', version: 'feat-dashboard-v2', date: 'Today', type: 'branch', sourceVersion: '12.0' },
    ]
  },
  {
    id: '2',
    name: 'mobile-sdk',
    latestVersion: '4.5.1',
    readmeUrl: '#',
    buildDocUrl: '#',
    versions: [
      { id: 'v1', version: '4.0.0', date: '2023.01.10', type: 'tag' },
      { id: 'v2', version: '4.5.0', date: '2023.05.20', type: 'tag' },
      { id: 'v3', version: '4.5.1', date: '2023.06.01', type: 'tag' },
    ]
  }
];

export const MOCK_DEPLOYMENTS: DeploymentConfig[] = [
  {
    id: 'd1',
    name: 'Sunshine Insurance Private Cloud',
    type: 'Private',
    lastBuildTime: '18.03.12 15:20',
    lastBuildStatus: 'Success',
    lastBuilder: 'Zhang San',
    projects: ['1'],
    customerId: 'c1'
  },
  {
    id: 'd2',
    name: 'Online Environment',
    type: 'Public',
    lastBuildTime: '19.03.21 10:30',
    lastBuildStatus: 'Idle',
    lastBuilder: 'Li Si',
    projects: ['1', '2'],
    customerId: 'c2'
  },
  {
    id: 'd3',
    name: 'Test Environment',
    type: 'Hybrid',
    lastBuildTime: '19.03.21 10:30',
    lastBuildStatus: 'Failed',
    lastBuilder: 'Wang Wu',
    projects: ['2'],
    customerId: 'c2'
  }
];

export const MOCK_TEMPLATES: ProjectTemplate[] = [
  {
    id: 't1',
    name: 'Private Deployment Standard',
    latestVersion: '2.1.0',
    updateTime: '2023-06-15',
    description: 'Standard suite for private cloud deployments including Webapp and SDK.',
    versions: [
      {
        id: 'tv1',
        version: '1.0.0',
        date: '2022.01.01',
        status: 'Active',
        globalConfigs: [
          { id: 'g1', name: 'Domain', defaultValue: 'https://zhugeio.com/', description: 'Main Platform Domain', isHidden: false },
          { id: 'g2', name: 'Logo', defaultValue: 'images/logo.png', description: 'Logo File', isHidden: true }
        ],
        modules: [
          {
            id: 'm1',
            projectId: '1',
            projectName: 'webapp',
            projectVersion: '10.0',
            publishMethod: 'GIT',
            configs: [
               { id: 'c1', name: 'Domain', fileLocation: '/config.js', mappingType: 'GLOBAL', mappingValue: 'g1', regex: '/origin/', description: 'Platform Domain', isHidden: true, isSelected: true },
               { id: 'c2', name: 'Logo', fileLocation: '/assets/images/logo.png', mappingType: 'GLOBAL', mappingValue: 'g2', regex: '-', description: 'Logo Replace', isHidden: true, isSelected: true }
            ]
          }
        ]
      },
      {
        id: 'tv2',
        version: '2.1.0',
        date: 'Today',
        status: 'Active',
        globalConfigs: [
          { id: 'g1', name: 'Domain', defaultValue: 'https://zhugeio.com/', description: 'Main Platform Domain', isHidden: false },
          { id: 'g2', name: 'Logo', defaultValue: 'images/logo.png', description: 'Logo File', isHidden: true }
        ],
        modules: [
          {
            id: 'm1',
            projectId: '1',
            projectName: 'webapp',
            projectVersion: '12.0',
            publishMethod: 'GIT',
            configs: [
               { id: 'c1', name: 'Domain', fileLocation: '/config.js', mappingType: 'GLOBAL', mappingValue: 'g1', regex: '/origin/', description: 'Platform Domain', isHidden: true, isSelected: true },
               { id: 'c2', name: 'Logo', fileLocation: '/assets/images/logo.png', mappingType: 'GLOBAL', mappingValue: 'g2', regex: '-', description: 'Logo Replace', isHidden: true, isSelected: true }
            ]
          },
          {
            id: 'm2',
            projectId: '2',
            projectName: 'mobile-sdk',
            projectVersion: '4.5.1',
            publishMethod: 'DOWNLOAD',
            configs: [
              { id: 'c3', name: 'API Endpoint', fileLocation: 'src/constants.ts', mappingType: 'GLOBAL', mappingValue: 'g1', regex: 'API_URL', description: 'API Server', isHidden: false, isSelected: true }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 't2',
    name: 'SaaS Standard Suite',
    latestVersion: '1.5.0',
    updateTime: '2023-05-20',
    description: 'Suite for SaaS environment updates.',
    versions: [
       {
        id: 'tv1',
        version: '1.5.0',
        date: '2023.05.20',
        status: 'Active',
        globalConfigs: [],
        modules: []
       }
    ]
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Sunshine Insurance Group',
    contactPerson: 'Manager Wang',
    phone: '13800138000',
    email: 'wang@sunshine.com',
    status: 'Active',
    address: 'No. 1 Financial Street, Beijing',
    contractDate: '2023-01-01',
    deployments: ['d1']
  },
  {
    id: 'c2',
    name: 'Tencent Cloud',
    contactPerson: 'Pony Ma',
    phone: '13900139000',
    email: 'pony@tencent.com',
    status: 'Active',
    address: 'Tencent Building, Shenzhen',
    contractDate: '2022-11-15',
    deployments: ['d2', 'd3']
  }
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { 
    id: 'm1', 
    name: 'Zhuge Liang', 
    email: 'zhuge@zhugeio.com', 
    role: 'Admin', 
    status: 'Active', 
    joinDate: '2023-01-01' 
  },
  { 
    id: 'm2', 
    name: 'Liu Bei', 
    email: 'liubei@zhugeio.com', 
    role: 'Viewer', 
    status: 'Active', 
    joinDate: '2023-01-15' 
  },
  { 
    id: 'm3', 
    name: 'Guan Yu', 
    email: 'guanyu@zhugeio.com', 
    role: 'Developer', 
    status: 'Inactive', 
    joinDate: '2023-02-01' 
  },
  { 
    id: 'm4', 
    name: 'Zhang Fei', 
    email: 'zhangfei@zhugeio.com', 
    role: 'Developer', 
    status: 'Active', 
    joinDate: '2023-02-05' 
  }
];

export const MOCK_BUILD_HISTORY: BuildRecord[] = [
  {
    id: 'b1',
    deploymentId: 'd1',
    buildNumber: 105,
    startTime: '2023-06-12 14:20:00',
    endTime: '2023-06-12 14:22:30',
    status: 'Success',
    triggerBy: 'Zhang San',
    duration: '2m 30s',
    commitHash: 'a1b2c3d'
  },
  {
    id: 'b2',
    deploymentId: 'd1',
    buildNumber: 104,
    startTime: '2023-06-11 09:15:00',
    endTime: '2023-06-11 09:16:00',
    status: 'Failed',
    triggerBy: 'Zhang San',
    duration: '1m 00s',
    commitHash: 'e5f6g7h'
  },
  {
    id: 'b3',
    deploymentId: 'd1',
    buildNumber: 103,
    startTime: '2023-06-10 18:30:00',
    endTime: '2023-06-10 18:33:10',
    status: 'Success',
    triggerBy: 'Li Si',
    duration: '3m 10s',
    commitHash: 'i8j9k0l'
  }
];

export const MOCK_JSON_DEFAULT = `{
  "name": "workflow",
  "version": "10.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "webpack-dev-server --config config/webpack.config.js"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "react": "^16.8.0",
    "react-dom": "^16.8.0"
  }
}`;

export const MOCK_JSON_CUSTOM = `{
  "name": "workflow-test",
  "version": "2.0.0",
  "dependencies": {
    "react": "^18.0.0"
  }
}`;

export const MOCK_PERMISSIONS: Permission[] = [
  { id: 'p1', key: 'project.view', name: 'View Projects', description: 'View project list and details', group: 'Project' },
  { id: 'p2', key: 'project.edit', name: 'Edit Projects', description: 'Create and edit projects', group: 'Project' },
  { id: 'p3', key: 'project.delete', name: 'Delete Projects', description: 'Delete projects', group: 'Project' },
  
  { id: 'p4', key: 'deploy.view', name: 'View Deployments', description: 'View deployment list', group: 'Deployment' },
  { id: 'p5', key: 'deploy.build', name: 'Trigger Build', description: 'Trigger deployment builds', group: 'Deployment' },
  { id: 'p6', key: 'deploy.manage', name: 'Manage Deployments', description: 'Create/Edit deployments', group: 'Deployment' },
  
  { id: 'p7', key: 'team.manage', name: 'Manage Team', description: 'Add/Remove members and assign roles', group: 'Team' },
  { id: 'p8', key: 'system.settings', name: 'System Settings', description: 'Manage system configurations', group: 'System' },
];

export const MOCK_ROLES: Role[] = [
  { 
    id: 'r1', 
    name: 'Admin', 
    description: 'Full access to all resources', 
    permissions: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
    isSystem: true
  },
  { 
    id: 'r2', 
    name: 'Developer', 
    description: 'Can manage projects and deployments, cannot manage team', 
    permissions: ['p1', 'p2', 'p4', 'p5', 'p6'],
    isSystem: false
  },
  { 
    id: 'r3', 
    name: 'Viewer', 
    description: 'Read-only access', 
    permissions: ['p1', 'p4'],
    isSystem: false
  }
];