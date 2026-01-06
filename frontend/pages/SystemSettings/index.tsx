import React, { useState } from "react";
import { Card, Tabs } from "antd";
import {
  GithubOutlined,
  ApiOutlined,
  ToolOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../contexts/LanguageContext";
import GitSettings from "../Settings/components/GitSettings";
import SystemCheck from "../Settings/components/SystemCheck";
import FileStorageSettings from "../Settings/components/FileStorageSettings";
import WorkspaceStats from "../Settings/components/WorkspaceStats";
import styles from "../Settings/styles/Settings.module.less";

const SystemSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("git");

  const items = [
    {
      key: "git",
      label: (
        <span>
          <GithubOutlined />
          {t.settings.gitBinding}
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
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
        <div className={styles.tabContent}>
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
        <div className={styles.tabContent}>
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
        <div className={styles.tabContent}>
          <WorkspaceStats />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card variant="borderless">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          tabPlacement="start"
          className={styles.tabs}
        />
      </Card>
    </div>
  );
};

export default SystemSettingsPage;
