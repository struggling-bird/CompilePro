import React, { useState } from "react";
import { SaveOutlined, GithubOutlined, UserOutlined } from "@ant-design/icons";
import { useLanguage } from "../contexts/LanguageContext";
import { Tabs, Form, Input, Button, Card, Row, Col } from "antd";

const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("account");
  const [accountForm] = Form.useForm();
  const [gitForm] = Form.useForm();

  const handleAccountSave = (values: any) => {
    console.log("Saving account settings:", values);
    alert("Account settings saved successfully!");
  };

  const handleGitSave = (values: any) => {
    console.log("Saving git settings:", values);
    alert("Git settings saved successfully!");
  };

  const AccountSettings = () => (
    <Form
      form={accountForm}
      layout="vertical"
      onFinish={handleAccountSave}
      initialValues={{
        username: "zhuge",
        email: "zhuge@zhugeio.com",
      }}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="username"
            label={t.settings.username}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            label={t.settings.email}
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="password" label={t.settings.password}>
            <Input.Password />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="confirmPassword" label={t.settings.confirmPassword}>
            <Input.Password />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item className="flex justify-end">
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
          {t.settings.saveAll}
        </Button>
      </Form.Item>
    </Form>
  );

  const GitSettings = () => (
    <Form
      form={gitForm}
      layout="vertical"
      onFinish={handleGitSave}
      initialValues={{
        gitUsername: "zhuge-git",
        pushEmail: true,
      }}
    >
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="gitUsername"
            label={t.settings.gitUsername}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="gitToken" label={t.settings.token}>
            <Input.Password />
          </Form.Item>
          <div className="text-right">
            <a href="#" className="text-xs text-blue-600">
              {t.settings.howToGetToken}
            </a>
          </div>
        </Col>
        <Col span={24}>
          <Form.Item name="sshKey" label={t.settings.sshKey}>
            <Input.TextArea rows={4} placeholder="ssh-rsa AAAAB3Nza..." />
          </Form.Item>
          <div className="text-right">
            <Button type="link" size="small">
              {t.settings.copyKey}
            </Button>
          </div>
        </Col>
      </Row>
      <Form.Item className="flex justify-end">
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
          {t.settings.saveAll}
        </Button>
      </Form.Item>
    </Form>
  );

  const items = [
    {
      key: "account",
      label: (
        <span>
          <UserOutlined />
          {t.settings.accountSettings}
        </span>
      ),
      children: <AccountSettings />,
    },
    {
      key: "git",
      label: (
        <span>
          <GithubOutlined />
          {t.settings.gitBinding}
        </span>
      ),
      children: <GitSettings />,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6">
      <Card bordered={false} className="w-full h-full shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          tabPosition="left"
          className="h-full"
        />
      </Card>
    </div>
  );
};

export default SettingsPage;
