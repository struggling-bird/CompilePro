import React from "react";
import { Modal, Form, Input } from "antd";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateProjectModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreate: (values: { name: string; version: string }) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onCancel,
  onCreate,
}) => {
  const [form] = Form.useForm();
  const { t } = useLanguage();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onCreate(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={t.projectList.createProjectTitle}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={t.projectList.createBtn}
      cancelText={t.projectDetail.cancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t.projectList.projectName}
          rules={[{ required: true, message: "Please input project name!" }]}
        >
          <Input placeholder={t.projectList.projectPlaceholder} />
        </Form.Item>
        <Form.Item
          name="version"
          label={t.projectList.initialVersion}
          rules={[{ required: true, message: "Please input initial version!" }]}
        >
          <Input placeholder={t.projectList.versionPlaceholder} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;
