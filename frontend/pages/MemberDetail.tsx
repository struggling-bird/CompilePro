import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { MOCK_TEAM_MEMBERS } from '../constants';
import { TeamMember } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const MemberDetail: React.FC = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const isNew = !memberId;
  const { t } = useLanguage();

  const existingMember = MOCK_TEAM_MEMBERS.find(m => m.id === memberId);

  const [formData, setFormData] = useState<TeamMember>(existingMember || {
    id: `m-${Date.now()}`,
    name: '',
    email: '',
    role: 'Viewer',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log('Saving member:', formData);
    navigate('/members');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <button onClick={() => navigate('/members')} className="flex items-center text-slate-500 hover:text-slate-800">
           <ArrowLeft className="w-5 h-5 mr-2" />
           {t.memberDetail.back}
        </button>
        <h1 className="text-lg font-bold text-slate-800">{isNew ? t.memberDetail.newTitle : t.memberDetail.editTitle}</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
         <div className="bg-white rounded-lg p-6 space-y-8">
            
            {/* Basic Info */}
            <section>
               <h3 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-200">{t.memberDetail.basicInfo}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.memberDetail.name}</label>
                     <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.memberDetail.email}</label>
                     <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.memberDetail.role}</label>
                     <select 
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                     >
                        <option value="Admin">{t.memberDetail.roles.admin}</option>
                        <option value="Developer">{t.memberDetail.roles.developer}</option>
                        <option value="Viewer">{t.memberDetail.roles.viewer}</option>
                     </select>
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.memberDetail.status}</label>
                     <select 
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                     >
                        <option value="Active">{t.memberDetail.statusActive}</option>
                        <option value="Inactive">{t.memberDetail.statusInactive}</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.memberDetail.joinDate}</label>
                     <input 
                        type="date" 
                        name="joinDate"
                        value={formData.joinDate}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
               </div>
            </section>

            <div className="pt-6 flex justify-end space-x-4 border-t border-slate-200">
               <button onClick={() => navigate('/members')} className="px-6 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                  {t.memberDetail.cancel}
               </button>
               <button onClick={handleSave} className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                  <Save className="w-4 h-4 mr-2" /> {t.memberDetail.save}
               </button>
            </div>

         </div>
      </div>
    </div>
  );
};

export default MemberDetail;