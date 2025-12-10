import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, PlusOutlined, CloseOutlined, BorderOutlined, CheckSquareOutlined, InfoCircleOutlined, SaveOutlined, DeleteOutlined, EditOutlined, BranchesOutlined, DownloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { MOCK_TEMPLATES, MOCK_PROJECTS } from '../constants';
import { TemplateVersion, TemplateModule, TemplateGlobalConfig, TemplateModuleConfig } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const TemplateDetail: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { t } = useLanguage();

  // Load existing or mock new
  const existingTemplate = MOCK_TEMPLATES.find(t => t.id === templateId);
  const [templateName, setTemplateName] = useState(existingTemplate?.name || 'New Deployment Suite');
  
  // State for Versions (The Suite's own version history)
  const [versions, setVersions] = useState<TemplateVersion[]>(
    existingTemplate?.versions || [
      {
         id: 'v1', version: '1.0.0', date: 'Today', status: 'Active',
         globalConfigs: [
             { id: 'g1', name: 'Domain', defaultValue: 'https://zhugeio.com/', description: 'Main Platform Domain', isHidden: false },
             { id: 'g2', name: 'Logo', defaultValue: 'images/logo.png', description: 'Logo File', isHidden: true }
         ],
         modules: []
      }
    ]
  );
  
  // Active State
  const [activeVersionId, setActiveVersionId] = useState<string>(
     existingTemplate?.versions && existingTemplate.versions.length > 0 
        ? existingTemplate.versions[existingTemplate.versions.length - 1].id 
        : 'v1'
  );

  const activeVersion = versions.find(v => v.id === activeVersionId) || versions[0];

  // Active Module Tab
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Modal State for Adding Module
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProjectVersion, setSelectedProjectVersion] = useState('');

  // Documentation Tab State
  const [activeDocTab, setActiveDocTab] = useState<'README' | 'BUILD' | 'UPDATE'>('README');

  // Sync active module when version changes
  useEffect(() => {
    if (activeVersion?.modules.length > 0) {
        // Keep current if exists in new version, else pick first
        if (activeModuleId && activeVersion.modules.find(m => m.id === activeModuleId)) {
            // keep
        } else {
            setActiveModuleId(activeVersion.modules[0].id);
        }
    } else {
        setActiveModuleId(null);
    }
  }, [activeVersionId, activeVersion, activeModuleId]);


  const handleAddModule = () => {
     if (!selectedProjectId || !selectedProjectVersion) return;
     
     const project = MOCK_PROJECTS.find(p => p.id === selectedProjectId);
     if (!project) return;

     const newModule: TemplateModule = {
        id: `m-${Date.now()}`,
        projectId: project.id,
        projectName: project.name,
        projectVersion: selectedProjectVersion,
        publishMethod: 'GIT',
        configs: [
            // Mock some initial configs based on project
            { id: `c-${Date.now()}-1`, name: 'Domain', fileLocation: '/config.js', mappingType: 'GLOBAL', mappingValue: activeVersion.globalConfigs[0]?.id || '', regex: '/origin/', description: 'Site Domain', isHidden: false, isSelected: true }
        ]
     };

     const updatedVersions = versions.map(v => {
        if (v.id === activeVersionId) {
            return { ...v, modules: [...v.modules, newModule] };
        }
        return v;
     });
     setVersions(updatedVersions);
     setActiveModuleId(newModule.id);
     setShowAddModuleModal(false);
     setSelectedProjectId('');
     setSelectedProjectVersion('');
  };

  const handleSave = () => {
      console.log('Saving template:', { name: templateName, versions });
      navigate('/templates');
  };

  const currentModule = activeVersion?.modules.find(m => m.id === activeModuleId);

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Add Module Modal */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-xl w-96 p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-slate-800">{t.templateDetail.addModuleTitle}</h3>
                 <button onClick={() => setShowAddModuleModal(false)}><CloseOutlined className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.templateDetail.selectProject}</label>
                    <select 
                      className="w-full border border-slate-300 rounded-md p-2 bg-white"
                      value={selectedProjectId}
                      onChange={e => { setSelectedProjectId(e.target.value); setSelectedProjectVersion(''); }}
                    >
                       <option value="">-- {t.templateDetail.select} --</option>
                       {MOCK_PROJECTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>
                 {selectedProjectId && (
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t.templateDetail.selectVersion}</label>
                        <select 
                          className="w-full border border-slate-300 rounded-md p-2 bg-white"
                          value={selectedProjectVersion}
                          onChange={e => setSelectedProjectVersion(e.target.value)}
                        >
                           <option value="">-- {t.templateDetail.select} --</option>
                           {MOCK_PROJECTS.find(p => p.id === selectedProjectId)?.versions.map(v => (
                               <option key={v.id} value={v.version}>{v.version}</option>
                           ))}
                        </select>
                     </div>
                 )}
                 <div className="pt-4 flex justify-end space-x-2">
                     <button onClick={() => setShowAddModuleModal(false)} className="px-4 py-2 border rounded-md text-sm text-slate-600 hover:bg-slate-50">{t.templateDetail.cancel}</button>
                     <button 
                        onClick={handleAddModule}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        disabled={!selectedProjectId || !selectedProjectVersion}
                     >
                        {t.templateDetail.add}
                     </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
         <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/templates')} className="text-slate-500 hover:text-slate-800 transition-colors">
               <ArrowLeftOutlined className="w-5 h-5" />
            </button>
            <div className="flex items-baseline space-x-3">
               <span className="text-sm font-bold text-slate-500">{t.templateDetail.name}:</span>
               <input 
                  type="text" 
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  className="font-bold text-slate-900 text-lg border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent w-64 transition-colors"
               />
               <span className="text-sm text-slate-400 bg-slate-100 px-2 py-0.5 rounded">v:{activeVersion.version}</span>
            </div>
         </div>
         <button onClick={handleSave} className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm">
            <SaveOutlined className="w-4 h-4 mr-2" /> {t.templateDetail.save}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
         
         {/* Global Config Section */}
         <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-bold text-slate-700 text-sm flex items-center">
                  <div className="w-1 h-4 bg-blue-500 mr-2 rounded-full"></div>
                  {t.templateDetail.globalConfigTitle}
               </h3>
            </div>
            <div className="p-0">
               <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-500">
                     <tr>
                        <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider">{t.templateDetail.name}</th>
                        <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider">{t.templateDetail.defaultValue}</th>
                        <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider">{t.templateDetail.desc}</th>
                        <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider">{t.templateDetail.isHidden}</th>
                        <th className="px-6 py-2 text-right text-xs font-semibold uppercase tracking-wider">{t.templateDetail.action}</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                     {activeVersion.globalConfigs.map(config => (
                        <tr key={config.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-3 text-sm font-medium text-slate-900">{config.name}</td>
                           <td className="px-6 py-3 text-sm text-slate-600">{config.defaultValue}</td>
                           <td className="px-6 py-3 text-sm text-slate-500">{config.description}</td>
                           <td className="px-6 py-3 text-sm text-slate-500">{config.isHidden ? t.templateDetail.yes : t.templateDetail.no}</td>
                           <td className="px-6 py-3 text-sm text-right font-medium space-x-3">
                              <button className="text-blue-600 hover:text-blue-900">{t.templateDetail.edit}</button>
                              <button className="text-red-600 hover:text-red-900">{t.templateDetail.delete}</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
                  <button className="flex items-center text-xs font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-300 px-3 py-1.5 rounded hover:shadow-sm transition-all">
                     <PlusOutlined className="w-3 h-3 mr-1.5" /> {t.templateDetail.addGlobalConfig}
                  </button>
               </div>
            </div>
         </div>

         {/* Modules Section */}
         <div className="bg-white border border-slate-200 rounded-lg shadow-sm min-h-[400px] flex flex-col overflow-hidden">
            {/* Module Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100 px-2 pt-2 overflow-x-auto no-scrollbar">
               {activeVersion.modules.map(module => (
                  <button
                     key={module.id}
                     onClick={() => setActiveModuleId(module.id)}
                     className={`
                        px-4 py-2 text-sm font-medium rounded-t-md mr-1 flex items-center border-t border-l border-r transition-all
                        ${activeModuleId === module.id 
                           ? 'bg-white border-slate-200 border-b-white text-blue-600 shadow-[0_-2px_3px_rgba(0,0,0,0.02)] z-10 -mb-[1px]' 
                           : 'bg-slate-200 border-transparent text-slate-500 hover:bg-slate-300 hover:text-slate-700'
                        }
                     `}
                  >
                     {module.projectName}-{module.projectVersion}
                     <span 
                        className={`ml-2 p-0.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors ${activeModuleId === module.id ? 'text-slate-400' : 'text-slate-400'}`}
                        onClick={(e) => { e.stopPropagation(); /* delete logic */ }}
                     >
                        <CloseOutlined className="w-3 h-3"/>
                     </span>
                  </button>
               ))}
               <button 
                  onClick={() => setShowAddModuleModal(true)}
                  className="px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 rounded-t-md mb-1 ml-1 transition-colors"
               >
                  <PlusOutlined className="w-5 h-5" />
               </button>
            </div>

            {/* Module Content */}
            <div className="p-0 flex-1 flex flex-col relative">
               {currentModule ? (
                  <>
                     <div className="flex-1 overflow-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                           <thead className="bg-slate-50 text-slate-500">
                              <tr>
                                 <th className="px-6 py-3 text-left w-12"><BorderOutlined className="w-4 h-4 text-slate-300"/></th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">{t.templateDetail.name}</th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">{t.templateDetail.fileLocation}</th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-56">{t.templateDetail.mapping}</th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">{t.templateDetail.regex}</th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">{t.templateDetail.desc}</th>
                                 <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">{t.templateDetail.isHidden}</th>
                                 <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">{t.templateDetail.action}</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-200 bg-white">
                              {currentModule.configs.map(config => (
                                 <tr key={config.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                       {config.isSelected ? <CheckSquareOutlined className="w-4 h-4 text-blue-600"/> : <BorderOutlined className="w-4 h-4 text-slate-300"/>}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{config.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono bg-slate-50 rounded px-2 py-1 inline-block my-2 mx-4 w-fit">{config.fileLocation}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                       <select className="block w-full border border-slate-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:ring-blue-500 focus:border-blue-500">
                                          <optgroup label={t.templateDetail.mapToGlobal}>
                                             {activeVersion.globalConfigs.map(gc => (
                                                <option key={gc.id} value={gc.id} selected={config.mappingValue === gc.id}>[Global] {gc.name}</option>
                                             ))}
                                          </optgroup>
                                          <optgroup label="Other">
                                             <option value="fixed">{t.templateDetail.fixedValue}</option>
                                          </optgroup>
                                       </select>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-mono text-xs">{config.regex}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{config.description}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{config.isHidden ? t.templateDetail.yes : t.templateDetail.no}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                       <button className="text-blue-600 hover:text-blue-900 mr-3">{t.templateDetail.edit}</button>
                                       <button className="text-red-600 hover:text-red-900">{t.templateDetail.delete}</button>
                                    </td>
                                 </tr>
                              ))}
                              {currentModule.configs.length === 0 && (
                                 <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center text-slate-400 text-sm">
                                       No configs mapped yet.
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                     <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center space-x-8">
                        <span className="text-sm font-bold text-slate-700">{t.templateDetail.publishMethod}:</span>
                        <label className="flex items-center text-sm text-slate-700 cursor-pointer group">
                           <input type="radio" name="publish" className="mr-2 text-blue-600 focus:ring-blue-500" checked={currentModule.publishMethod === 'GIT'} /> 
                           <span className="group-hover:text-blue-600 flex items-center"><CloudUploadOutlined className="w-4 h-4 mr-1.5 text-slate-400 group-hover:text-blue-500"/> {t.templateDetail.gitPush}</span>
                        </label>
                        <label className="flex items-center text-sm text-slate-700 cursor-pointer group">
                           <input type="radio" name="publish" className="mr-2 text-blue-600 focus:ring-blue-500" checked={currentModule.publishMethod === 'DOWNLOAD'} /> 
                           <span className="group-hover:text-blue-600 flex items-center"><DownloadOutlined className="w-4 h-4 mr-1.5 text-slate-400 group-hover:text-blue-500"/> {t.templateDetail.download}</span>
                        </label>
                     </div>
                  </>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[200px]">
                     <p className="mb-4">Select a module to view configuration or add a new one.</p>
                     <button 
                        onClick={() => setShowAddModuleModal(true)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md font-medium hover:bg-blue-100 transition-colors"
                     >
                        {t.templateDetail.addModule}
                     </button>
                  </div>
               )}
            </div>
         </div>

         {/* Timeline */}
         <div className="mt-8">
            <div className="relative pt-8 pb-12 overflow-x-auto bg-white border border-slate-200 rounded-lg px-10 shadow-sm">
                {/* Timeline Horizontal Line */}
               <div className="absolute top-[60px] left-0 w-full h-0.5 bg-slate-200"></div>
               
               <div className="flex items-start space-x-20 min-w-max">
                  {versions.map(v => (
                     <div 
                        key={v.id} 
                        className="relative flex flex-col items-center group cursor-pointer z-10"
                        onClick={() => setActiveVersionId(v.id)}
                     >
                        {/* Version Label */}
                        <div className={`text-xs font-bold mb-3 ${activeVersionId === v.id ? 'text-blue-600' : 'text-slate-500'}`}>
                           {v.version}
                           {v.isBranch && <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] border border-orange-200">Branch</span>}
                        </div>
                        
                        {/* Node */}
                        <div className={`w-5 h-5 rounded-full border-2 transition-all bg-white ${
                           activeVersionId === v.id 
                              ? 'border-blue-600 ring-4 ring-blue-100 scale-110' 
                              : 'border-slate-400 group-hover:border-blue-400'
                        }`}></div>
                        
                        {/* Date */}
                        <div className="mt-3 text-[10px] text-slate-400 font-medium">{v.date}</div>
                        
                        {/* Connector for Branch (Visual only for now) */}
                        {v.isBranch && (
                           <div className="absolute top-[28px] -left-10 w-10 h-0.5 bg-slate-200 border-t border-dashed border-slate-300"></div>
                        )}
                     </div>
                  ))}
                  
                  {/* Add Branch Button */}
                  <button className="relative flex flex-col items-center group z-10 mt-[19px]">
                     <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 bg-white transition-all">
                        <PlusOutlined className="w-4 h-4" />
                     </div>
                     <div className="mt-2 text-[10px] text-slate-400 group-hover:text-blue-500 transition-colors">{t.templateDetail.addBranch}</div>
                  </button>
               </div>
            </div>

            {/* Documentation Tabs & Note */}
            <div className="mt-6 flex justify-between items-start">
                <div className="flex-1 mr-8">
                    <div className="flex space-x-1 mb-0">
                        {['README', 'BUILD', 'UPDATE'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveDocTab(tab as any)}
                                className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-t-md transition-colors ${
                                    activeDocTab === tab 
                                    ? 'bg-slate-800 text-white' 
                                    : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white border border-slate-200 p-6 rounded-b-md rounded-tr-md min-h-[150px] shadow-sm">
                        <p className="text-slate-500 text-sm">
                            {activeDocTab === 'README' && "Project documentation and usage guide..."}
                            {activeDocTab === 'BUILD' && "Build instructions and environment setup..."}
                            {activeDocTab === 'UPDATE' && "Changelog and update notes..."}
                        </p>
                    </div>
                </div>

                {/* Sticky Note */}
                <div className="w-72 bg-[#fff9c4] border border-[#fbc02d] p-4 shadow-md transform rotate-1 hover:rotate-0 transition-transform duration-300 relative">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-red-500/20 transform -rotate-2"></div>
                   <h5 className="text-xs font-bold text-yellow-900 mb-2 uppercase tracking-wide flex items-center">
                      <InfoCircleOutlined className="w-3 h-3 mr-1" /> {t.templateDetail.branchNoteTitle}
                   </h5>
                   <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                      {t.templateDetail.branchNote}
                   </p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TemplateDetail;
