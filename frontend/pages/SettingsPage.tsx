import React, { useState } from "react";
import { SaveOutlined, GithubOutlined } from "@ant-design/icons";
import { useLanguage } from "../contexts/LanguageContext";

const SettingsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "zhuge",
    password: "",
    confirmPassword: "",
    email: "zhuge@zhugeio.com",
    gitUsername: "zhuge-git",
    gitToken: "",
    sshKey: "",
  });
  const { t } = useLanguage();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    // Handle checkbox vs text input
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSave = () => {
    console.log("Saving settings:", formData);
    // In a real app, this would make an API call
    alert("Settings saved successfully!");
  };

  return (
    <div className="flex flex-col h-full bg-white  overflow-y-auto">
      {/* Removed top header to align with main layout glass header */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="space-y-12">
          {/* Account Settings */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
              {t.settings.accountSettings}
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <label className="text-sm font-medium text-slate-500 md:text-right">
                  {t.settings.username}
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="md:col-span-3 border border-slate-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <label className="text-sm font-medium text-slate-500 md:text-right">
                  {t.settings.password}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="md:col-span-3 border border-slate-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <label className="text-sm font-medium text-slate-500 md:text-right">
                  {t.settings.confirmPassword}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="md:col-span-3 border border-slate-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <label className="text-sm font-medium text-slate-500 md:text-right">
                  {t.settings.email}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="md:col-span-3 border border-slate-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Git Binding */}
          <section>
            <h2 className="text-lg font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 flex items-center">
              <GithubOutlined className="w-5 h-5 mr-2 text-slate-700" />{" "}
              {t.settings.gitBinding}
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <label className="text-sm font-medium text-slate-500 md:text-right">
                  {t.settings.gitUsername}
                </label>
                <input
                  type="text"
                  name="gitUsername"
                  value={formData.gitUsername}
                  onChange={handleChange}
                  className="md:col-span-3 border border-slate-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <label className="text-sm font-medium text-slate-500 md:text-right">
                  {t.settings.token}
                </label>
                <div className="md:col-span-3 flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="password"
                    name="gitToken"
                    value={formData.gitToken}
                    onChange={handleChange}
                    className="border border-slate-300 rounded-lg p-2.5 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                  <a
                    href="#"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline whitespace-nowrap px-1"
                  >
                    {t.settings.howToGetToken}
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <label className="text-sm font-medium text-slate-500 md:text-right mt-2">
                  {t.settings.sshKey}
                </label>
                <div className="md:col-span-3">
                  <textarea
                    name="sshKey"
                    value={formData.sshKey}
                    onChange={handleChange}
                    className="border border-slate-300 rounded-lg p-3 w-full h-32 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y"
                    placeholder="ssh-rsa AAAAB3Nza..."
                  ></textarea>
                  <div className="text-right mt-2">
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                      {t.settings.copyKey}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Push Settings Removed */}

          <div className="flex justify-end pt-8 pb-12">
            <button
              onClick={handleSave}
              className="flex items-center px-8 py-2.5 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <SaveOutlined className="w-4 h-4 mr-2" /> {t.settings.saveAll}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
