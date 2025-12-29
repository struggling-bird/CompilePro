import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Switch, Radio } from "antd";
import { TemplateGlobalConfig, TemplateModuleConfig } from "../../../../types";

import { useLanguage } from "../../../../contexts/LanguageContext";

interface ConfigFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
  initialValues?: Partial<TemplateGlobalConfig | TemplateModuleConfig>;
  mode: "GLOBAL" | "MODULE";
  globalConfigs?: TemplateGlobalConfig[]; // For Module mode selection
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  visible,
  onCancel,
  onSave,
  initialValues,
  mode,
  globalConfigs = [],
}) => {
  const [form] = Form.useForm();
  const { t } = useLanguage();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.setFieldsValue({
          type: "TEXT",
          isHidden: false,
          mappingType: "FIXED",
        });
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave({ ...initialValues, ...values });
    });
  };

  return (
    <Modal
      open={visible}
      title={
        initialValues?.id
          ? t.templateDetail.editTitle
          : t.templateDetail.newTitle
      }
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t.templateDetail.name}
          rules={[{ required: true, message: "Please input name" }]}
        >
          <Input placeholder={t.templateDetail.name} />
        </Form.Item>

        <Form.Item name="description" label={t.templateDetail.desc}>
          <Input.TextArea rows={2} placeholder={t.templateDetail.desc} />
        </Form.Item>

        {mode === "GLOBAL" && (
          <>
            <Form.Item name="type" label={t.projectDetail.type}>
              <Radio.Group>
                <Radio value="TEXT">Text</Radio>
                <Radio value="FILE">File</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="defaultValue"
              label={t.templateDetail.defaultValue}
              rules={[
                { required: true, message: "Please input default value" },
              ]}
            >
              <Input placeholder={t.templateDetail.defaultValue} />
            </Form.Item>
          </>
        )}

        {mode === "MODULE" && (
          <>
            <Form.Item
              name="fileLocation"
              label={t.templateDetail.fileLocation}
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g., /src/config.js" />
            </Form.Item>

            <Form.Item name="regex" label={t.templateDetail.regex}>
              <Input placeholder={t.templateDetail.regex} />
            </Form.Item>

            <Form.Item name="mappingType" label={t.templateDetail.mapping}>
              <Select>
                <Select.Option value="FIXED">
                  {t.templateDetail.fixedValue}
                </Select.Option>
                <Select.Option value="GLOBAL">
                  {t.templateDetail.mapToGlobal}
                </Select.Option>
                <Select.Option value="MANUAL">
                  {t.templateDetail.manualInput}
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, current) =>
                prev.mappingType !== current.mappingType
              }
            >
              {({ getFieldValue }) => {
                const mappingType = getFieldValue("mappingType");
                return mappingType === "GLOBAL" ? (
                  <Form.Item
                    name="mappingValue"
                    label={t.templateDetail.select}
                    rules={[{ required: true }]}
                  >
                    <Select>
                      {globalConfigs.map((g) => (
                        <Select.Option key={g.id} value={g.id}>
                          {g.name} ({g.defaultValue})
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : mappingType === "FIXED" ? (
                  <Form.Item
                    name="mappingValue"
                    label={t.templateDetail.defaultValue}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>
          </>
        )}

        <Form.Item
          name="isHidden"
          valuePropName="checked"
          label={t.templateDetail.isHidden}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigForm;
