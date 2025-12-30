import React from 'react';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Input, Button } from 'antd';

type Props = {
  keyword: string;
  onKeywordChange: (v: string) => void;
  onNew: () => void;
};

const CustomerToolbar: React.FC<Props> = ({ keyword, onKeywordChange, onNew }) => {
  const { t } = useLanguage();
  return (
    <div style={{ 
      padding: '16px 24px', 
      marginBottom: 16, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      background: '#fff',
      borderRadius: 8
    }}>
      <Input
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        placeholder={t.customerList.searchPlaceholder}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        style={{ width: 280 }}
        allowClear
      />
      <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
        {t.customerList.newCustomer}
      </Button>
    </div>
  );
};

export default CustomerToolbar;

