import React, { useState } from "react";
import { Form, Input, Button, Row, Col, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { updateAccount } from "../../../services/users";
import { getCurrentUser } from "../../../services/auth";

const AccountSettings: React.FC = () => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        const me = await getCurrentUser();
        form.setFieldsValue({
          username: me.username,
          email: me.email,
        });
      } catch (err) {}
    };
    load();
  }, []);

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      await updateAccount(values);
      message.success(t.common?.saved ?? "保存成功");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存失败";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSave}>
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
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={loading}
        >
          {t.settings.saveAll}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AccountSettings;
