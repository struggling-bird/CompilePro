import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  RightOutlined,
  PlayCircleOutlined,
  CheckSquareOutlined,
  BorderOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../contexts/LanguageContext";
import { MOCK_DEPLOYMENTS, MOCK_PROJECTS } from "../constants";

interface BuildState {
  projectId: string;
  status: "pending" | "building" | "success" | "error";
  logs: string[];
  startTime?: number;
  duration?: string;
}

const BuildExecution: React.FC = () => {
  const { deployId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const deployment = MOCK_DEPLOYMENTS.find((d) => d.id === deployId);
  const deployProjects = MOCK_PROJECTS.filter((p) =>
    deployment?.projects.includes(p.id)
  );

  const [buildStates, setBuildStates] = useState<Record<string, BuildState>>(
    {}
  );
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [overallStatus, setOverallStatus] = useState<
    "building" | "success" | "failed"
  >("building");

  // New States for Selection Phase
  const [isStarted, setIsStarted] = useState(false);
  const [projectsToBuild, setProjectsToBuild] = useState<string[]>([]);

  // Initialize selection with all projects by default
  useEffect(() => {
    if (deployProjects.length > 0) {
      setProjectsToBuild(deployProjects.map((p) => p.id));
    }
  }, [deployId]);

  // Update overall status based on individual builds (Execution Phase)
  useEffect(() => {
    if (!isStarted) return;
    const states: BuildState[] = Object.values(buildStates);
    if (states.length === 0) return;

    const allFinished = states.every(
      (s) => s.status === "success" || s.status === "error"
    );
    const anyFailed = states.some((s) => s.status === "error");

    if (allFinished) {
      setOverallStatus(anyFailed ? "failed" : "success");
    } else {
      setOverallStatus("building");
    }
  }, [buildStates, isStarted]);

  const toggleProjectSelection = (id: string) => {
    if (projectsToBuild.includes(id)) {
      setProjectsToBuild(projectsToBuild.filter((p) => p !== id));
    } else {
      setProjectsToBuild([...projectsToBuild, id]);
    }
  };

  const handleStartBuild = () => {
    if (projectsToBuild.length === 0) return;

    setIsStarted(true);

    // Initialize states for selected projects
    const initialStates: Record<string, BuildState> = {};
    projectsToBuild.forEach((pid) => {
      initialStates[pid] = {
        projectId: pid,
        status: "pending",
        logs: [],
      };
    });
    setBuildStates(initialStates);

    // Set the first project as selected for logs view
    if (projectsToBuild.length > 0) {
      setSelectedProjectId(projectsToBuild[0]);
    }

    // Start simulation for each selected project
    projectsToBuild.forEach((pid) => {
      const p = deployProjects.find((dp) => dp.id === pid);
      if (p) {
        simulateProjectBuild(pid, p.name);
      }
    });
  };

  const simulateProjectBuild = (projectId: string, projectName: string) => {
    const steps = [
      `[Init] Starting build for ${projectName}...`,
      `[Clone] Fetching source code...`,
      `[Config] Applying replacements...`,
      `[Dep] Installing dependencies...`,
      `[Build] Compiling assets...`,
      `[Test] Running unit tests...`,
      `[Package] Creating artifacts...`,
      `[Deploy] Uploading to target...`,
      `[Done] Build completed successfully.`,
    ];

    let currentStep = 0;
    const startTime = Date.now();

    // Initial update to 'building'
    setBuildStates((prev) => ({
      ...prev,
      [projectId]: { ...prev[projectId], status: "building", startTime },
    }));

    // Random delay for realism
    const stepInterval = 800 + Math.random() * 1000;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setBuildStates((prev) => {
          const currentLogs = prev[projectId]?.logs || [];
          return {
            ...prev,
            [projectId]: {
              ...prev[projectId],
              logs: [
                ...currentLogs,
                `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`,
              ],
            },
          };
        });
        currentStep++;
      } else {
        clearInterval(interval);
        const endTime = Date.now();
        const durationSec = ((endTime - startTime) / 1000).toFixed(1);
        setBuildStates((prev) => ({
          ...prev,
          [projectId]: {
            ...prev[projectId],
            status: "success",
            duration: `${durationSec}s`,
          },
        }));
      }
    }, stepInterval);
  };

  // --- RENDER: SELECTION PHASE ---
  if (!isStarted) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shadow-sm z-10">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/manage")}
              className="text-slate-500 hover:text-slate-800 mr-4 transition-colors"
            >
              <ArrowLeftOutlined className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                {t.buildExecution.title}: {deployment?.name}
              </h1>
              <div className="text-xs text-slate-500 mt-0.5">
                {t.buildExecution.selectProjects}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">
                {t.buildExecution.selectProjects}
              </h3>
              <span className="text-xs text-slate-500">
                {projectsToBuild.length} / {deployProjects.length}{" "}
                {t.compileList.select}
              </span>
            </div>
            <div className="divide-y divide-slate-200">
              {deployProjects.map((project) => (
                <div
                  key={project.id}
                  className="px-6 py-4 flex items-center hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => toggleProjectSelection(project.id)}
                >
                  <div className="mr-4">
                    {projectsToBuild.includes(project.id) ? (
                      <CheckSquareOutlined className="w-5 h-5 text-blue-600" />
                    ) : (
                      <BorderOutlined className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">
                      {project.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {project.latestVersion}
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {t.buildExecution.ready}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleStartBuild}
                disabled={projectsToBuild.length === 0}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <PlayCircleOutlined className="w-4 h-4 mr-2" />
                {t.buildExecution.startBuild}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: EXECUTION PHASE ---
  const currentLogs = buildStates[selectedProjectId]?.logs || [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shadow-sm z-10">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/manage")}
            className="text-slate-500 hover:text-slate-800 mr-4 transition-colors"
          >
            <ArrowLeftOutlined className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              {t.buildExecution.title}: {deployment?.name}
            </h1>
            <div className="flex items-center mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  overallStatus === "building"
                    ? "bg-blue-100 text-blue-800"
                    : overallStatus === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {overallStatus === "building" && (
                  <ReloadOutlined className="w-3 h-3 mr-1 animate-spin" />
                )}
                {overallStatus === "success" && (
                  <CheckCircleOutlined className="w-3 h-3 mr-1" />
                )}
                {overallStatus === "failed" && (
                  <WarningOutlined className="w-3 h-3 mr-1" />
                )}
                {overallStatus === "building"
                  ? t.buildExecution.building
                  : overallStatus === "success"
                  ? t.buildExecution.success
                  : t.buildExecution.failed}
              </span>
              <span className="text-slate-400 text-xs ml-2 flex items-center">
                <ClockCircleOutlined className="w-3 h-3 mr-1" />{" "}
                {t.buildExecution.startedAt} {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        {overallStatus === "success" && (
          <button className="flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <DownloadOutlined className="w-4 h-4 mr-2" />
            {t.buildExecution.downloadArtifact}
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Project List */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.buildExecution.projectList}
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {projectsToBuild.map((pid) => {
              const p = deployProjects.find((dp) => dp.id === pid);
              if (!p) return null;
              const state = buildStates[pid] || { status: "pending", logs: [] };
              const isSelected = selectedProjectId === pid;

              return (
                <div
                  key={pid}
                  onClick={() => setSelectedProjectId(pid)}
                  className={`px-4 py-3 cursor-pointer transition-colors border-l-4 ${
                    isSelected
                      ? "bg-white border-blue-500 shadow-sm"
                      : "border-transparent hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`font-medium text-sm ${
                        isSelected ? "text-blue-700" : "text-slate-700"
                      }`}
                    >
                      {p.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {state.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center text-xs ${
                        state.status === "pending"
                          ? "text-slate-400"
                          : state.status === "building"
                          ? "text-blue-600"
                          : state.status === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {state.status === "building" && (
                        <ReloadOutlined className="w-3 h-3 mr-1 animate-spin" />
                      )}
                      {state.status === "success" && (
                        <CheckCircleOutlined className="w-3 h-3 mr-1" />
                      )}
                      {state.status === "error" && (
                        <CloseCircleOutlined className="w-3 h-3 mr-1" />
                      )}
                      {state.status === "pending" && (
                        <ClockCircleOutlined className="w-3 h-3 mr-1" />
                      )}
                      {state.status === "pending"
                        ? t.buildExecution.pending
                        : state.status === "building"
                        ? t.buildExecution.building
                        : state.status === "success"
                        ? t.buildExecution.success
                        : t.buildExecution.failed}
                    </span>
                    {isSelected && (
                      <RightOutlined className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content - Console Logs */}
        <div className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0">
          <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#3d3d3d] flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400 flex items-center">
              <CodeOutlined className="w-3 h-3 mr-2" />
              {t.buildExecution.logsFor}:{" "}
              <span className="text-slate-200 ml-1 font-bold">
                {deployProjects.find((p) => p.id === selectedProjectId)?.name}
              </span>
            </span>
          </div>
          <div className="flex-1 p-4 overflow-auto code-scroll font-mono text-sm">
            {currentLogs.length === 0 ? (
              <div className="text-slate-500 italic">Waiting for logs...</div>
            ) : (
              currentLogs.map((log, i) => (
                <div
                  key={i}
                  className="mb-1 text-slate-300 whitespace-pre-wrap break-all hover:bg-white/5 px-1 rounded"
                >
                  <span className="text-slate-500 mr-2 opacity-50">
                    {i + 1}
                  </span>
                  {log}
                </div>
              ))
            )}
            {/* Auto-scroll anchor */}
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildExecution;
