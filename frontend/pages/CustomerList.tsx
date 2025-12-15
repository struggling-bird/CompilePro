import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { Customer } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { listCustomers, deleteCustomer } from '../services/customers';
import { message } from 'antd';

const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const list = await listCustomers();
      setCustomers(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);
  const { t } = useLanguage();

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除该客户吗？')) return;
    try {
      await deleteCustomer(id);
      message.success('删除成功');
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '删除失败';
      message.error(msg);
    }
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return customers;
    return customers.filter((c) =>
      [c.name, c.contactPerson, c.email, c.phone].some((f) =>
        (f || '').toLowerCase().includes(k),
      ),
    );
  }, [customers, keyword]);

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
                placeholder={t.customerList.searchPlaceholder}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
             />
           </div>
         </div>
        <div>
          <button 
             onClick={() => navigate('/customers/new')}
             className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center hover:bg-blue-700 transition shadow-sm"
          >
             <PlusOutlined className="w-4 h-4 mr-1.5" />
             {t.customerList.newCustomer}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.customerList.name}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.customerList.contact}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.customerList.phone}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.customerList.email}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t.customerList.status}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t.customerList.action}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
             {filtered.map(customer => (
               <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                     {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     {customer.contactPerson}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     {customer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                     {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                     }`}>
                        {customer.status === 'Active' ? t.customerDetail.statusActive : t.customerDetail.statusInactive}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <button 
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                     >
                        {t.customerList.edit}
                     </button>
                     <button 
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-900"
                     >
                        {t.customerList.delete}
                     </button>
                  </td>
               </tr>
             ))}
             {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                     <TeamOutlined className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                     <p>No customers found.</p>
                  </td>
               </tr>
             )}
             {loading && (
               <tr>
                 <td colSpan={6} className="px-6 py-6 text-center text-slate-500">Loading...</td>
               </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerList;
