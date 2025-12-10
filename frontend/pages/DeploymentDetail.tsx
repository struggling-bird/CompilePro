import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  MobileOutlined,
  MessageOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { MOCK_DEPLOYMENTS, MOCK_CUSTOMERS } from "../constants";
import { useLanguage } from "../contexts/LanguageContext";

const DeploymentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { deployId } = useParams<{ deployId: string }>();
  const isNew = !deployId;
  const deploy = isNew ? null : MOCK_DEPLOYMENTS.find((d) => d.id === deployId);
  const { t } = useLanguage();

  // State
  const [name, setName] = useState(deploy?.name || "");
  const [customerId, setCustomerId] = useState(deploy?.customerId || "");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <button
          onClick={() => navigate("/manage")}
          className="flex items-center text-slate-500 hover:text-slate-800"
        >
          <ArrowLeftOutlined className="w-5 h-5 mr-2" />
          {t.deploymentDetail.back}
        </button>
        <h1 className="text-lg font-bold text-slate-800">
          {isNew
            ? t.deploymentDetail.newConfig
            : `${t.deploymentDetail.editConfig} ${deploy?.name}`}
        </h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        <div className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.deploymentDetail.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.deploymentDetail.customer}
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">
                  -- {t.deploymentDetail.selectCustomer} --
                </option>
                {MOCK_CUSTOMERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.deploymentDetail.template}
              </label>
              <div className="flex space-x-2">
                <select className="flex-1 border border-slate-300 rounded-md p-2 bg-white">
                  <option>Template A</option>
                  <option>Template B</option>
                </select>
                <select className="flex-1 border border-slate-300 rounded-md p-2 bg-white">
                  <option>{t.deploymentDetail.versionList}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.deploymentDetail.compileType}
              </label>
              <select className="w-full border border-slate-300 rounded-md p-2 bg-white">
                <option>{t.deploymentDetail.privateDeploy}</option>
                <option>{t.deploymentDetail.publicCloud}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t.deploymentDetail.publishMethod}
              </label>
              <div className="flex space-x-6 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="publish"
                    defaultChecked
                    className="mr-2 text-blue-600"
                  />{" "}
                  {t.deploymentDetail.gitPush}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="publish"
                    className="mr-2 text-blue-600"
                  />{" "}
                  {t.deploymentDetail.download}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="publish"
                    className="mr-2 text-blue-600"
                  />{" "}
                  {t.deploymentDetail.auto}
                </label>
              </div>
            </div>
          </div>

          {/* Global Config Table (Mock) */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              {t.deploymentDetail.globalConfig}
            </h3>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      {t.deploymentDetail.name}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      {t.deploymentDetail.val}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      {t.deploymentDetail.desc}
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                      {t.deploymentDetail.editConfig}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200 text-sm">
                  <tr>
                    <td className="px-4 py-2">Domain</td>
                    <td className="px-4 py-2">https://zhugeio.com</td>
                    <td className="px-4 py-2">Analysis Platform Domain</td>
                    <td className="px-4 py-2 text-right">
                      <button className="text-blue-600 hover:underline">
                        {t.deploymentDetail.detail}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Project Specific Config */}
          <div>
            <div className="flex items-center mb-3">
              <h3 className="text-sm font-medium text-slate-700 mr-2">
                {t.deploymentDetail.projectConfig}
              </h3>
              <div className="bg-slate-200 rounded text-xs px-2 py-1">
                webapp-10.0
              </div>
              <div className="ml-1 bg-slate-100 rounded text-xs px-2 py-1 text-slate-500">
                sdkv-12.1
              </div>
            </div>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      {t.deploymentDetail.name}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      {t.deploymentDetail.val}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                      {t.deploymentDetail.desc}
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                      {t.deploymentDetail.editConfig}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200 text-sm">
                  <tr>
                    <td className="px-4 py-2">Domain</td>
                    <td className="px-4 py-2">https://zhugeio.com</td>
                    <td className="px-4 py-2">Analysis Platform Domain</td>
                    <td className="px-4 py-2 text-right">
                      <button className="text-blue-600 hover:underline">
                        {t.deploymentDetail.detail}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">
              {t.deploymentDetail.notification}
            </h3>
            <div className="flex space-x-12">
              <div className="flex flex-col items-center space-y-2 text-slate-500 hover:text-blue-600 cursor-pointer">
                <MobileOutlined className="w-8 h-8" />
                <span className="text-xs">{t.deploymentDetail.push}</span>
              </div>
              <div className="flex flex-col items-center space-y-2 text-slate-500 hover:text-blue-600 cursor-pointer">
                <MessageOutlined className="w-8 h-8" />
                <span className="text-xs">{t.deploymentDetail.sms}</span>
              </div>
              <div className="flex flex-col items-center space-y-2 text-slate-500 hover:text-blue-600 cursor-pointer">
                <MailOutlined className="w-8 h-8" />
                <span className="text-xs">{t.deploymentDetail.wechat}</span>
              </div>
              <div className="flex flex-col items-center space-y-2 text-slate-500 hover:text-blue-600 cursor-pointer">
                <SettingOutlined className="w-8 h-8" />
                <span className="text-xs">{t.deploymentDetail.other}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex items-center space-x-4 border-t border-slate-200">
            <button className="flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              <SaveOutlined className="w-4 h-4 mr-2" />{" "}
              {t.deploymentDetail.saveConfig}
            </button>
            <button
              onClick={() => navigate("/manage")}
              className="flex items-center justify-center px-6 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
            >
              {t.deploymentDetail.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentDetail;
