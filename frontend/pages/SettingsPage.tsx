import React, { useState } from 'react';
import { Save, Github, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: 'zhuge',
    password: '',
    confirmPassword: '',
    email: 'zhuge@zhugeio.com',
    gitUsername: 'zhuge-git',
    gitToken: '',
    sshKey: '',
    pushEmail: true,
    pushSms: false,
    pushWechat: false,
  });
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Handle checkbox vs text input
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', formData);
    // In a real app, this would make an API call
    alert('Settings saved successfully!');
  };

  return (
    <div className="flex flex-col h-full">
       <div className="px-6 py-4 border-b border-slate-200">
         <h1 className="text-lg font-bold text-slate-800">{t.settings.title}</h1>
       </div>

       <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
          <div className="space-y-12">
             
             {/* Account Settings */}
             <section>
                <h2 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-200">{t.settings.accountSettings}</h2>
                <div className="space-y-4">
                   <div className="grid grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-slate-700 text-right">{t.settings.username}:</label>
                      <input 
                        type="text" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="col-span-2 border border-slate-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500" 
                      />
                   </div>
                   <div className="grid grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-slate-700 text-right">{t.settings.password}:</label>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="col-span-2 border border-slate-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500" 
                      />
                   </div>
                   <div className="grid grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-slate-700 text-right">{t.settings.confirmPassword}:</label>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="col-span-2 border border-slate-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500" 
                      />
                   </div>
                   <div className="grid grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-slate-700 text-right">{t.settings.email}:</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="col-span-2 border border-slate-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500" 
                      />
                   </div>
                </div>
             </section>

             {/* Git Binding */}
             <section>
                <h2 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center">
                   <Github className="w-5 h-5 mr-2" /> {t.settings.gitBinding}
                </h2>
                <div className="space-y-4">
                   <div className="grid grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-slate-700 text-right">{t.settings.gitUsername}:</label>
                      <input 
                        type="text" 
                        name="gitUsername"
                        value={formData.gitUsername}
                        onChange={handleChange}
                        className="col-span-2 border border-slate-300 rounded-md p-2 w-full focus:ring-blue-500 focus:border-blue-500" 
                      />
                   </div>
                   <div className="grid grid-cols-3 gap-4 items-center">
                      <label className="text-sm font-medium text-slate-700 text-right">{t.settings.token}:</label>
                      <div className="col-span-2 flex items-center">
                         <input 
                            type="password" 
                            name="gitToken"
                            value={formData.gitToken}
                            onChange={handleChange}
                            className="border border-slate-300 rounded-md p-2 w-full mr-2 focus:ring-blue-500 focus:border-blue-500" 
                         />
                         <a href="#" className="text-xs text-blue-500 hover:underline whitespace-nowrap">{t.settings.howToGetToken}</a>
                      </div>
                   </div>
                   <div className="grid grid-cols-3 gap-4 items-start">
                      <label className="text-sm font-medium text-slate-700 text-right mt-2">{t.settings.sshKey}:</label>
                      <div className="col-span-2">
                         <textarea 
                            name="sshKey"
                            value={formData.sshKey}
                            onChange={handleChange}
                            className="border border-slate-300 rounded-md p-2 w-full h-24 font-mono text-xs focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="ssh-rsa AAAAB3Nza..."
                         ></textarea>
                         <div className="text-right mt-1">
                           <button className="text-xs text-blue-500 hover:underline">{t.settings.copyKey}</button>
                         </div>
                      </div>
                   </div>
                </div>
             </section>

             {/* Push Settings */}
             <section>
                <h2 className="text-lg font-medium text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center">
                   <Bell className="w-5 h-5 mr-2" /> {t.settings.pushSettings}
                </h2>
                <div className="space-y-4 pl-4">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        name="pushEmail"
                        checked={formData.pushEmail}
                        onChange={handleChange}
                        id="pushEmail"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="pushEmail" className="text-sm text-slate-700">{t.settings.enableEmail}</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        name="pushSms"
                        checked={formData.pushSms}
                        onChange={handleChange}
                        id="pushSms"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="pushSms" className="text-sm text-slate-700">{t.settings.enableSms}</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        name="pushWechat"
                        checked={formData.pushWechat}
                        onChange={handleChange}
                        id="pushWechat"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="pushWechat" className="text-sm text-slate-700">{t.settings.enableWechat}</label>
                    </div>
                </div>
             </section>

             <div className="flex justify-end pt-6">
                <button 
                  onClick={handleSave}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 font-medium transition-colors"
                >
                   <Save className="w-4 h-4 mr-2" /> {t.settings.saveAll}
                </button>
             </div>

          </div>
       </div>
    </div>
  );
};

export default SettingsPage;