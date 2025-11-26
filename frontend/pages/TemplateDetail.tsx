import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { MOCK_TEMPLATES } from '../constants';
import { ProjectTemplate } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const TemplateDetail: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isNew = !templateId;
  const { t } = useLanguage();

  // Load existing or init new
  const existingTemplate = MOCK_TEMPLATES.find(t => t.id === templateId);
  
  const [formData, setFormData] = useState<Partial<ProjectTemplate>>(existingTemplate || {
     name: '',
     type: 'Frontend',
     description: '',
     defaultBuildScripts: ['npm install', 'npm run build'],
     author: 'Admin'
  });

  const [newScript, setNewScript] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddScript = () => {
     if (newScript.trim()) {
        setFormData({
           ...formData,
           defaultBuildScripts: [...(formData.defaultBuildScripts || []), newScript.trim()]
        });
        setNewScript('');
     }
  };

  const handleRemoveScript = (idx: number) => {
     const scripts = [...(formData.defaultBuildScripts || [])];
     scripts.splice(idx, 1);
     setFormData({ ...formData, defaultBuildScripts: scripts });
  };

  const handleSave = () => {
     // In a real app, save to backend
     console.log('Saving template:', formData);
     navigate('/templates');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <button onClick={() => navigate('/templates')} className="flex items-center text-slate-500 hover:text-slate-800">
           <ArrowLeft className="w-5 h-5 mr-2" />
           {t.templateDetail.back}
        </button>
        <h1 className="text-lg font-bold text-slate-800">{isNew ? t.templateDetail.newTitle : t.templateDetail.editTitle}</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
         <div className="bg-white rounded-lg p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.templateDetail.name}</label>
                  <input 
                     type="text" 
                     name="name"
                     value={formData.name}
                     onChange={handleChange}
                     className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t.templateDetail.type}</label>
                  <select 
                     name="type"
                     value={formData.type}
                     onChange={handleChange}
                     className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                  >
                     <option value="Frontend">{t.templateDetail.types.frontend}</option>
                     <option value="Backend">{t.templateDetail.types.backend}</option>
                     <option value="Mobile">{t.templateDetail.types.mobile}</option>
                     <option value="Other">{t.templateDetail.types.other}</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">{t.templateDetail.description}</label>
               <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">{t.templateDetail.buildScripts}</label>
               <div className="bg-slate-50 rounded-md p-4 border border-slate-200">
                  <ul className="space-y-2 mb-4">
                     {formData.defaultBuildScripts?.map((script, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-white px-3 py-2 border border-slate-200 rounded text-sm font-mono text-slate-700">
                           <span>{script}</span>
                           <button onClick={() => handleRemoveScript(idx)} className="text-slate-400 hover:text-red-500">
                              <X className="w-4 h-4" />
                           </button>
                        </li>
                     ))}
                  </ul>
                  <div className="flex gap-2">
                     <input 
                        type="text" 
                        value={newScript}
                        onChange={(e) => setNewScript(e.target.value)}
                        placeholder={t.templateDetail.scriptPlaceholder}
                        className="flex-1 border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddScript()}
                     />
                     <button 
                        onClick={handleAddScript}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300 flex items-center"
                     >
                        <Plus className="w-4 h-4 mr-1" /> {t.templateDetail.addScript}
                     </button>
                  </div>
               </div>
            </div>

            <div className="pt-6 flex justify-end space-x-4 border-t border-slate-200 mt-8">
               <button onClick={() => navigate('/templates')} className="px-6 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                  {t.templateDetail.cancel}
               </button>
               <button onClick={handleSave} className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                  <Save className="w-4 h-4 mr-2" /> {t.templateDetail.save}
               </button>
            </div>

         </div>
      </div>
    </div>
  );
};

export default TemplateDetail;