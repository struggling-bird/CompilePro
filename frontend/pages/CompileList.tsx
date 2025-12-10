import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, SettingOutlined, CheckSquareOutlined, BorderOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { MOCK_PROJECTS } from '../constants';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const CompileList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { t } = useLanguage();
  
  // New Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectVersion, setNewProjectVersion] = useState('');

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === projects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(projects.map(p => p.id));
    }
  };

  const handleAddProject = () => {
    if (!newProjectName || !newProjectVersion) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      latestVersion: newProjectVersion,
      readmeUrl: '#',
      buildDocUrl: '#',
      versions: [
        { id: `v-${Date.now()}`, version: newProjectVersion, date: 'Today', type: 'tag' }
      ]
    };
    
    setProjects([...projects, newProject]);
    setIsModalOpen(false);
    setNewProjectName('');
    setNewProjectVersion('');
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* New Project Modal */}
      {isModalOpen && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-96 p-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-slate-800">{t.compileList.createProjectTitle}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
               </div>
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t.compileList.projectName}</label>
                   <input 
                      type="text" 
                      className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder={t.compileList.projectPlaceholder}
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{t.compileList.initialVersion}</label>
                   <input 
                      type="text" 
                      className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder={t.compileList.versionPlaceholder}
                      value={newProjectVersion}
                      onChange={e => setNewProjectVersion(e.target.value)}
                   />
                 </div>
                 <div className="pt-2">
                   <button 
                      onClick={handleAddProject}
                      disabled={!newProjectName || !newProjectVersion}
                      className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                      {t.compileList.createBtn}
                   </button>
                 </div>
               </div>
            </div>
         </div>
       )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-4">
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchOutlined className="h-4 w-4 text-slate-400" />
             </div>
             <input 
                type="text" 
                className="block w-64 pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder={t.compileList.searchPlaceholder}
             />
           </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center hover:bg-blue-700 transition shadow-sm"
          >
             <PlusOutlined className="w-4 h-4 mr-1.5" />
             {t.compileList.newProject}
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="text-slate-600 hover:text-blue-600 font-medium flex items-center px-3 py-2 rounded-md hover:bg-slate-100 transition"
          >
             <SettingOutlined className="w-5 h-5 mr-1.5" />
             {t.compileList.settings}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-16">
                {t.compileList.select}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t.compileList.projectName}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t.compileList.latestVersion}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t.compileList.docs}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t.compileList.buildDoc}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t.compileList.action}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => toggleSelect(project.id)} className="text-slate-400 hover:text-blue-500">
                    {selectedIds.includes(project.id) ? (
                      <CheckSquareOutlined className="w-5 h-5 text-blue-500" />
                    ) : (
                      <BorderOutlined className="w-5 h-5" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {project.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {project.latestVersion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">
                  README.md
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">
                  BUILD.md
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => navigate(`/compile/${project.id}`)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {t.compileList.edit}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center gap-4">
         <button 
            onClick={toggleSelectAll}
            className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
         >
           {selectedIds.length === projects.length && projects.length > 0 ? t.compileList.deselectAll : t.compileList.selectAll}
         </button>
         <button className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900">
           {t.compileList.applySelection}
         </button>
      </div>
    </div>
  );
};

export default CompileList;
