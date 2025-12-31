export enum TabView {
  META_PROJECTS = "META_PROJECTS",
  MANAGE = "MANAGE",
  TEMPLATES = "TEMPLATES",
  CUSTOMERS = "CUSTOMERS",
  MEMBERS = "MEMBERS",
  ROLES = "ROLES",
  SETTINGS = "SETTINGS",
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
  gitRepo?: string;
  description?: string;
  versions: Version[];
}

export interface Version {
  id: string;
  version: string;
  date: string;
  type: "tag" | "branch"; // 'tag' for release, 'branch' for dev branch
  isDeprecated?: boolean;
  sourceVersion?: string; // The version this was branched from
  ref?: string;
  compileCommands?: string[];
  artifacts?: string[];
}

export interface VersionConfig {
  id: string;
  name: string;
  type: "TEXT" | "FILE";
  textOrigin?: string;
  matchIndex?: number;
  fileOriginPath?: string;
  description?: string;
  textTarget?: string;
  mappingType?: "GLOBAL" | "MANUAL" | "FIXED";
  mappingValue?: string;
}

export interface DeploymentConfig {
  id: string;
  name: string;
  type: "Private" | "Public" | "Hybrid";
  lastBuildTime: string;
  lastBuildStatus: "Success" | "Failed" | "Pending" | "Idle";
  lastBuilder: string;
  projects: string[]; // IDs of projects included
  customerId?: string;
  environment?: string;
  customerName?: string;
}

export interface User {
  id?: string;
  email: string;
  name: string;
  avatar: string;
  isSuperAdmin?: boolean;
}

export interface GitConfig {
  username: string;
  token: string;
  sshKey: string;
  pushEmail?: boolean;
  pushSms?: boolean;
  pushWechat?: boolean;
}

export interface SystemCheckItem {
  name: string;
  installed: boolean;
  version?: string;
  versionManager?: {
    name: string;
    installed: boolean;
    version?: string;
  };
  error?: string;
}

export interface SystemEnvironment {
  git: SystemCheckItem;
  java: SystemCheckItem;
  nodejs: SystemCheckItem;
}

// --- Template / Suite System Definitions ---

export interface TemplateGlobalConfig {
  id: string;
  name: string;
  type: "FILE" | "TEXT";
  defaultValue: string;
  description: string;
  isHidden: boolean;
  createdAt: string;
}

export interface TemplateModuleConfig {
  id: string;
  name: string;
  fileLocation: string;
  mappingType: "GLOBAL" | "FIXED" | "MANUAL";
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
  publishMethod: "GIT" | "DOWNLOAD";
  configs: TemplateModuleConfig[];
}

export interface TemplateVersion {
  id: string;
  version: string;
  date: string;
  isBranch?: boolean;
  baseVersion?: string;
  status: "Active" | "Deprecated";
  globalConfigs: TemplateGlobalConfig[];
  modules: TemplateModule[];
  buildDoc?: string;
  updateDoc?: string;
  description?: string;
  readme?: string;
  versionType?: "Major" | "Minor" | "Patch" | "Hotfix" | "Branch";
  creator?: string;
  parentId?: string;
  children?: TemplateVersion[];
}

export interface NodeCredential {
  id?: string;
  type: string;
  username: string;
  password: string;
  description?: string;
}

export interface EnvironmentNode {
  id: string;
  ip: string;
  host: string;
  domain?: string;
  memory: string;
  cpu: string;
  chip: string;
  os: string;
  diskType: string;
  diskSize: string;
  remark?: string;
  credentials: NodeCredential[];
}

export interface Environment {
  id: string;
  name: string;
  url: string;
  account?: string;
  password?: string;
  supportRemote: boolean;
  remoteMethod?: string;
  remark?: string;
  customerId: string;
  nodes?: EnvironmentNode[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  latestVersion: string;
  description?: string;
  updateTime?: string;
  updater?: string;
  author?: string;
  createdDate?: string;
  isEnabled: boolean;
  versions: TemplateVersion[];
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  address: string;
  contractDate: string;
  deployments: string[]; // IDs of associated deployments
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string; // Changed from enum to string to support dynamic roles
  status: "Active" | "Inactive";
  avatar?: string;
  joinDate: string;
}

export interface BuildRecord {
  id: string;
  deploymentId: string;
  buildNumber: number;
  startTime: string;
  endTime?: string;
  status: "Success" | "Failed" | "Aborted";
  triggerBy: string;
  duration: string;
  commitHash?: string;
}

export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  group: "Project" | "Deployment" | "Team" | "System";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // List of Permission IDs
  isSystem?: boolean; // System roles cannot be deleted
}
