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
