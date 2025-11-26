import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Shield, ShieldCheck, Trash2, Edit } from 'lucide-react';
import { MOCK_ROLES } from '../constants';
import { Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const RoleList: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const { t } = useLanguage();

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== id));
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
                placeholder={t.roleList.searchPlaceholder}
             />
           </div>
        </div>
        <div>
          <button 
             onClick={() => navigate('/roles/new')}
             className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center hover:bg-blue-700 transition shadow-sm"
          >
             <Plus className="w-4 h-4 mr-1.5" />
             {t.roleList.newRole}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.roleList.name}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.roleList.description}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.roleList.permissions}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t.roleList.action}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
             {roles.map(role => (
               <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 flex items-center">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${role.isSystem ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {role.isSystem ? <Shield className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                     </div>
                     {role.name}
                     {role.isSystem && <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded border border-slate-200">{t.roleList.systemRole}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     {role.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-500">
                        {role.permissions.length} permissions
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <button 
                        onClick={() => navigate(`/roles/${role.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                     >
                        <Edit className="w-4 h-4" />
                     </button>
                     {!role.isSystem && (
                        <button 
                           onClick={() => handleDelete(role.id)}
                           className="text-red-600 hover:text-red-900"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     )}
                  </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleList;