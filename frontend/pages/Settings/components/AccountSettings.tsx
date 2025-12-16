import React from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';

const AccountSettings: React.FC = () => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log('Saving account settings:', values);
    alert('Account settings saved successfully!');
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      initialValues={{
        username: 'zhuge',
        email: 'zhuge@zhugeio.com',
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
            rules={[{ required: true, type: 'email' }]}
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
};

export default AccountSettings;
