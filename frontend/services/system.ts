import request, { request as namedRequest } from "../utils/request";
import { SystemEnvironment } from "../types";

export const getSystemEnvironment = async (): Promise<SystemEnvironment> => {
  // 模拟 API 请求
  // 实际项目中应调用后端接口，例如: return request.get("/api/system/check");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        git: {
          name: "Git",
          installed: true,
          version: "2.39.0",
        },
        java: {
          name: "Java",
          installed: true,
          version: "17.0.6",
          versionManager: {
            name: "SDKMAN!",
            installed: true,
            version: "5.18.2",
          },
        },
        nodejs: {
          name: "Node.js",
          installed: true,
          version: "18.14.0",
          versionManager: {
            name: "nvm",
            installed: true,
            version: "0.39.3",
          },
        },
      });
    }, 1000);
  });
};

export const checkGit = async (): Promise<{
  installed: boolean;
  version?: string;
}> => {
  return request<{ installed: boolean; version?: string }>("/apis/system/git", {
    method: "GET",
  });
};

export const installGitGuide = async (): Promise<{
  os: string;
  instructions: string[];
}> => {
  return request<{ os: string; instructions: string[] }>(
    "/apis/system/git/install",
    { method: "POST" }
  );
};
