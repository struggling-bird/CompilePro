import React from "react";
import { Modal, Form, Input, Radio, Select } from "antd";
import { TagOutlined, BranchesOutlined } from "@ant-design/icons";
import { Project } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddVersionModalProps {
  visible: boolean;
  project: Project;
  onCancel: () => void;
  onAdd: (values: {
    name: string;
    type: "tag" | "branch";
    source: string;
  }) => void;
}

const AddVersionModal: React.FC<AddVersionModalProps> = ({
  visible,
  project,
  onCancel,
  onAdd,
}) => {
  const [form] = Form.useForm();
  const { t } = useLanguage();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onAdd(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={t.projectDetail.addVersionTitle}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText={t.projectDetail.save}
      cancelText={t.projectDetail.cancel}
    >
      <Form form={form} layout="vertical" initialValues={{ type: "tag" }}>
        <Form.Item
          name="name"
          label={t.projectDetail.versionNo}
          rules={[{ required: true, message: "Please input version name!" }]}
        >
          <Input placeholder="e.g. 1.2.0 or feature-login" />
        </Form.Item>
        <Form.Item name="type" label={t.projectDetail.versionType}>
          <Radio.Group>
            <Radio.Button value="tag">
              <TagOutlined /> {t.projectDetail.tag}
            </Radio.Button>
            <Radio.Button value="branch">
              <BranchesOutlined /> {t.projectDetail.branch}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="source"
          label={t.projectDetail.source}
          rules={[{ required: true, message: "Please select source version!" }]}
        >
          <Select
            placeholder="-- Select Source --"
            options={project.versions.map((v) => ({
              label: v.version,
              value: v.version,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddVersionModal;
