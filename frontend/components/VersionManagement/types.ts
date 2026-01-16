export interface VersionNode {
  id: string;
  version: string;
  date: string;
  isBranch?: boolean;
  baseVersion?: string; // ID of the parent version
  status?: "Active" | "Deprecated";
  versionType?: "Major" | "Minor" | "Patch" | "Hotfix" | "Branch";
  description?: string;
  creator?: string;
  // Allow arbitrary extra data
  [key: string]: any;
}

export interface VersionCreationValues {
  parentVersionId: string;
  versionType: "Major" | "Minor" | "Patch" | "Hotfix" | "Branch";
  version: string;
  description: string;
  [key: string]: any;
}
