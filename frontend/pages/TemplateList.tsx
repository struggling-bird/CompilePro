import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, LayoutTemplate } from 'lucide-react';
import { MOCK_TEMPLATES } from '../constants';
import { ProjectTemplate } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const TemplateList: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ProjectTemplate[]>(MOCK_TEMPLATES);
  const { t } = useLanguage();

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-4">
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
             </div>
             <input 
                type="text" 
                className="block w-64 pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder={t.templateList.searchPlaceholder}
             />
           </div>
        </div>
        <div>
          <button 
             onClick={() => navigate('/templates/new')}
             className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center hover:bg-blue-700 transition shadow-sm"
          >
             <Plus className="w-4 h-4 mr-1.5" />
             {t.templateList.newTemplate}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-white">
        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
             <LayoutTemplate className="w-12 h-12 mb-2" />
             <p>No templates found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {templates.map(template => (
               <div key={template.id} className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow group relative bg-white">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="text-lg font-bold text-slate-800">{template.name}</h3>
                     <span className={`px-2 py-0.5 text-xs rounded-full border ${
                        template.type === 'Frontend' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                        template.type === 'Backend' ? 'bg-green-50 text-green-600 border-green-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                     }`}>
                        {template.type}
                     </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center text-xs text-slate-400 mb-4 space-x-4">
                     <span>{template.createdDate}</span>
                     <span>{template.author}</span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-end space-x-2">
                     <button 
                        onClick={() => navigate(`/templates/${template.id}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                     >
                        <Edit className="w-4 h-4" />
                     </button>
                     <button 
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateList;