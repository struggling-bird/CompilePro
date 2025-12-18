import React, { useState } from "react";
import { Card, Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useLanguage } from "../../contexts/LanguageContext";
import AccountSettings from "./components/AccountSettings";
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
  ];

  return (
    <div className="settings-container">
      <Card variant="borderless">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          tabPlacement="start"
          className={`h-full settings-tabs`}
        />
      </Card>
    </div>
  );
};

export default SettingsPage;
