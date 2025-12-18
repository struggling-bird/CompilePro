import React, { useState } from "react";
import { Card, Tabs } from "antd";
import {
  UserOutlined,
  GithubOutlined,
  ApiOutlined,
  ToolOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../contexts/LanguageContext";
import AccountSettings from "./components/AccountSettings";
import GitSettings from "./components/GitSettings";
import SystemCheck from "./components/SystemCheck";
import FileStorageSettings from "./components/FileStorageSettings";
import WorkspaceStats from "./components/WorkspaceStats";
import "./styles/index.less";

const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("account");

  const items = [
    {
      key: "account",
      label: (
        <span>
          <UserOutlined />
          {t.settings.accountSettings}
        </span>
      ),
      children: (
        <div className="h-full overflow-y-auto pr-6">
          <AccountSettings />
        </div>
      ),
    },
    {
      key: "git",
      label: (
        <span>
          <GithubOutlined />
          {t.settings.gitBinding}
        </span>
      ),
      children: (
        <div className="h-full overflow-y-auto pr-6">
          <GitSettings />
        </div>
      ),
    },
    {
      key: "system",
      label: (
        <span>
          <ApiOutlined />
          {t.settings.systemCheck}
        </span>
      ),
      children: (
        <div className="h-full overflow-y-auto pr-6">
          <SystemCheck />
        </div>
      ),
    },
    {
      key: "config",
      label: (
        <span>
          <ToolOutlined />
          {t.settings.systemConfig}
        </span>
      ),
      children: (
        <div className="h-full overflow-y-auto pr-6">
          <FileStorageSettings />
        </div>
      ),
    },
    {
      key: "workspace",
      label: (
        <span>
          <DatabaseOutlined />
          {t.settings.workspaceStats}
        </span>
      ),
      children: (
        <div className="h-full overflow-y-auto pr-6">
          <WorkspaceStats />
        </div>
      ),
    },
  ];

  return (
    <div className="settings-container">
      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          tabPosition="left"
          className={`h-full settings-tabs`}
        />
      </Card>
    </div>
  );
};

export default SettingsPage;
