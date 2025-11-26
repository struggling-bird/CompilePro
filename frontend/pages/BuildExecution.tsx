
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, CheckCircle, AlertTriangle, Box, Clock, Terminal, ChevronRight, Play, CheckSquare, Square } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MOCK_DEPLOYMENTS, MOCK_PROJECTS } from '../constants';

interface BuildState {
  projectId: string;
  status: 'pending' | 'building' | 'success' | 'error';
  logs: string[];
  startTime?: number;
  duration?: string;
}

const BuildExecution: React.FC = () => {
  const { deployId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const deployment = MOCK_DEPLOYMENTS.find(d => d.id === deployId);
  const deployProjects = MOCK_PROJECTS.filter(p => deployment?.projects.includes(p.id));

  const [buildStates, setBuildStates] = useState<Record<string, BuildState>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [overallStatus, setOverallStatus] = useState<'building' | 'success' | 'failed'>('building');

  // New States for Selection Phase
  const [isStarted, setIsStarted] = useState(false);
  const [projectsToBuild, setProjectsToBuild] = useState<string[]>([]);

  // Initialize selection with all projects by default
  useEffect(() => {
    if (deployProjects.length > 0) {
      setProjectsToBuild(deployProjects.map(p => p.id));
    }
  }, [deployId]);

  // Update overall status based on individual builds (Execution Phase)
  useEffect(() => {
    if (!isStarted) return;
    const states = Object.values(buildStates);
    if (states.length === 0) return;

    const allFinished = states.every(s => s.status === 'success' || s.status === 'error');
    const anyFailed = states.some(s => s.status === 'error');

    if (allFinished) {
      setOverallStatus(anyFailed ? 'failed' : 'success');
    } else {
      setOverallStatus('building');
    }
  }, [buildStates, isStarted]);

  const toggleProjectSelection = (id: string) => {
    if (projectsToBuild.includes(id)) {
      setProjectsToBuild(projectsToBuild.filter(p => p !== id));
    } else {
      setProjectsToBuild([...projectsToBuild, id]);
    }
  };

  const handleStartBuild = () => {
    if (projectsToBuild.length === 0) return;

    setIsStarted(true);
    
    // Initialize states for selected projects
    const initialStates: Record<string, BuildState> = {};
    projectsToBuild.forEach(pid => {
      initialStates[pid] = { 
        projectId: pid,
        status: 'pending', 
        logs: [] 
      };
    });
    setBuildStates(initialStates);
    
    // Set the first project as selected for logs view
    if (projectsToBuild.length > 0) {
        setSelectedProjectId(projectsToBuild[0]);
    }

    // Start simulation for each selected project
    projectsToBuild.forEach(pid => {
       const p = deployProjects.find(dp => dp.id === pid);
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
      `[Done] Build completed successfully.`
    ];

    let currentStep = 0;
    const startTime = Date.now();
    
    // Initial update to 'building'
    setBuildStates(prev => ({
        ...prev,
        [projectId]: { ...prev[projectId], status: 'building', startTime }
    }));

    // Random delay for realism
    const stepInterval = 800 + Math.random() * 1000;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setBuildStates(prev => {
           const currentLogs = prev[projectId]?.logs || [];
           return {
             ...prev,
             [projectId]: { 
                ...prev[projectId], 
                logs: [...currentLogs, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`] 
             }
           };
        });
        currentStep++;
      } else {
        clearInterval(interval);
        const endTime = Date.now();
        const durationSec = ((endTime - startTime) / 1000).toFixed(1);
        setBuildStates(prev => ({
          ...prev,
          [projectId]: { 
             ...prev[projectId], 
             status: 'success', 
             duration: `${durationSec}s` 
          }
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
                    <button onClick={() => navigate('/manage')} className="text-slate-500 hover:text-slate-800 mr-4 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">{t.buildExecution.title}: {deployment?.name}</h1>
                        <div className="text-xs text-slate-500 mt-0.5">{t.buildExecution.selectProjects}</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">{t.buildExecution.selectProjects}</h3>
                        <span className="text-xs text-slate-500">{projectsToBuild.length} / {deployProjects.length} {t.compileList.select}</span>
                    </div>
                    <div className="divide-y divide-slate-200">
                        {deployProjects.map(project => (
                            <div key={project.id} className="px-6 py-4 flex items-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleProjectSelection(project.id)}>
                                <div className="mr-4">
                                    {projectsToBuild.includes(project.id) ? (
                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <Square className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-slate-800">{project.name}</div>
                                    <div className="text-xs text-slate-500">{project.latestVersion}</div>
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
                            <Play className="w-4 h-4 mr-2" />
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
            <button onClick={() => navigate('/manage')} className="text-slate-500 hover:text-slate-800 mr-4 transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
               <h1 className="text-lg font-bold text-slate-800">{t.buildExecution.title}: {deployment?.name}</h1>
               <div className="text-xs text-slate-500 mt-0.5">{t.buildExecution.startedAt}: {new Date().toLocaleTimeString()}</div>
            </div>
         </div>
         <div className="flex items-center space-x-4">
            {overallStatus === 'building' && (
              <span className="flex items-center text-blue-600 font-medium px-3 py-1 bg-blue-50 rounded-full animate-pulse">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> {t.buildExecution.building}
              </span>
            )}
            {overallStatus === 'success' && (
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 shadow-sm transition-colors">
                <Download className="w-4 h-4 mr-2" /> {t.buildExecution.downloadArtifact}
              </button>
            )}
            {overallStatus === 'failed' && (
              <span className="flex items-center text-red-600 font-medium px-3 py-1 bg-red-50 rounded-full">
                <AlertTriangle className="w-4 h-4 mr-2" /> {t.buildExecution.failed}
              </span>
            )}
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar: Project List */}
        <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.buildExecution.projectList}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
               {projectsToBuild.map(projectId => {
                  const project = deployProjects.find(p => p.id === projectId);
                  const state = buildStates[projectId] || { status: 'pending' };
                  
                  if (!project) return null;

                  return (
                    <button
                       key={project.id}
                       onClick={() => setSelectedProjectId(project.id)}
                       className={`w-full text-left p-3 rounded-md flex items-center justify-between transition-all ${
                          selectedProjectId === project.id 
                             ? 'bg-white shadow-sm ring-1 ring-blue-500/20' 
                             : 'hover:bg-slate-100'
                       }`}
                    >
                       <div className="flex items-center min-w-0">
                          <Box className={`w-5 h-5 mr-3 flex-shrink-0 ${selectedProjectId === project.id ? 'text-blue-600' : 'text-slate-400'}`} />
                          <div className="truncate">
                             <div className={`text-sm font-medium ${selectedProjectId === project.id ? 'text-blue-700' : 'text-slate-700'}`}>{project.name}</div>
                             <div className="text-xs text-slate-500">{project.latestVersion}</div>
                          </div>
                       </div>
                       
                       <div className="flex items-center ml-2">
                          {state.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-300" />}
                          {state.status === 'building' && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
                          {state.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {state.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                       </div>
                    </button>
                  );
               })}
            </div>
        </div>

        {/* Main Content: Logs */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0">
            {/* Log Header */}
            <div className="bg-[#252526] px-4 py-2 border-b border-black flex justify-between items-center text-slate-300">
                <div className="flex items-center text-sm font-mono">
                   <Terminal className="w-4 h-4 mr-2 text-slate-400" />
                   <span>{t.buildExecution.logsFor}: </span>
                   <span className="text-white font-bold ml-2">{deployProjects.find(p => p.id === selectedProjectId)?.name}</span>
                </div>
                {buildStates[selectedProjectId]?.duration && (
                   <div className="flex items-center text-xs text-slate-500">
                      <Clock className="w-3 h-3 mr-1" /> {t.buildExecution.duration}: {buildStates[selectedProjectId].duration}
                   </div>
                )}
            </div>

            {/* Log Output */}
            <div className="flex-1 p-4 overflow-auto code-scroll font-mono text-sm">
               {currentLogs.length === 0 ? (
                  <div className="text-slate-500 italic px-2">{t.buildExecution.pending}...</div>
               ) : (
                  <div className="space-y-1">
                     {currentLogs.map((log, idx) => (
                        <div key={idx} className="text-slate-300 whitespace-pre-wrap break-all hover:bg-[#2a2d2e] px-2 py-0.5 rounded-sm">
                           <span className="text-slate-500 mr-2">$</span>
                           {log}
                        </div>
                     ))}
                     {buildStates[selectedProjectId]?.status === 'building' && (
                        <div className="animate-pulse text-blue-400 px-2">_</div>
                     )}
                  </div>
               )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BuildExecution;
