import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Space,
  Typography,
  Modal,
  message,
} from "antd";
import { SaveOutlined, ReloadOutlined, ToolOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  checkGit,
  installGitGuide,
  saveGitSettings,
} from "../../../services/system";

const { Text } = Typography;

const GitSettings: React.FC = () => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [gitInstalled, setGitInstalled] = useState<boolean | null>(null);
  const [gitVersion, setGitVersion] = useState<string | undefined>(undefined);

  const handleCheck = async () => {
    try {
      setChecking(true);
      const res = await checkGit();
      setGitInstalled(res.installed);
      setGitVersion(res.version);
      if (res.installed) message.success(t.settings.installed);
      else message.warning(t.settings.notInstalled);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "检测失败";
      message.error(msg);
    } finally {
      setChecking(false);
    }
  };

  const handleInstall = async () => {
    try {
      setInstalling(true);
      const guide = await installGitGuide();
      Modal.info({
        title: `${t.settings.install} Git`,
        content: (
          <div>
            <div className="mb-2 text-sm text-slate-500">{guide.os}</div>
            <div className="bg-slate-50 border border-slate-200 rounded p-2 text-sm">
              {guide.instructions.map((cmd, idx) => (
                <div key={idx}>
                  <code>{cmd}</code>
                </div>
              ))}
            </div>
          </div>
        ),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "获取安装指引失败";
      message.error(msg);
    } finally {
      setInstalling(false);
    }
  };

  const handleSave = async (values: any) => {
    await saveGitSettings({
      gitName: values.gitName,
      apiEndpoint: values.apiEndpoint,
      accessToken: values.accessToken,
    });
    message.success(t.settings.saveAll);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-3">
          <ToolOutlined className="text-slate-600" />
          <Text strong>Git</Text>
          {gitInstalled === true && (
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm text-slate-600">
                Git <Text code>{gitVersion}</Text>
              </span>
            </div>
          )}
          {gitInstalled === false && (
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-sm text-red-600">
                {t.settings.notInstalled}，{t.settings.install} Git
              </span>
            </div>
          )}
          <ReloadOutlined
            onClick={checking ? undefined : handleCheck}
            title={
              gitInstalled === null
                ? t.settings.checkEnvironment
                : t.settings.recheck
            }
            className={`ml-2 cursor-pointer ${
              checking
                ? "opacity-50 cursor-not-allowed animate-spin"
                : "text-slate-600 hover:text-slate-800"
            }`}
          />
        </div>
        <Space size="small">
          {gitInstalled === false && (
            <Button
              type="primary"
              size="small"
              loading={installing}
              onClick={handleInstall}
            >
              {t.settings.install} Git
            </Button>
          )}
        </Space>
      </div>
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="gitName"
              label={t.settings.gitName}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="apiEndpoint"
              label={t.settings.apiEndpoint}
              rules={[{ required: true, type: "url" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="accessToken"
              label={t.settings.accessToken}
              rules={[{ required: true }]}
            >
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
    </div>
  );
};

export default GitSettings;
