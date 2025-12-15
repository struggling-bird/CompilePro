import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { Customer } from '../../../types';
import { listCustomers, deleteCustomer } from '../../../services/customers';
import CustomerToolbar from '../components/CustomerToolbar';
import CustomerTable from '../components/CustomerTable';

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return customers;
    return customers.filter((c) =>
      [c.name, c.contactPerson, c.email, c.phone].some((f) =>
        (f || '').toLowerCase().includes(k),
      ),
    );
  }, [customers, keyword]);

  const onEdit = (id: string) => navigate(`/customers/${id}`);
  const onDelete = async (id: string) => {
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

  return (
    <div className="flex flex-col h-full">
      <CustomerToolbar keyword={keyword} onKeywordChange={setKeyword} onNew={() => navigate('/customers/new')} />
      <CustomerTable customers={filtered} loading={loading} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

export default CustomerListPage;

