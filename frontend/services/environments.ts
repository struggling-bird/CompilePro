import request from "../utils/request";
import type { Environment, EnvironmentNode, NodeCredential } from "../types";

// Environment APIs

export const listEnvironments = async (
  customerId: string
): Promise<Environment[]> => {
  const res = await request<{ list: Environment[] }>(
    `/apis/customers/${customerId}/environments`,
    {
      method: "GET",
    }
  );
  return res.list || [];
};

export const getEnvironment = async (
  customerId: string,
  envId: string
): Promise<Environment> => {
  const res = await request<{ data: Environment }>(
    `/apis/customers/${customerId}/environments/${envId}`,
    {
      method: "GET",
    }
  );
  return res.data;
};

export const createEnvironment = async (
  customerId: string,
  data: Partial<Environment>
): Promise<Environment> => {
  const res = await request<{ data: Environment }>(
    `/apis/customers/${customerId}/environments`,
    {
      method: "POST",
      data,
    }
  );
  return res.data;
};

export const updateEnvironment = async (
  customerId: string,
  envId: string,
  data: Partial<Environment>
): Promise<Environment> => {
  const res = await request<{ data: Environment }>(
    `/apis/customers/${customerId}/environments/${envId}`,
    {
      method: "PUT",
      data,
    }
  );
  return res.data;
};

export const deleteEnvironment = async (
  customerId: string,
  envId: string
): Promise<void> => {
  await request(`/apis/customers/${customerId}/environments/${envId}`, {
    method: "DELETE",
  });
};

// Node APIs

export const listNodes = async (
  customerId: string,
  envId: string
): Promise<EnvironmentNode[]> => {
  const res = await request<{ data: EnvironmentNode[] }>(
    `/apis/customers/${customerId}/environments/${envId}/nodes`,
    {
      method: "GET",
    }
  );
  return res.data || [];
};

export const getNode = async (
  customerId: string,
  envId: string,
  nodeId: string
): Promise<EnvironmentNode> => {
  const res = await request<{ data: EnvironmentNode }>(
    `/apis/customers/${customerId}/environments/${envId}/nodes/${nodeId}`,
    {
      method: "GET",
    }
  );
  return res.data;
};

export const createNode = async (
  customerId: string,
  envId: string,
  data: Partial<EnvironmentNode>
): Promise<EnvironmentNode> => {
  const res = await request<{ data: EnvironmentNode }>(
    `/apis/customers/${customerId}/environments/${envId}/nodes`,
    {
      method: "POST",
      data,
    }
  );
  return res.data;
};

export const updateNode = async (
  customerId: string,
  envId: string,
  nodeId: string,
  data: Partial<EnvironmentNode>
): Promise<EnvironmentNode> => {
  const res = await request<{ data: EnvironmentNode }>(
    `/apis/customers/${customerId}/environments/${envId}/nodes/${nodeId}`,
    {
      method: "PUT",
      data,
    }
  );
  return res.data;
};

export const deleteNode = async (
  customerId: string,
  envId: string,
  nodeId: string
): Promise<void> => {
  await request(
    `/apis/customers/${customerId}/environments/${envId}/nodes/${nodeId}`,
    {
      method: "DELETE",
    }
  );
};

// Credential APIs (if needed separately, otherwise handled via Node update if backend supports it, but instruction says separate APIs available)
export const updateNodeCredentials = async (
  customerId: string,
  envId: string,
  nodeId: string,
  credentials: NodeCredential[]
): Promise<void> => {
  await request(
    `/apis/customers/${customerId}/environments/${envId}/nodes/${nodeId}/credentials`,
    {
      method: "PUT",
      data: { credentials },
    }
  );
};

export const listNodeCredentials = async (
  customerId: string,
  envId: string,
  nodeId: string
): Promise<NodeCredential[]> => {
  const res = await request<{ list: NodeCredential[] }>(
    `/apis/customers/${customerId}/environments/${envId}/nodes/${nodeId}/credentials`,
    {
      method: "GET",
    }
  );
  return res.list || [];
};
