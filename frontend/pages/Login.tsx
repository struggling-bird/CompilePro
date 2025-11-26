import React, { useState } from 'react';
import { MessageCircle, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('zhuge@zhugeio.com');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);
  const { t, language, setLanguage } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      
      {/* Top right lang switch */}
      <div className="absolute top-4 right-4">
         <button onClick={toggleLanguage} className="flex items-center text-slate-500 hover:text-slate-800">
           <Globe className="w-4 h-4 mr-1" />
           {language === 'en' ? 'EN' : '中文'}
         </button>
      </div>

      <div className="w-full max-w-md px-8 py-12">
        <div className="text-center mb-10">
           {/* Logo Text */}
           <h1 className="text-3xl font-light text-slate-800 mb-2">{t.login.title}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              required
              className="appearance-none rounded relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-slate-50"
              placeholder={t.login.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="appearance-none rounded relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-slate-50"
              placeholder={t.login.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {t.login.loginBtn}
          </button>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-slate-500">
                {t.login.autoLogin}
              </label>
            </div>
            <div className="text-slate-400">
              {t.login.forgotPassword}
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 mt-8">
            {t.login.noAccount} <a href="#" className="text-blue-500 hover:text-blue-600">{t.login.register}</a>
          </div>
        </form>
      </div>

      {/* Floating Chat Bubble */}
      <div className="absolute bottom-10 right-10">
        <button className="bg-blue-500 p-3 rounded-full text-white shadow-lg hover:bg-blue-600 transition">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Login;