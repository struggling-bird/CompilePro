import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { MOCK_TEAM_MEMBERS } from '../constants';
import { TeamMember } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const MemberList: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const { t } = useLanguage();

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full">
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
                placeholder={t.memberList.searchPlaceholder}
             />
           </div>
        </div>
        <div>
          <button 
             onClick={() => navigate('/members/new')}
             className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center hover:bg-blue-700 transition shadow-sm"
          >
             <PlusOutlined className="w-4 h-4 mr-1.5" />
             {t.memberList.newMember}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.memberList.name}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.memberList.email}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.memberList.role}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.memberList.status}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.memberList.joinDate}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t.memberList.action}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
             {members.map(member => (
               <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800 flex items-center">
                     <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-3">
                        {member.name.charAt(0).toUpperCase()}
                     </div>
                     {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     <span className={`px-2 py-0.5 rounded text-xs border ${
                        member.role === 'Admin' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        member.role === 'Developer' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                     }`}>
                        {member.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                     }`}>
                        {member.status === 'Active' ? t.memberDetail.statusActive : t.memberDetail.statusInactive}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     {member.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <button 
                        onClick={() => navigate(`/members/${member.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                     >
                        {t.memberList.edit}
                     </button>
                     <button 
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-900"
                     >
                        {t.memberList.delete}
                     </button>
                  </td>
               </tr>
             ))}
             {members.length === 0 && (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <TeamOutlined className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No members found.</p>
                   </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberList;
