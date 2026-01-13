import request from "../utils/request";
import { Compilation } from "../types";

const BASE_URL = "/apis/compilations";

// Helper to map backend entity to frontend Compilation type
const mapBackendToFrontend = (data: any): Compilation => {
  return {
    ...data,
    // Map flattened fields from relations
    templateName: data.template?.name,
    // Backend returns templateVersion object, frontend expects version string
    templateVersion: data.templateVersion?.version || data.templateVersionId,
    // Preserve ID for editing
    templateVersionId: data.templateVersionId, 
    customerName: data.customer?.name,
    environmentName: data.environment?.name,
    // Ensure configs are arrays
    globalConfigs: data.globalConfigs || [],
    moduleConfigs: data.moduleConfigs || [],
  };
};

const mapFrontendToBackend = (data: Partial<Compilation>): any => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    templateName,
    customerName,
    environmentName,
    templateVersion,
    templateVersionId,
    lastBuildTime,
    lastBuilder,
    createdBy,
    createdAt,
    updatedAt,
    status,
    ...rest
  } = data;

  // Use templateVersionId if available (for update/create), otherwise check if templateVersion is UUID
  let versionId = templateVersionId;
  if (!versionId && templateVersion && templateVersion.length > 20) {
      // Crude check if templateVersion holds the ID
      versionId = templateVersion;
  }

  return {
    ...rest,
    templateVersionId: versionId,
  };
};

export const listCompilations = async (query: any) => {
  const res = await request<{ items: any[]; meta: any }>(BASE_URL, {
    params: query,
  });

  return {
    items: (res.items || []).map(mapBackendToFrontend),
    meta: res.meta || { total: 0, page: 1, pageSize: 10 },
  };
};

export const getCompilation = async (id: string) => {
  const res = await request<any>(`${BASE_URL}/${id}`);
  return mapBackendToFrontend(res);
};

export const createCompilation = async (data: Partial<Compilation>) => {
  const payload = mapFrontendToBackend(data);
  const res = await request<any>(BASE_URL, {
    method: "POST",
    data: payload,
  });
  return res.id;
};

export const updateCompilation = async (
  id: string,
  data: Partial<Compilation>
) => {
  const payload = mapFrontendToBackend(data);
  await request(`${BASE_URL}/${id}`, {
    method: "PATCH",
    data: payload,
  });
};

export const deleteCompilation = async (id: string) => {
  await request(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
};
