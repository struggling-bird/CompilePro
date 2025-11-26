import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Filter, X, Clock } from 'lucide-react';
import { MOCK_DEPLOYMENTS, MOCK_CUSTOMERS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const ManageList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Filter States
  const [searchText, setSearchText] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Derived filtered deployments
  const filteredDeployments = MOCK_DEPLOYMENTS.filter(deploy => {
    const matchesName = deploy.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCustomer = filterCustomer ? deploy.customerId === filterCustomer : true;
    const matchesType = filterType ? deploy.type === filterType : true;
    const matchesStatus = filterStatus ? deploy.lastBuildStatus === filterStatus : true;
    
    return matchesName && matchesCustomer && matchesType && matchesStatus;
  });

  const resetFilters = () => {
    setSearchText('');
    setFilterCustomer('');
    setFilterType('');
    setFilterStatus('');
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return '-';
    const customer = MOCK_CUSTOMERS.find(c => c.id === customerId);
    return customer ? customer.name : '-';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Controls: Toolbar & Filter Bar */}
      <div className="border-b border-slate-200 bg-slate-50">
         {/* Action Bar */}
         <div className="px-6 py-4 flex justify-between items-center">
             <button 
                onClick={() => navigate('/manage/new')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
             >
               <Plus className="w-4 h-4 mr-2" />
               {t.manageList.newDeployment}
             </button>
             <div className="flex items-center text-slate-500 text-sm">
                <Filter className="w-4 h-4 mr-2" />
                <span>{filteredDeployments.length} items</span>
             </div>
         </div>

         {/* Filter Bar */}
         <div className="px-6 pb-4 flex flex-wrap gap-4 items-center">
             {/* Name Search */}
             <div className="w-64">
                <input 
                   type="text" 
                   value={searchText}
                   onChange={e => setSearchText(e.target.value)}
                   className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                   placeholder={t.manageList.searchNamePlaceholder}
                />
             </div>

             {/* Customer Filter */}
             <div className="w-48">
                <select 
                   value={filterCustomer}
                   onChange={e => setFilterCustomer(e.target.value)}
                   className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                   <option value="">{t.manageList.allCustomers}</option>
                   {MOCK_CUSTOMERS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                   ))}
                </select>
             </div>

             {/* Type Filter */}
             <div className="w-40">
                <select 
                   value={filterType}
                   onChange={e => setFilterType(e.target.value)}
                   className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                   <option value="">{t.manageList.allTypes}</option>
                   <option value="Private">{t.manageList.types.Private}</option>
                   <option value="Public">{t.manageList.types.Public}</option>
                   <option value="Hybrid">{t.manageList.types.Hybrid}</option>
                </select>
             </div>

             {/* Status Filter */}
             <div className="w-40">
                <select 
                   value={filterStatus}
                   onChange={e => setFilterStatus(e.target.value)}
                   className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
                >
                   <option value="">{t.manageList.allStatuses}</option>
                   <option value="Success">{t.manageList.success}</option>
                   <option value="Failed">{t.manageList.failed}</option>
                   <option value="Idle">{t.manageList.idle}</option>
                </select>
             </div>

             {/* Reset Button */}
             {(searchText || filterCustomer || filterType || filterStatus) && (
                <button 
                   onClick={resetFilters}
                   className="flex items-center text-sm text-slate-500 hover:text-red-500 transition-colors"
                >
                   <X className="w-4 h-4 mr-1" /> {t.manageList.resetBtn}
                </button>
             )}
         </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.manageList.name}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.manageList.customer}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.manageList.type}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.manageList.status}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.manageList.lastBuildTime}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.manageList.builder}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.manageList.action}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredDeployments.map((deploy) => (
              <tr key={deploy.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {deploy.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {getCustomerName(deploy.customerId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    deploy.type === 'Private' ? 'bg-purple-100 text-purple-800' : 
                    deploy.type === 'Public' ? 'bg-green-100 text-green-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t.manageList.types[deploy.type] || deploy.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   {deploy.lastBuildStatus === 'Success' && <span className="text-green-600 font-medium">{t.manageList.success}</span>}
                   {deploy.lastBuildStatus === 'Failed' && <span className="text-red-600 font-medium">{t.manageList.failed}</span>}
                   {deploy.lastBuildStatus === 'Idle' && <span className="text-slate-400">{t.manageList.idle}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {deploy.lastBuildTime}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {deploy.lastBuilder}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button 
                     onClick={() => navigate(`/build/${deploy.id}`)}
                     className="text-blue-600 hover:text-blue-900 flex-inline flex items-center"
                     title={t.manageList.build}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                     onClick={() => navigate(`/manage/${deploy.id}/history`)}
                     className="text-slate-600 hover:text-blue-600 flex-inline flex items-center"
                     title={t.manageList.history}
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                  <button 
                     onClick={() => navigate(`/manage/${deploy.id}`)}
                     className="text-slate-600 hover:text-slate-900"
                  >
                    {t.manageList.edit}
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    {t.manageList.delete}
                  </button>
                </td>
              </tr>
            ))}
            {filteredDeployments.length === 0 && (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No deployments found matching your filters.
                   </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageList;