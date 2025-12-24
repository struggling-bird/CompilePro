import React, { useState } from "react";
import { Card, Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useLanguage } from "../../contexts/LanguageContext";
import AccountSettings from "./components/AccountSettings";
import styles from "./styles/Settings.module.less";

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
        <div className={styles.tabContent}>
          <AccountSettings />
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

export default SettingsPage;
