import React, { useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { NodeCredential } from "../../../../types";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: Partial<NodeCredential>) => void;
  initialValues?: Partial<NodeCredential>;
  loading?: boolean;
}

const CredentialEditModal: React.FC<Props> = ({
  visible,
  onCancel,
  onOk,
  initialValues,
  loading,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (err) {
      // validation failed
    }
  };

  return (
   <Modal
      title={initialValues?.id ? "Edit Credential" : t.environment.addCredential}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="type"
          label={t.environment.type}
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. root" />
        </Form.Item>
        <Form.Item
          name="username"
          label={t.environment.username}
          rules={[{ required: true, message: t.environment.required }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label={t.environment.password}
          rules={[{ required: true, message: t.environment.required }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item name="description" label={t.environment.description}>
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CredentialEditModal;
