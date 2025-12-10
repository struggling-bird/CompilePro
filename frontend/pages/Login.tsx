import React, { useState } from 'react';
import { MessageCircle, Globe, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('zhuge@zhugeio.com');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-900 skew-y-3 transform -translate-y-16 z-0"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-20">
         <button onClick={toggleLanguage} className="flex items-center text-slate-300 hover:text-white transition-colors text-sm font-medium border border-white/10 rounded-full px-3 py-1 bg-white/5 backdrop-blur-sm">
           <Globe className="w-4 h-4 mr-1.5" />
           {language === 'en' ? 'EN' : '中文'}
         </button>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
             Z
           </div>
           <h1 className="text-2xl font-bold text-slate-800">{t.login.title}</h1>
           <p className="text-slate-500 text-sm mt-2">Welcome back, please login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t.login.emailPlaceholder}</label>
                <input
                type="email"
                required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t.login.passwordPlaceholder}</label>
                <input
                type="password"
                required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer group">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <span className="ml-2 block text-slate-500 group-hover:text-slate-700 transition-colors">
                {t.login.autoLogin}
              </span>
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              {t.login.forgotPassword}
            </a>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {t.login.loginBtn}
          </button>

          <div className="text-center text-sm text-slate-500 mt-6 pt-6 border-t border-slate-100">
            {t.login.noAccount} 
            <button 
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-700 font-semibold ml-1 hover:underline transition-all"
            >
                {t.login.register}
            </button>
          </div>
        </form>
      </div>

      {/* Floating Chat Bubble */}
      <div className="absolute bottom-8 right-8 z-20">
        <button className="bg-white p-3.5 rounded-full text-blue-600 shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all transform hover:scale-110">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Login;