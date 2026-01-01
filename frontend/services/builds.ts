import { BuildExecution, BuildLog, ModuleBuildStatus } from "../types";

let builds: BuildExecution[] = [];

export const createBuild = async (data: Partial<BuildExecution>) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      const newId = `b${Date.now()}`;
      const newBuild: BuildExecution = {
        id: newId,
        compilationId: data.compilationId || "",
        status: "Pending",
        description: data.description || "",
        startTime: new Date().toISOString(),
        initiator: "Admin", // Mock
        snapshot: data.snapshot || {
          customerName: "",
          environmentName: "",
          templateName: "",
          templateVersion: "",
          compilationName: "",
          globalConfigs: [],
          moduleConfigs: [],
        },
        selectedModuleIds: data.selectedModuleIds || [],
        moduleStatus: data.moduleStatus || [],
        logs: [],
      };
      builds.unshift(newBuild);
      resolve(newId);
    }, 500);
  });
};

export const getBuild = async (id: string) => {
  return new Promise<BuildExecution>((resolve, reject) => {
    setTimeout(() => {
      const build = builds.find((b) => b.id === id);
      if (build) resolve(build);
      else reject(new Error("Build not found"));
    }, 300);
  });
};

// Mock function to simulate build progress and logs
export const simulateBuildProcess = (
  buildId: string,
  onUpdate: (build: BuildExecution) => void
) => {
  const build = builds.find((b) => b.id === buildId);
  if (!build) return;

  build.status = "Running";
  onUpdate({ ...build });

  let logCount = 0;
  const maxLogs = 20;
  const modules = build.moduleStatus;

  const interval = setInterval(() => {
    logCount++;

    // Random log generation
    const isError = Math.random() > 0.9;
    const log: BuildLog = {
      id: `l${Date.now()}${Math.random()}`,
      timestamp: new Date().toISOString(),
      level: isError ? "ERROR" : "INFO",
      message: isError
        ? `Error occurred during build step ${logCount}`
        : `Executing build step ${logCount}: Installing dependencies...`,
      context: isError
        ? "Error: Dependency not found\n    at BuildProcess (libs/build.js:20:5)"
        : undefined,
    };
    build.logs.push(log);

    // Update module progress
    modules.forEach((m) => {
      if (m.status === "Pending" || m.status === "Building") {
        m.status = "Building";
        m.progress = Math.min(
          100,
          (m.progress || 0) + Math.floor(Math.random() * 20)
        );
        if (m.progress >= 100) {
          m.status = Math.random() > 0.1 ? "Success" : "Failed";
          if (m.status === "Failed")
            m.errorMessage = "Compilation failed due to syntax error";
          else
            m.artifactUrl = `https://example.com/artifacts/${m.moduleId}.zip`;
        }
      }
    });

    // Check overall completion
    const allDone = modules.every(
      (m) => m.status === "Success" || m.status === "Failed"
    );
    if (allDone || logCount >= maxLogs) {
      clearInterval(interval);
      build.status = modules.some((m) => m.status === "Failed")
        ? "Failed"
        : "Success";
      build.endTime = new Date().toISOString();
      if (build.status === "Success") {
        build.artifactUrl = `https://example.com/artifacts/build-${buildId}.zip`;
      }
      build.logs.push({
        id: `l_end`,
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: `Build finished with status: ${build.status}`,
      });
    }

    onUpdate({ ...build });
  }, 1000);
};
