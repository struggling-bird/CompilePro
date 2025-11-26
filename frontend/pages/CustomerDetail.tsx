import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { MOCK_CUSTOMERS, MOCK_DEPLOYMENTS } from '../constants';
import { Customer } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const CustomerDetail: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const isNew = !customerId;
  const { t } = useLanguage();

  const existingCustomer = MOCK_CUSTOMERS.find(c => c.id === customerId);

  const [formData, setFormData] = useState<Customer>(existingCustomer || {
    id: `c-${Date.now()}`,
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'Active',
    address: '',
    contractDate: new Date().toISOString().split('T')[0],
    deployments: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log('Saving customer:', formData);
    navigate('/customers');
  };

  const relatedDeployments = MOCK_DEPLOYMENTS.filter(d => formData.deployments.includes(d.id));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <button onClick={() => navigate('/customers')} className="flex items-center text-slate-500 hover:text-slate-800">
           <ArrowLeft className="w-5 h-5 mr-2" />
           {t.customerDetail.back}
        </button>
        <h1 className="text-lg font-bold text-slate-800">{isNew ? t.customerDetail.newTitle : t.customerDetail.editTitle}</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
         <div className="bg-white rounded-lg p-6 space-y-8">
            
            {/* Basic Info */}
            <section>
               <h3 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-200">{t.customerDetail.basicInfo}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.name}</label>
                     <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.status}</label>
                     <select 
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                     >
                        <option value="Active">{t.customerDetail.statusActive}</option>
                        <option value="Inactive">{t.customerDetail.statusInactive}</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.contact}</label>
                     <input 
                        type="text" 
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.phone}</label>
                     <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.email}</label>
                     <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.contractDate}</label>
                     <input 
                        type="date" 
                        name="contractDate"
                        value={formData.contractDate}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.address}</label>
                     <input 
                        type="text" 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                     />
                  </div>
               </div>
            </section>

            {/* Deployments Section */}
            {!isNew && (
               <section>
                  <h3 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-200">{t.customerDetail.deployments}</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-md overflow-hidden">
                     {relatedDeployments.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-200">
                           <thead className="bg-slate-100">
                              <tr>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Deployment Name</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Build Status</th>
                                 <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                              </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-slate-200">
                              {relatedDeployments.map(d => (
                                 <tr key={d.id}>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{d.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{d.type}</td>
                                    <td className="px-6 py-4 text-sm">
                                       <span className={`px-2 py-0.5 rounded text-xs ${d.lastBuildStatus === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                          {d.lastBuildStatus}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right">
                                       <button onClick={() => navigate(`/manage/${d.id}`)} className="text-blue-600 hover:underline">View</button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     ) : (
                        <div className="p-6 text-center text-slate-500 text-sm">No deployments associated yet.</div>
                     )}
                  </div>
               </section>
            )}

            <div className="pt-6 flex justify-end space-x-4 border-t border-slate-200">
               <button onClick={() => navigate('/customers')} className="px-6 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                  {t.customerDetail.cancel}
               </button>
               <button onClick={handleSave} className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                  <Save className="w-4 h-4 mr-2" /> {t.customerDetail.save}
               </button>
            </div>

         </div>
      </div>
    </div>
  );
};

export default CustomerDetail;