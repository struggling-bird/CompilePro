import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileText, Play, Terminal, Save, X, Folder, File, Upload, Image, CheckSquare, Square, FileCode } from 'lucide-react';
import { MOCK_PROJECTS, MOCK_JSON_DEFAULT, MOCK_JSON_CUSTOM } from '../constants';
import { Project } from '../types';
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

  // File Replace State
  const [selectedFile, setSelectedFile] = useState<string | null>(null);


  if (!project) return <div>Project not found</div>;

  const handleOpenEditor = (type: 'TEXT' | 'FILE' | 'JSON') => {
    setActiveEditorTab(type);
    setShowEditor(true);
  };

  /* --- Modal for Adding Version --- */
  const AddVersionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">{t.projectDetail.addVersionTitle}</h3>
          <button onClick={() => setShowAddVersionModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.projectDetail.versionNo}:</label>
            <input type="text" className="w-full border border-slate-300 rounded-md p-2" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">{t.projectDetail.source}:</label>
             <div className="flex space-x-4">
               <label className="flex items-center"><input type="radio" name="source" className="mr-2" defaultChecked /> {t.projectDetail.tag}</label>
               <label className="flex items-center"><input type="radio" name="source" className="mr-2" /> {t.projectDetail.branch}</label>
             </div>
          </div>
          <div>
             <select className="w-full border border-slate-300 rounded-md p-2 bg-white">
               <option>ComboBox</option>
             </select>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 flex justify-end">
           <button onClick={() => setShowAddVersionModal(false)} className="bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900">{t.projectDetail.save}</button>
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
            
            {/* TEXT REPLACE MODE */}
            {activeEditorTab === 'TEXT' && (
              <div className="flex flex-col h-full">
                {/* Configuration Form */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                         <span className="text-sm font-bold text-slate-700 px-2 py-1 bg-white border border-slate-200 rounded">Config 1</span>
                         <button className="text-slate-400 hover:text-blue-600"><Plus className="w-4 h-4" /></button>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="block text-xs font-bold text-slate-500 uppercase">{t.projectDetail.regexLabel}</label>
                         <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              value={regexPattern}
                              onChange={(e) => setRegexPattern(e.target.value)}
                              placeholder="/pattern/flags"
                              className="flex-1 border border-slate-300 rounded-md p-2 text-sm font-mono focus:ring-blue-500 focus:border-blue-500"
                            />
                            <label className="flex items-center space-x-1 cursor-pointer">
                               <input 
                                  type="checkbox" 
                                  checked={isGlobal} 
                                  onChange={(e) => setIsGlobal(e.target.checked)}
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                               />
                               <span className="text-sm text-slate-600">{t.projectDetail.globalLabel}</span>
                            </label>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="block text-xs font-bold text-slate-500 uppercase">{t.projectDetail.descLabel}</label>
                         <input 
                           type="text" 
                           value={configDescription}
                           onChange={(e) => setConfigDescription(e.target.value)}
                           className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                           placeholder="Describe this replacement rule"
                         />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase">{t.projectDetail.replacementLabel}</label>
                         <input 
                           type="text" 
                           value={replacementValue}
                           onChange={(e) => setReplacementValue(e.target.value)}
                           className="w-full border border-slate-300 rounded-md p-2 text-sm font-mono focus:ring-blue-500 focus:border-blue-500"
                           placeholder="New text value"
                         />
                      </div>
                   </div>
                </div>

                {/* Code Preview */}
                <div className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 overflow-auto code-scroll">
                   <div className="text-slate-500 mb-2">{t.projectDetail.previewComment} src/config.js</div>
                   <pre>
{`import { AppConfig } from './types';

export const config: AppConfig = {
  // Application Domain
  domain: '${regexPattern ? (isGlobal ? "https://zhugeio.com".replace(new RegExp(regexPattern, "g"), replacementValue) : "https://zhugeio.com".replace(new RegExp(regexPattern), replacementValue)) : "https://zhugeio.com"}',
  
  // API Endpoints
  api: {
    baseUrl: 'https://api.zhugeio.com/v1',
    timeout: 5000
  },
  
  // Feature Flags
  features: {
    newDashboard: true,
    betaAnalytics: false
  }
};`}
                   </pre>
                </div>
              </div>
            )}

            {/* FILE REPLACE MODE */}
            {activeEditorTab === 'FILE' && (
               <div className="flex flex-col h-full p-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center py-12 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                     <Upload className="w-12 h-12 text-slate-400 mb-4" />
                     <p className="text-slate-600 font-medium">{t.projectDetail.uploadText}</p>
                     <p className="text-slate-400 text-sm mt-1">{t.projectDetail.supports}</p>
                  </div>
                  
                  <div className="mt-8">
                     <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">{t.projectDetail.currentAsset}</h4>
                     <div className="bg-slate-100 p-4 rounded-md inline-block">
                        <div className="w-32 h-32 bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                           <div className="text-center">
                              <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">Z</div>
                              <span className="text-xs text-slate-500">logo.png</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* JSON REPLACE MODE */}
            {activeEditorTab === 'JSON' && (
               <div className="flex flex-col h-full">
                  <div className="flex items-center justify-center py-2 bg-slate-100 border-b border-slate-200 text-xs text-slate-500">
                     <span className="w-1/2 text-center font-medium border-r border-slate-200">{t.projectDetail.defaultConfig}</span>
                     <span className="w-1/2 text-center font-medium text-blue-600">{t.projectDetail.customOverlay}</span>
                  </div>
                  <div className="flex-1 flex">
                     {/* Left: Default */}
                     <div className="w-1/2 border-r border-slate-200 bg-slate-50 p-4 overflow-auto code-scroll">
                        <pre className="text-xs font-mono text-slate-600">{MOCK_JSON_DEFAULT}</pre>
                     </div>
                     {/* Right: Custom */}
                     <div className="w-1/2 bg-white p-4 overflow-auto code-scroll relative">
                        <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] rounded font-medium">{t.projectDetail.editable}</div>
                        <textarea 
                           className="w-full h-full resize-none font-mono text-xs focus:outline-none text-slate-800"
                           defaultValue={MOCK_JSON_CUSTOM}
                        />
                     </div>
                  </div>
               </div>
            )}

         </div>
      </div>
    </div>
  );

  /* --- Main Project View --- */
  return (
    <div className="flex flex-col h-full relative">
      {showAddVersionModal && <AddVersionModal />}
      {showEditor && <FileEditorOverlay />}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <button onClick={() => navigate('/compile')} className="flex items-center text-slate-500 hover:text-slate-800">
           <ArrowLeft className="w-5 h-5 mr-2" />
           {t.projectDetail.back}
        </button>
        <div className="flex items-center space-x-4 text-sm text-slate-600">
           <span className="font-bold text-slate-900">{project.name}</span>
           <a href="#" className="text-blue-500 hover:underline ml-4">{t.projectDetail.gitRepo}: http://git.zhugeio.com/frontend/webapp</a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* Config Table */}
        <div className="bg-white border border-slate-200 rounded-md mb-8 overflow-hidden">
           <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t.projectDetail.name}</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t.projectDetail.type}</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t.projectDetail.fileLocation}</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t.projectDetail.description}</th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t.projectDetail.action}</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
               <tr>
                 <td className="px-6 py-4 text-sm text-slate-900">Domain</td>
                 <td className="px-6 py-4 text-sm text-slate-500">Text</td>
                 <td className="px-6 py-4 text-sm text-slate-500 font-mono">/config.js</td>
                 <td className="px-6 py-4 text-sm text-slate-500">{t.projectDetail.configDesc.domain}</td>
                 <td className="px-6 py-4 text-right text-sm"><button onClick={() => handleOpenEditor('TEXT')} className="text-blue-600 hover:text-blue-800 mr-3">{t.projectDetail.edit}</button><button className="text-red-600 hover:text-red-800">{t.projectDetail.delete}</button></td>
               </tr>
               <tr>
                 <td className="px-6 py-4 text-sm text-slate-900">Logo</td>
                 <td className="px-6 py-4 text-sm text-slate-500">File</td>
                 <td className="px-6 py-4 text-sm text-slate-500 font-mono">/assets/images/logo.png</td>
                 <td className="px-6 py-4 text-sm text-slate-500">{t.projectDetail.configDesc.logo}</td>
                 <td className="px-6 py-4 text-right text-sm"><button onClick={() => handleOpenEditor('FILE')} className="text-blue-600 hover:text-blue-800 mr-3">{t.projectDetail.edit}</button><button className="text-red-600 hover:text-red-800">{t.projectDetail.delete}</button></td>
               </tr>
                <tr>
                 <td className="px-6 py-4 text-sm text-slate-900">Package Config</td>
                 <td className="px-6 py-4 text-sm text-slate-500">JSON</td>
                 <td className="px-6 py-4 text-sm text-slate-500 font-mono">/package.json</td>
                 <td className="px-6 py-4 text-sm text-slate-500">{t.projectDetail.configDesc.package}</td>
                 <td className="px-6 py-4 text-right text-sm"><button onClick={() => handleOpenEditor('JSON')} className="text-blue-600 hover:text-blue-800 mr-3">{t.projectDetail.edit}</button><button className="text-red-600 hover:text-red-800">{t.projectDetail.delete}</button></td>
               </tr>
             </tbody>
           </table>
           <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
              <button className="text-sm text-blue-600 font-medium flex items-center hover:text-blue-800">
                 <Plus className="w-4 h-4 mr-1" /> {t.projectDetail.addConfig}
              </button>
           </div>
        </div>

        {/* Build Commands */}
        <div className="flex mb-8 space-x-8">
           <div className="w-1/3 space-y-2">
              <h4 className="text-sm font-medium text-slate-700 mb-3">{t.projectDetail.compilationCommands}</h4>
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 px-3 py-2 rounded text-blue-700 text-sm">
                 <span>yarn</span>
                 <button><X className="w-3 h-3 text-blue-400 hover:text-blue-600" /></button>
              </div>
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 px-3 py-2 rounded text-blue-700 text-sm">
                 <span>npm run build</span>
                 <button><X className="w-3 h-3 text-blue-400 hover:text-blue-600" /></button>
              </div>
              <button className="w-full border border-dashed border-slate-300 py-2 text-slate-500 text-sm rounded hover:bg-slate-50 flex items-center justify-center">
                 <Plus className="w-4 h-4 mr-1" /> {t.projectDetail.newCmd}
              </button>
           </div>
           
           <div className="w-2/3 bg-yellow-50 border border-yellow-100 rounded p-4 text-sm text-yellow-800">
              <h4 className="font-bold mb-2">{t.projectDetail.configTypesTitle}</h4>
              <ul className="list-decimal list-inside space-y-1">
                 <li>{t.projectDetail.configTypes.text}</li>
                 <li>{t.projectDetail.configTypes.file}</li>
                 <li>{t.projectDetail.configTypes.json}</li>
              </ul>
           </div>
        </div>

        {/* Timeline */}
        <div className="mb-8">
           <h4 className="text-sm font-medium text-slate-700 mb-4">{t.projectDetail.versionHistory}</h4>
           <div className="relative pt-6 pb-2 overflow-x-auto">
              {/* Line */}
              <div className="absolute top-9 left-0 w-full h-0.5 bg-slate-200"></div>
              
              <div className="flex space-x-12 min-w-max px-4">
                 {project.versions.map((v) => (
                    <div key={v.id} className="relative flex flex-col items-center group cursor-pointer" onClick={() => setActiveVersion(v.version)}>
                       <div className={`w-6 h-6 rounded-full z-10 border-2 ${activeVersion === v.version ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'} transition-colors`}></div>
                       <div className="mt-2 text-xs font-medium text-slate-900">{v.version}</div>
                       <div className={`text-[10px] ${v.isDeprecated ? 'text-red-500 line-through' : 'text-slate-500'}`}>{v.date}</div>
                       {v.isDeprecated && <span className="text-[10px] text-red-500 font-bold">{t.projectDetail.deprecated}</span>}
                    </div>
                 ))}
                 <button onClick={() => setShowAddVersionModal(true)} className="relative flex flex-col items-center group">
                    <div className="w-6 h-6 rounded-full z-10 border-2 border-dashed border-slate-400 bg-white flex items-center justify-center text-slate-400 group-hover:border-blue-500 group-hover:text-blue-500">
                       <Plus className="w-4 h-4" />
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{t.projectDetail.new}</div>
                 </button>
              </div>
           </div>
        </div>

        {/* Docs Section */}
        <div className="border border-slate-200 rounded-md bg-white min-h-[300px] flex flex-col">
           <div className="flex border-b border-slate-200">
             {['README', 'BUILD', 'UPDATE'].map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setActiveDocTab(tab as any)}
                 className={`px-6 py-3 text-sm font-medium ${activeDocTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {tab === 'README' ? t.projectDetail.readme : tab === 'BUILD' ? t.projectDetail.build : t.projectDetail.update}
               </button>
             ))}
           </div>
           <div className="p-6 text-slate-600 text-sm leading-relaxed">
              {activeDocTab === 'README' && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{t.projectDetail.docsTitle}</h3>
                  <p className="mb-2">{t.projectDetail.docsDesc1} </p>
                  <p>{t.projectDetail.docsDesc2}</p>
                  <p className="mt-4 text-slate-400 italic">Content for {activeVersion}...</p>
                </div>
              )}
              {activeDocTab === 'BUILD' && <div>Build instructions for {activeVersion}...</div>}
              {activeDocTab === 'UPDATE' && <div>Changelog for {activeVersion}...</div>}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetail;