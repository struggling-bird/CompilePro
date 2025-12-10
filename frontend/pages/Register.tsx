import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalOutlined, UserAddOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useLanguage } from "../contexts/LanguageContext";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration logic
    console.log("Registering:", formData);
    navigate("/login");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-slate-900 skew-y-3 transform -translate-y-16 z-0"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-20 flex items-center space-x-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center text-slate-300 hover:text-white transition-colors text-sm font-medium"
        >
          <GlobalOutlined className="w-4 h-4 mr-1.5" />
          {language === "en" ? "EN" : "中文"}
        </button>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl relative z-10 mx-4">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
            Z
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t.register.title}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Join ZhugeIO Deployment Manager
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.register.emailPlaceholder}
              </label>
              <input
                type="email"
                name="email"
                required
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {t.register.usernamePlaceholder}
              </label>
              <input
                type="text"
                name="username"
                required
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="zhuge"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t.register.passwordPlaceholder}
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                  {t.register.confirmPasswordPlaceholder}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <UserAddOutlined className="w-4 h-4 mr-2" />
            {t.register.registerBtn}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm text-slate-500 hover:text-blue-600 font-medium flex items-center justify-center mx-auto transition-colors"
            >
              <ArrowLeftOutlined className="w-4 h-4 mr-1" /> {t.register.hasAccount}{" "}
              <span className="ml-1 text-blue-600">{t.register.login}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
