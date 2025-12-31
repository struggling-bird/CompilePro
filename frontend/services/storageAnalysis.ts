import request from "../utils/request";

export interface StorageTrend {
  date: string;
  size: number; // MB
}

export interface FileTypeStat {
  type: string;
  size: number; // MB
  count: number;
}

export interface HotFile {
  id: string;
  name: string;
  path: string;
  size: number;
  accessCount: number;
  lastAccessed: string;
  owner: string;
}

export interface QuotaInfo {
  total: number; // GB
  used: number; // GB
  warningThreshold: number; // %
}

export interface FileItem {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: number;
  updatedAt: string;
  extension?: string;
}

export const getStorageTrends = async (): Promise<StorageTrend[]> => {
  const res = await request<StorageTrend[]>("/apis/storage/analysis/trends", {
    method: "GET",
  });
  return res;
};

export const getFileTypeDistribution = async (): Promise<FileTypeStat[]> => {
  const res = await request<FileTypeStat[]>("/apis/storage/analysis/types", {
    method: "GET",
  });
  return res;
};

export const getHotFiles = async (): Promise<HotFile[]> => {
  const res = await request<HotFile[]>("/apis/storage/analysis/hot-files", {
    method: "GET",
  });
  return res.map((h) => ({
    ...h,
    lastAccessed:
      typeof h.lastAccessed === "string"
        ? h.lastAccessed
        : new Date(h.lastAccessed as unknown as string).toISOString(),
  }));
};

export const getQuotaInfo = async (): Promise<QuotaInfo> => {
  const res = await request<QuotaInfo>("/apis/storage/quota", {
    method: "GET",
  });
  return res;
};

export const listFiles = async (parentId?: string): Promise<FileItem[]> => {
  const res = await request<
    Array<{
      id: string;
      originalName: string;
      isFolder: boolean;
      size: number;
      updatedAt: string;
      path: string;
      mimetype: string;
    }>
  >("/apis/storage/files", {
    method: "GET",
    params: parentId ? { parentId } : undefined,
  });
  return (res || []).map((f) => ({
    id: f.id,
    name: f.originalName,
    type: f.isFolder ? "folder" : "file",
    size: f.size,
    updatedAt:
      typeof f.updatedAt === "string" ? f.updatedAt : String(f.updatedAt),
    extension: f.originalName.includes(".")
      ? f.originalName.split(".").pop()?.toLowerCase()
      : undefined,
  }));
};

export const deleteFile = async (id: string): Promise<void> => {
  await request(`/apis/storage/files/${id}`, {
    method: "DELETE",
  });
};

export const updateQuota = async (
  total: number,
  warningThreshold: number
): Promise<void> => {
  await request("/apis/storage/quota", {
    method: "PUT",
    data: { total, warningThreshold },
  });
};
