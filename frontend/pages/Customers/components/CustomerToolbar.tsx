import React from 'react';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';

type Props = {
  keyword: string;
  onKeywordChange: (v: string) => void;
  onNew: () => void;
};

const CustomerToolbar: React.FC<Props> = ({ keyword, onKeywordChange, onNew }) => {
  const { t } = useLanguage();
  return (
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
            onChange={(e) => onKeywordChange(e.target.value)}
          />
        </div>
      </div>
      <div>
        <button
          onClick={onNew}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center hover:bg-blue-700 transition shadow-sm"
       >
          <PlusOutlined className="w-4 h-4 mr-1.5" />
          {t.customerList.newCustomer}
        </button>
      </div>
    </div>
  );
};

export default CustomerToolbar;

