import request from "../utils/request";

export interface WorkspaceStats {
  root: string;
  users: number;
  size: number;
}

export const getWorkspaceStats = async (): Promise<WorkspaceStats> => {
  return request<WorkspaceStats>("/apis/workspace/stats", {
    method: "GET",
  });
};
