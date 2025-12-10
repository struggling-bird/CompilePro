import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileText, Play, Terminal, Save, X, Folder, File, Upload, Image, CheckSquare, Square, FileCode, GitBranch, Tag, MoreHorizontal } from 'lucide-react';
import { MOCK_PROJECTS, MOCK_JSON_DEFAULT, MOCK_JSON_CUSTOM } from '../constants';
import { Project, Version } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = MOCK_PROJECTS.find(p => p.id === projectId) as Project;
  const { t } = useLanguage();

  const [activeVersion, setActiveVersion] = useState(project?.latestVersion);
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'README' | 'BUILD' | 'UPDATE'>('README');
  
  // Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'TEXT' | 'FILE' | 'JSON'>('TEXT');
  
  // Text Replace State
  const [regexPattern, setRegexPattern] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [replacementValue, setReplacementValue] = useState('');
  const [configDescription, setConfigDescription] = useState('');

  // New Version State
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionType, setNewVersionType] = useState<'tag' | 'branch'>('tag');
  const [sourceVersion, setSourceVersion] = useState('');

  if (!project) return <div>Project not found</div>;

  const handleOpenEditor = (type: 'TEXT' | 'FILE' | 'JSON') => {
    setActiveEditorTab(type);
    setShowEditor(true);
  };

  const handleAddVersion = () => {
    // In a real app, this would update the backend
    console.log('Adding version:', { name: newVersionName, type: newVersionType, source: sourceVersion });
    setShowAddVersionModal(false);
    setNewVersionName('');
  };

  /* --- Modal for Adding Version --- */
  const AddVersionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{t.projectDetail.addVersionTitle}</h3>
          <button onClick={() => setShowAddVersionModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.projectDetail.versionNo}</label>
            <input 
               type="text" 
               value={newVersionName}
               onChange={(e) => setNewVersionName(e.target.value)}
               className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
               placeholder="e.g. 1.2.0 or feature-login"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">{t.projectDetail.versionType}</label>
             <div className="flex space-x-4">
               <label className={`flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${newVersionType === 'tag' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input 
                     type="radio" 
                     name="type" 
                     className="mr-2 text-blue-600" 
                     checked={newVersionType === 'tag'} 
                     onChange={() => setNewVersionType('tag')} 
                  /> 
                  <Tag className="w-4 h-4 mr-2" />
                  {t.projectDetail.tag}
               </label>
               <label className={`flex items-center px-3 py-2 border rounded-md cursor-pointer transition-colors ${newVersionType === 'branch' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input 
                     type="radio" 
                     name="type" 
                     className="mr-2 text-purple-600" 
                     checked={newVersionType === 'branch'} 
                     onChange={() => setNewVersionType('branch')} 
                  /> 
                  <GitBranch className="w-4 h-4 mr-2" />
                  {t.projectDetail.branch}
               </label>
             </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">{t.projectDetail.source}</label>
             <select 
                className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                value={sourceVersion}
                onChange={(e) => setSourceVersion(e.target.value)}
             >
               <option value="">-- Select Source --</option>
               {project.versions.map(v => (
                  <option key={v.id} value={v.version}>{v.version}</option>
               ))}
             </select>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3">
           <button onClick={() => setShowAddVersionModal(false)} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50">{t.projectDetail.cancel}</button>
           <button onClick={handleAddVersion} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm">{t.projectDetail.save}</button>
        </div>
      </div>
    </div>
  );

  /* --- File Editor Overlay --- */
  const FileEditorOverlay = () => (
    <div className="absolute inset-0 bg-white z-40 flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
        <div className="flex space-x-1">
           <button 
             onClick={() => setActiveEditorTab('TEXT')}
             className={`px-3 py-1 rounded-t-md text-sm font-medium transition-colors ${activeEditorTab === 'TEXT' ? 'bg-white border-x border-t border-slate-300 text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
           >
             {t.projectDetail.textReplace}
           </button>
           <button 
             onClick={() => setActiveEditorTab('FILE')}
             className={`px-3 py-1 rounded-t-md text-sm font-medium transition-colors ${activeEditorTab === 'FILE' ? 'bg-white border-x border-t border-slate-300 text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
           >
             {t.projectDetail.fileReplace}
           </button>
           <button 
             onClick={() => setActiveEditorTab('JSON')}
             className={`px-3 py-1 rounded-t-md text-sm font-medium transition-colors ${activeEditorTab === 'JSON' ? 'bg-white border-x border-t border-slate-300 text-blue-600' : 'text-slate-500 hover:bg-slate-200'}`}
           >
             {t.projectDetail.jsonReplace}
           </button>
        </div>
        <div className="flex space-x-2">
           <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center hover:bg-blue-700" onClick={() => setShowEditor(false)}><Save className="w-3 h-3 mr-1"/> {t.projectDetail.save}</button>
           <button className="px-3 py-1 border border-slate-300 text-slate-600 rounded text-sm hover:bg-slate-50" onClick={() => setShowEditor(false)}>{t.projectDetail.cancel}</button>
        </div>
      </div>
      
      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar - File Tree */}
         <div className="w-64 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto hidden md:block">
            <div className="space-y-2 text-sm">
               <div className="flex items-center text-slate-700 font-medium cursor-pointer"><Folder className="w-4 h-4 mr-2 text-yellow-500" /> src</div>
               <div className="flex items-center text-slate-700 pl-4 cursor-pointer"><Folder className="w-4 h-4 mr-2 text-yellow-500" /> components</div>
               <div className="flex items-center text-slate-700 pl-8 cursor-pointer hover:text-blue-600"><FileCode className="w-4 h-4 mr-2 text-blue-400" /> Button.tsx</div>
               <div className="flex items-center text-slate-700 pl-8 cursor-pointer hover:text-blue-600"><FileCode className="w-4 h-4 mr-2 text-blue-400" /> Header.tsx</div>
               <div className="flex items-center text-slate-700 pl-4 cursor-pointer"><Folder className="w-4 h-4 mr-2 text-yellow-500" /> assets</div>
               <div className="flex items-center text-slate-700 pl-8 cursor-pointer hover:text-blue-600"><Image className="w-4 h-4 mr-2 text-purple-400" /> logo.png</div>
               <div className="flex items-center text-blue-600 pl-4 bg-blue-50 rounded py-1 cursor-pointer font-medium"><File className="w-4 h-4 mr-2" /> package.json</div>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Content remains the same as previous implementation... */}
            {activeEditorTab === 'TEXT' && (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="block text-xs font-bold text-slate-500 uppercase">{t.projectDetail.regexLabel}</label>
                         <div className="flex items-center space-x-2">
                            <input type="text" value={regexPattern} onChange={(e) => setRegexPattern(e.target.value)} placeholder="/pattern/flags" className="flex-1 border border-slate-300 rounded-md p-2 text-sm font-mono" />
                            <label className="flex items-center space-x-1"><input type="checkbox" checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} /> <span className="text-sm">{t.projectDetail.globalLabel}</span></label>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="block text-xs font-bold text-slate-500 uppercase">{t.projectDetail.descLabel}</label>
                         <input type="text" value={configDescription} onChange={(e) => setConfigDescription(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 text-sm" placeholder="Description" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase">{t.projectDetail.replacementLabel}</label>
                         <input type="text" value={replacementValue} onChange={(e) => setReplacementValue(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 text-sm font-mono" placeholder="New value" />
                      </div>
                   </div>
                </div>
                <div className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 overflow-auto code-scroll"><pre>...</pre></div>
              </div>
            )}
            {activeEditorTab === 'FILE' && <div className="p-6">File Upload UI</div>}
            {activeEditorTab === 'JSON' && <div className="p-6">JSON Editor</div>}
         </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full relative">
      {showAddVersionModal && <AddVersionModal />}
      {showEditor && <FileEditorOverlay />}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <button onClick={() => navigate('/compile')} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
           <ArrowLeft className="w-5 h-5 mr-2" />
           {t.projectDetail.back}
        </button>
        <div className="flex items-center space-x-4 text-sm text-slate-600">
           <span className="font-bold text-slate-900 text-lg">{project.name}</span>
           <span className="text-slate-300">|</span>
           <a href="#" className="text-blue-500 hover:underline flex items-center">
             <GitBranch className="w-4 h-4 mr-1" /> http://git.zhugeio.com/frontend/webapp
           </a>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Build Commands & Config Info */}
        <div className="flex flex-col md:flex-row gap-6">
           <div className="w-full md:w-1/3 space-y-3">
              <div className="flex items-center justify-between">
                 <h4 className="text-sm font-bold text-slate-700">{t.projectDetail.compilationCommands}</h4>
              </div>
              <div className="space-y-2">
                 {['yarn', 'npm run build'].map((cmd, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-blue-50 border border-blue-100 px-4 py-2.5 rounded text-blue-700 text-sm font-mono group hover:border-blue-200 transition-colors">
                       <span>{cmd}</span>
                       <button className="opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-blue-400 hover:text-red-500" /></button>
                    </div>
                 ))}
                 <button className="w-full border border-dashed border-slate-300 py-2 text-slate-500 text-sm rounded hover:bg-slate-50 hover:border-slate-400 hover:text-slate-600 flex items-center justify-center transition-all">
                    <Plus className="w-4 h-4 mr-1" /> {t.projectDetail.newCmd}
                 </button>
              </div>
           </div>
           
           <div className="w-full md:w-2/3 bg-[#fffbf0] border border-[#fcefc7] rounded-lg p-5">
              <h4 className="font-bold text-[#925a07] mb-3 text-sm">{t.projectDetail.configTypesTitle}</h4>
              <ul className="space-y-2 text-sm text-[#925a07]/80">
                 <li className="flex items-start"><span className="mr-2 font-bold">1.</span> {t.projectDetail.configTypes.text}</li>
                 <li className="flex items-start"><span className="mr-2 font-bold">2.</span> {t.projectDetail.configTypes.file}</li>
                 <li className="flex items-start"><span className="mr-2 font-bold">3.</span> {t.projectDetail.configTypes.json}</li>
              </ul>
           </div>
        </div>

        {/* Timeline - Redesigned */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-700">{t.projectDetail.versionHistory}</h4>
           </div>
           
           <div className="relative pt-8 pb-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center space-x-16 min-w-max px-6">
                 {/* Horizontal Line */}
                 <div className="absolute top-[46px] left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
                 
                 {project.versions.map((v) => (
                    <div key={v.id} className="relative group flex flex-col items-center cursor-pointer" onClick={() => setActiveVersion(v.version)}>
                       {/* Version Node */}
                       <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 relative z-10
                          ${activeVersion === v.version 
                             ? (v.isDeprecated ? 'bg-red-500 border-red-200 scale-110 shadow-lg shadow-red-500/30' : 'bg-blue-600 border-blue-200 scale-110 shadow-lg shadow-blue-600/30') 
                             : 'bg-white border-slate-300 group-hover:border-blue-400'
                          }
                       `}>
                          {v.isDeprecated && activeVersion !== v.version && <div className="w-3 h-3 bg-red-400 rounded-full"></div>}
                          {activeVersion === v.version && <div className="w-3 h-3 bg-white rounded-full"></div>}
                       </div>

                       {/* Version Info */}
                       <div className="mt-3 text-center space-y-0.5">
                          <div className={`text-sm font-bold ${activeVersion === v.version ? 'text-blue-700' : 'text-slate-700'}`}>
                             {v.version}
                          </div>
                          <div className={`text-xs ${v.isDeprecated ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                             {v.isDeprecated ? t.projectDetail.deprecated : v.date}
                          </div>
                          {/* Type Badge */}
                          {v.type === 'branch' && (
                             <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 mt-1 border border-purple-200">
                                <GitBranch className="w-3 h-3 mr-1" /> Branch
                             </div>
                          )}
                       </div>

                       {/* Hover Context Menu */}
                       <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-xs rounded py-1 px-2 shadow-lg whitespace-nowrap pointer-events-none group-hover:pointer-events-auto flex gap-2">
                          <span className="hover:text-blue-300 cursor-pointer">Edit</span>
                          <span className="border-l border-slate-600 mx-1"></span>
                          <span className="hover:text-red-300 cursor-pointer">Delete</span>
                       </div>
                    </div>
                 ))}

                 {/* Add Button */}
                 <button 
                    onClick={() => setShowAddVersionModal(true)} 
                    className="flex flex-col items-center group relative top-[-2px]"
                 >
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-400 bg-white flex items-center justify-center text-slate-400 group-hover:border-blue-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                       <Plus className="w-5 h-5" />
                    </div>
                    <div className="mt-3 text-xs font-medium text-slate-400 group-hover:text-blue-600 transition-colors">{t.projectDetail.new}</div>
                 </button>
              </div>
           </div>
        </div>

        {/* Docs Tabs & Content */}
        <div className="border border-slate-200 rounded-lg bg-white min-h-[400px] flex flex-col shadow-sm mt-6">
           <div className="flex border-b border-slate-200">
             {['README', 'BUILD', 'UPDATE'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setActiveDocTab(tab as any)}
                 className={`
                    px-8 py-4 text-sm font-bold transition-colors relative
                    ${activeDocTab === tab 
                       ? 'text-blue-600 bg-white' 
                       : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }
                 `}
               >
                 {tab === 'README' ? t.projectDetail.readme : tab === 'BUILD' ? t.projectDetail.build : t.projectDetail.update}
                 {activeDocTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
               </button>
             ))}
           </div>
           <div className="p-8">
              <div className="prose prose-slate max-w-none">
                 {activeDocTab === 'README' && (
                   <>
                     <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.projectDetail.docsTitle}</h2>
                     <p className="text-slate-600">{t.projectDetail.docsDesc1}</p>
                     <p className="text-slate-600">{t.projectDetail.docsDesc2}</p>
                     <div className="mt-8 p-4 bg-slate-50 rounded border-l-4 border-blue-500 text-slate-700">
                        <p className="font-medium mb-1">Current Context:</p>
                        <p className="font-mono text-sm text-blue-600">{activeVersion} {project.versions.find(v => v.version === activeVersion)?.type === 'branch' ? '(Branch)' : ''}</p>
                     </div>
                   </>
                 )}
                 {activeDocTab === 'BUILD' && <div className="text-slate-500 italic">Build documentation for {activeVersion}...</div>}
                 {activeDocTab === 'UPDATE' && <div className="text-slate-500 italic">Changelog for {activeVersion}...</div>}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetail;