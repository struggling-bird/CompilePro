import React from "react";
import { Modal, Form, Input } from "antd";
import { useLanguage } from "../../../contexts/LanguageContext";

interface DisableModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (values: { reason: string }) => void;
}

const DisableModal: React.FC<DisableModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onConfirm(values);
      form.resetFields();
    } catch (e) {
      // Validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t.templateDetail.disableVersionTitle}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t.templateDetail.confirm}
      cancelText={t.templateDetail.cancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label={t.templateDetail.reason}
          rules={[
            { required: true, message: t.templateDetail.inputReason },
            {
              min: 10,
              message: t.templateDetail.reasonLength,
            },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder={t.templateDetail.reasonPlaceholder}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DisableModal;
