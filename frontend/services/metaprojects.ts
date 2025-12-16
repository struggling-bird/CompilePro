import request from "../utils/request";

export type BackendLatestVersion = {
  version: string;
  status: "enabled" | "disabled";
  summary: string;
} | null;

export type BackendProject = {
  id: string;
  name: string;
  gitUrl: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  latestVersion: BackendLatestVersion;
};

export type ListProjectsResponse = {
  list: BackendProject[];
  total: number;
};

export const listProjects = async (params?: {
  page?: number;
  pageSize?: number;
  q?: string;
}): Promise<ListProjectsResponse> => {
  return request<ListProjectsResponse>("/apis/metaprojects", {
    method: "GET",
    params,
  });
};

export const createProject = async (payload: {
  name: string;
  gitUrl: string;
  description?: string;
  initialVersion: string;
  sourceType: "branch" | "tag";
  sourceValue: string;
  summary?: string;
}): Promise<BackendProject> => {
  return request<BackendProject>("/apis/metaprojects", {
    method: "POST",
    data: payload,
  });
};

export const getProjectDetail = async (
  projectId: string
): Promise<{
  id: string;
  name: string;
  gitUrl: string;
  description?: string | null;
  versions: Array<{
    id: string;
    version: string;
    createdAt: string;
    sourceType: "branch" | "tag";
    sourceValue: string;
    status: "enabled" | "disabled";
    compileCommands?: string[];
  }>;
}> => {
  return request(`/apis/metaprojects/${projectId}`, {
    method: "GET",
  });
};

export const getCloneStatus = async (
  projectId: string
): Promise<{ status: string; message?: string }> => {
  return request(`/apis/metaprojects/${projectId}/clone/status`, {
    method: "GET",
  });
};

export const retryClone = async (
  projectId: string
): Promise<{ ok: boolean }> => {
  return request(`/apis/metaprojects/${projectId}/clone/retry`, {
    method: "POST",
  });
};

export const createVersion = async (
  projectId: string,
  payload: {
    version: string;
    sourceType: "branch" | "tag";
    sourceValue: string;
    summary?: string;
    readmeDoc?: string;
    buildDoc?: string;
    updateDoc?: string;
    compileCommands?: string[];
  }
) => {
  return request(`/apis/metaprojects/${projectId}/versions`, {
    method: "POST",
    data: payload,
  });
};

export const listBranches = async (
  gitUrl: string
): Promise<{ list: { name: string }[] }> => {
  return request<{ list: { name: string }[] }>(
    `/apis/metaprojects/git/branches`,
    {
      method: "GET",
      params: { gitUrl },
    }
  );
};

export const listTags = async (
  gitUrl: string
): Promise<{ list: { name: string }[] }> => {
  return request<{ list: { name: string }[] }>(`/apis/metaprojects/git/tags`, {
    method: "GET",
    params: { gitUrl },
  });
};

export const listConfigs = async (
  projectId: string,
  versionId: string
): Promise<{ list: any[] }> => {
  return request<{ list: any[] }>(
    `/apis/metaprojects/${projectId}/versions/${versionId}/configs`,
    {
      method: "GET",
    }
  );
};

export const upsertConfig = async (
  projectId: string,
  versionId: string,
  payload: {
    name: string;
    type: "TEXT" | "FILE";
    textOrigin?: string;
    textTarget?: string;
    fileOriginPath?: string;
    fileTargetUrl?: string;
    description?: string;
  }
) => {
  return request(
    `/apis/metaprojects/${projectId}/versions/${versionId}/configs`,
    {
      method: "POST",
      data: payload,
    }
  );
};

export const deleteConfig = async (
  projectId: string,
  versionId: string,
  configId: string
) => {
  return request(
    `/apis/metaprojects/${projectId}/versions/${versionId}/configs/${configId}`,
    {
      method: "DELETE",
    }
  );
};

export const updateCommands = async (
  projectId: string,
  versionId: string,
  payload: { commands: string[] }
) => {
  return request(
    `/apis/metaprojects/${projectId}/versions/${versionId}/commands`,
    {
      method: "PUT",
      data: payload,
    }
  );
};

export const listProjectFiles = async (projectId: string) => {
  return request<any[]>(`/apis/metaprojects/${projectId}/files`, {
    method: "GET",
  });
};

export const getFileContent = async (projectId: string, path: string) => {
  return request<string>(`/apis/metaprojects/${projectId}/files/content`, {
    method: "GET",
    params: { path },
  });
};
