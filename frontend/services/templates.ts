import request from "../utils/request";

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  initialVersion?: {
    version: string;
    description?: string;
    versionType?: string;
  };
}

export interface TemplateListQuery {
  name?: string;
  author?: string;
  description?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  page?: number;
  pageSize?: number;
}

export interface TemplateListItem {
  id: string;
  name: string;
  description?: string;
  author?: string;
  updater?: string;
  createdAt: string;
  updatedAt: string;
  latestVersion?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export const getTemplatesList = async (
  params?: TemplateListQuery
): Promise<Paginated<TemplateListItem>> => {
  return request<Paginated<TemplateListItem>>("/apis/templates", {
    method: "GET",
    params: params as any,
  });
};

export const createTemplate = async (payload: CreateTemplatePayload) => {
  return request("/apis/templates", {
    method: "POST",
    data: payload,
  });
};

export const getTemplateDetail = async (id: string) => {
  return request(`/apis/templates/${id}`, {
    method: "GET",
  });
};

export const getTemplateVersions = async (id: string) => {
  return request(`/apis/templates/${id}/versions`, {
    method: "GET",
  });
};

export const deleteTemplate = async (id: string) => {
  return request(`/apis/templates/${id}`, {
    method: "DELETE",
  });
};
