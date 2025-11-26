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
  isDeprecated?: boolean;
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

export interface ProjectTemplate {
  id: string;
  name: string;
  type: 'Frontend' | 'Backend' | 'Mobile' | 'Other';
  description: string;
  defaultBuildScripts: string[];
  createdDate: string;
  author: string;
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