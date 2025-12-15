import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { EnvironmentNode } from "../../../../types";

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: Partial<EnvironmentNode>) => void;
  initialValues?: Partial<EnvironmentNode>;
  loading?: boolean;
}

const NodeModal: React.FC<Props> = ({
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
      } else {
        form.setFieldsValue({ credentials: [] });
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
      title={initialValues?.id ? t.environment.editNode : t.environment.addNode}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      width={800}
      okText={t.environment.save}
      cancelText={t.environment.cancel}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="ip"
            label={t.environment.ip}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="host"
            label={t.environment.host}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="domain" label={t.environment.domain}>
            <Input />
          </Form.Item>
          <Form.Item
            name="os"
            label={t.environment.os}
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. Ubuntu 22.04" />
          </Form.Item>
          <Form.Item
            name="chip"
            label={t.environment.chip}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "x86", value: "x86" },
                { label: "ARM", value: "ARM" },
                { label: "M-Series", value: "M1/M2/M3" },
                { label: "Other", value: "Other" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="cpu"
            label={t.environment.cpu}
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. 16 cores" />
          </Form.Item>
          <Form.Item
            name="memory"
            label={t.environment.memory}
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. 64GB" />
          </Form.Item>
          <Form.Item
            name="diskType"
            label={t.environment.diskType}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "HDD", value: "HDD" },
                { label: "SSD", value: "SSD" },
                { label: "NVMe", value: "NVMe" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="diskSize"
            label={t.environment.diskSize}
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. 500GB" />
          </Form.Item>
        </div>
        <Form.Item name="remark" label={t.environment.remark}>
          <Input.TextArea />
        </Form.Item>

        <Form.List name="credentials">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "type"]}
                    rules={[
                      { required: true, message: t.environment.required },
                    ]}
                  >
                    <Input placeholder={t.environment.type + " (e.g. root)"} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "username"]}
                    rules={[
                      { required: true, message: t.environment.required },
                    ]}
                  >
                    <Input placeholder={t.environment.username} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "password"]}
                    rules={[
                      { required: true, message: t.environment.required },
                    ]}
                  >
                    <Input.Password placeholder={t.environment.password} />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "description"]}>
                    <Input placeholder={t.environment.description} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  {t.environment.addCredential}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default NodeModal;
