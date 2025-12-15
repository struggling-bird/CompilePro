import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Customer } from '../../../types';
import { getCustomer, createCustomer, updateCustomer } from '../../../services/customers';
import { message } from 'antd';

const CustomerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const isNew = !customerId;
  const { t } = useLanguage();

  const [formData, setFormData] = useState<Customer>({
    id: `c-${Date.now()}`,
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    status: 'Active',
    address: '',
    contractDate: new Date().toISOString().split('T')[0],
    deployments: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!customerId) return;
      try {
        setLoading(true);
        const data = await getCustomer(customerId);
        setFormData(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : '加载失败';
        message.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [customerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (isNew) {
        await createCustomer({
          name: formData.name,
          status: formData.status,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          email: formData.email,
          contractDate: formData.contractDate,
          address: formData.address,
        });
        message.success('创建成功');
        navigate('/customers');
      } else {
        await updateCustomer(customerId!, {
          name: formData.name,
          status: formData.status,
          contactPerson: formData.contactPerson,
          phone: formData.phone,
          email: formData.email,
          contractDate: formData.contractDate,
          address: formData.address,
        });
        message.success('保存成功');
        navigate('/customers');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '保存失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <button onClick={() => navigate('/customers')} className="flex items-center text-slate-500 hover:text-slate-800">
          <ArrowLeftOutlined className="w-5 h-5 mr-2" />
          {t.customerDetail.back}
        </button>
        <h1 className="text-lg font-bold text-slate-800">{isNew ? t.customerDetail.newTitle : t.customerDetail.editTitle}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-lg p-6 space-y-8">
          <section>
            <h3 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-200">{t.customerDetail.basicInfo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.name}</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.status}</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500">
                  <option value="Active">{t.customerDetail.statusActive}</option>
                  <option value="Inactive">{t.customerDetail.statusInactive}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.contact}</label>
                <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.phone}</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.email}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.contractDate}</label>
                <input type="date" name="contractDate" value={formData.contractDate} onChange={handleChange} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.customerDetail.address}</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </section>

          <div className="pt-6 flex justify-end space-x-4 border-t border-slate-200">
            <button onClick={() => navigate('/customers')} className="px-6 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">{t.customerDetail.cancel}</button>
            <button onClick={handleSave} className="flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              <SaveOutlined className="w-4 h-4 mr-2" /> {t.customerDetail.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;

