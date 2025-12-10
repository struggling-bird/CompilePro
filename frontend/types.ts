export enum TabView {
  COMPILE = 'COMPILE',
  MANAGE = 'MANAGE',
  TEMPLATES = 'TEMPLATES',
  CUSTOMERS = 'CUSTOMERS',
  MEMBERS = 'MEMBERS',
  ROLES = 'ROLES',
  SETTINGS = 'SETTINGS'
}

export interface Project {
  id: string;
  name: string;
  latestVersion: string;
  readmeUrl: string;
  buildDocUrl: string;
  domain?: string;
  logo?: string;
  webpackConfig?: string;
  versions: Version[];
}

export interface Version {
  id: string;
  version: string;
  date: string;
  type: 'tag' | 'branch'; // 'tag' for release, 'branch' for dev branch
  isDeprecated?: boolean;
  sourceVersion?: string; // The version this was branched from
}

export interface DeploymentConfig {
  id: string;
  name: string;
  type: 'Private' | 'Public' | 'Hybrid';
  lastBuildTime: string;
  lastBuildStatus: 'Success' | 'Failed' | 'Pending' | 'Idle';
  lastBuilder: string;
  projects: string[]; // IDs of projects included
  customerId?: string;
}

export interface User {
  email: string;
  name: string;
  avatar: string;
}

export interface GitConfig {
  username: string;
  token: string;
  sshKey: string;
  pushEmail?: boolean;
  pushSms?: boolean;
  pushWechat?: boolean;
}

// --- Template / Suite System Definitions ---

export interface TemplateGlobalConfig {
  id: string;
  name: string;
  defaultValue: string;
  description: string;
  isHidden: boolean;
}

export interface TemplateModuleConfig {
  id: string;
  name: string;
  fileLocation: string;
  mappingType: 'GLOBAL' | 'FIXED' | 'MANUAL';
  mappingValue: string; // If GLOBAL, holds globalConfig ID. If FIXED, holds string value.
  regex: string;
  description: string;
  isHidden: boolean;
  isSelected: boolean;
}

export interface TemplateModule {
  id: string;
  projectId: string; // Reference to Project.id
  projectName: string;
  projectVersion: string;
  publishMethod: 'GIT' | 'DOWNLOAD';
  configs: TemplateModuleConfig[];
}

export interface TemplateVersion {
  id: string;
  version: string;
  date: string;
  isBranch?: boolean;
  baseVersion?: string;
  status: 'Active' | 'Deprecated';
  globalConfigs: TemplateGlobalConfig[];
  modules: TemplateModule[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  latestVersion: string;
  description?: string;
  updateTime?: string;
  versions: TemplateVersion[];
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  address: string;
  contractDate: string;
  deployments: string[]; // IDs of associated deployments
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string; // Changed from enum to string to support dynamic roles
  status: 'Active' | 'Inactive';
  avatar?: string;
  joinDate: string;
}

export interface BuildRecord {
  id: string;
  deploymentId: string;
  buildNumber: number;
  startTime: string;
  endTime?: string;
  status: 'Success' | 'Failed' | 'Aborted';
  triggerBy: string;
  duration: string;
  commitHash?: string;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  group: 'Project' | 'Deployment' | 'Team' | 'System';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // List of Permission IDs
  isSystem?: boolean; // System roles cannot be deleted
}