import { request } from "../utils/request";

export interface ConfigOption {
  label: string;
  value: string | number;
}

export interface StorageConfig {
  key: string;
  value: any;
  description: string;
  type: "string" | "number" | "boolean" | "json";
  group: string;
  isSensitive: boolean;
  isEncrypted: boolean;
  options?: ConfigOption[] | null;
  tip?: string;
  createdAt: string;
  updatedAt: string;
}

export const getStorageConfigs = (group?: string) => {
  return request<StorageConfig[]>("/apis/storage/config", {
    method: "GET",
    params: group ? { group } : undefined,
  });
};

export const updateStorageConfig = (
  key: string,
  data: { value: any; description?: string }
) => {
  return request<StorageConfig>(`/apis/storage/config/${key}`, {
    method: "PUT",
    data,
  });
};

export const createStorageConfig = (data: any) => {
  return request<StorageConfig>("/apis/storage/config", {
    method: "POST",
    data,
  });
};

export const deleteStorageConfig = (key: string) => {
  return request(`/apis/storage/config/${key}`, {
    method: "DELETE",
  });
};
