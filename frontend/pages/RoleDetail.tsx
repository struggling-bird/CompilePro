import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { MOCK_ROLES, MOCK_PERMISSIONS } from '../constants';
import { Role, Permission } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const RoleDetail: React.FC = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const isNew = !roleId;
  const { t } = useLanguage();

  const existingRole = MOCK_ROLES.find(r => r.id === roleId);

  const [formData, setFormData] = useState<Role>(existingRole || {
    id: `r-${Date.now()}`,
    name: '',
    description: '',
    permissions: [],
    isSystem: false
  });

  // Group permissions by category
  const groupedPermissions = MOCK_PERMISSIONS.reduce((acc, perm) => {
    const group = perm.group;
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePermission = (permId: string) => {
    if (formData.permissions.includes(permId)) {
      setFormData({ ...formData, permissions: formData.permissions.filter(id => id !== permId) });
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, permId] });
    }
  };

  const toggleGroup = (groupName: string, permissions: Permission[]) => {
    const allIds = permissions.map(p => p.id);
    const allSelected = allIds.every(id => formData.permissions.includes(id));

    if (allSelected) {
      // Deselect all
      setFormData({ ...formData, permissions: formData.permissions.filter(id => !allIds.includes(id)) });
    } else {
      // Select all
      const newIds = allIds.filter(id => !formData.permissions.includes(id));
      setFormData({ ...formData, permissions: [...formData.permissions, ...newIds] });
    }
  };

  const handleSave = () => {
    console.log('Saving role:', formData);
    navigate('/roles');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <button onClick={() => navigate('/roles')} className="flex items-center text-slate-500 hover:text-slate-800">
           <ArrowLeftOutlined className="w-5 h-5 mr-2" />
           {t.roleDetail.back}
        </button>
        <h1 className="text-lg font-bold text-slate-800">{isNew ? t.roleDetail.newTitle : t.roleDetail.editTitle}</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
         <div className="bg-white rounded-lg p-6 space-y-8">
            
            {/* Basic Info */}
            <section>
               <h3 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-200">{t.roleDetail.basicInfo}</h3>
               <div className="grid grid-cols-1 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.roleDetail.name}</label>
                     <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={formData.isSystem} // Prevent renaming system roles
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.roleDetail.description}</label>
                     <textarea 
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
               </div>
            </section>

            {/* Permissions */}
            <section>
               <h3 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-200 flex justify-between items-center">
                  {t.roleDetail.permissions}
                  <div className="text-xs font-normal text-slate-500">
                     {formData.permissions.length} selected
                  </div>
               </h3>
               
               <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([group, permissions]) => {
                     const allSelected = permissions.every(p => formData.permissions.includes(p.id));
                     
                     return (
                        <div key={group} className="border border-slate-200 rounded-md overflow-hidden">
                           <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                              <h4 className="font-bold text-slate-700">{group}</h4>
                              <button 
                                 onClick={() => toggleGroup(group, permissions)}
                                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                 {allSelected ? t.roleDetail.deselectAll : t.roleDetail.selectAll}
                              </button>
                           </div>
                           <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {permissions.map(perm => (
                                 <div key={perm.id} className="flex items-start">
                                    <div className="flex items-center h-5">
                                       <input
                                          id={`perm-${perm.id}`}
                                          type="checkbox"
                                          checked={formData.permissions.includes(perm.id)}
                                          onChange={() => togglePermission(perm.id)}
                                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                       />
                                    </div>
                                    <div className="ml-3 text-sm">
                                       <label htmlFor={`perm-${perm.id}`} className="font-medium text-slate-700 cursor-pointer">
                                          {perm.name}
                                       </label>
                                       <p className="text-slate-500 text-xs mt-0.5">{perm.description}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </section>

            <div className="pt-6 flex justify-end space-x-4 border-t border-slate-200">
               <button onClick={() => navigate('/roles')} className="px-6 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                  {t.roleDetail.cancel}
               </button>
               <button onClick={handleSave} className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                  <SaveOutlined className="w-4 h-4 mr-2" /> {t.roleDetail.save}
               </button>
            </div>

         </div>
      </div>
    </div>
  );
};

export default RoleDetail;
