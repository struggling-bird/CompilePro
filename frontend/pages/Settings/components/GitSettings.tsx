import React from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';

const GitSettings: React.FC = () => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log('Saving git settings:', values);
    alert('Git settings saved successfully!');
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      initialValues={{
        gitUsername: 'zhuge-git',
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
};

export default GitSettings;
