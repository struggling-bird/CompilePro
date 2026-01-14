import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Radio,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
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
        const values: any = { ...initialValues };
        // Handle FILE type initial value for Upload component
        if (
          mode === "GLOBAL" &&
          values.type === "FILE" &&
          values.defaultValue
        ) {
          // If it's a string (ID), convert to fileList
          if (typeof values.defaultValue === "string") {
            values.defaultValue = [
              {
                uid: "-1",
                name: "Uploaded File", // Ideally we should have the real name
                status: "done",
                response: [{ id: values.defaultValue }], // Mock response structure for consistent extraction
              },
            ];
          }
        }
        form.setFieldsValue(values);
      } else {
        form.setFieldsValue({
          type: "TEXT",
          isHidden: false,
          mappingType: "FIXED",
        });
      }
    }
  }, [visible, initialValues, form, mode]);

  const getTitle = () => {
    if (initialValues?.id) {
      return mode === "GLOBAL"
        ? t.templateDetail.editGlobalConfig
        : t.templateDetail.editModuleConfig;
    }
    return mode === "GLOBAL"
      ? t.templateDetail.createGlobalConfig
      : t.templateDetail.createModuleConfig;
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const processedValues: any = { ...initialValues, ...values };

      // Process FILE type value
      if (mode === "GLOBAL" && values.type === "FILE") {
        const fileList = values.defaultValue;
        if (fileList && fileList.length > 0) {
          const file = fileList[0];
          // Check for wrapped response structure { code, message, data: [...] }
          if (
            file.response &&
            file.response.data &&
            Array.isArray(file.response.data) &&
            file.response.data.length > 0
          ) {
            processedValues.defaultValue = file.response.data[0].id;
          }
          // Check for direct array response (legacy/fallback)
          else if (
            file.response &&
            Array.isArray(file.response) &&
            file.response.length > 0
          ) {
            processedValues.defaultValue = file.response[0].id;
          }
          // Check for direct object with id
          else if (file.response && file.response.id) {
            processedValues.defaultValue = file.response.id;
          } else {
            // If it's existing file, we mocked response above in initialValues
            // which follows the direct array structure in our mock: response: [{ id: ... }]
            // But if it was newly uploaded and structure doesn't match, we might have an issue.
            // Let's assume the mock structure is handled by the first or second check depending on how we mocked it.
            // In initialValues: response: [{ id: values.defaultValue }] -> matches second check.
          }
        } else {
          processedValues.defaultValue = "";
        }
      }

      onSave(processedValues);
    });
  };

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : "";

  const headers = {
    Authorization: `Bearer ${token}`,
    "X-Request-Id": uuidv4(),
  };

  return (
    <Modal
      open={visible}
      title={getTitle()}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="name"
          label={t.templateDetail.name}
          rules={[{ required: true, message: t.templateDetail.inputName }]}
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
              noStyle
              shouldUpdate={(prev, current) => prev.type !== current.type}
            >
              {({ getFieldValue }) => {
                const type = getFieldValue("type");
                return type === "FILE" ? (
                  <Form.Item
                    name="defaultValue"
                    label={t.templateDetail.defaultValue}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[
                      { required: true, message: "Please upload a file" },
                    ]}
                  >
                    <Upload
                      action="/apis/storage/upload?isTemp=true"
                      headers={headers}
                      listType="text"
                      maxCount={1}
                      name="files"
                    >
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="defaultValue"
                    label={t.templateDetail.defaultValue}
                    rules={[
                      { required: true, message: "Please input default value" },
                    ]}
                  >
                    <Input placeholder={t.templateDetail.defaultValue} />
                  </Form.Item>
                );
              }}
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
              <Input placeholder={t.templateDetail.fileLocationPlaceholder} />
            </Form.Item>

            <Form.Item name="regex" label={t.templateDetail.regex}>
              <Input placeholder={t.templateDetail.regex} />
            </Form.Item>

            <Form.Item name="matchIndex" label={t.projectDetail.matchIndex} initialValue={0}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prev, curr) => prev.regex !== curr.regex}
            >
              {({ getFieldValue }) => {
                const regex = getFieldValue("regex");
                let groupCount = 0;
                if (regex) {
                  try {
                    let pattern = regex;
                    const match = regex.match(/^\/(.*?)\/([gimsuy]*)$/);
                    if (match) {
                      pattern = match[1];
                    }
                    const r = new RegExp(pattern + '|');
                    const m = r.exec('');
                    groupCount = m ? m.length - 1 : 0;
                  } catch {
                    groupCount = 0;
                  }
                }

                if (groupCount > 0) {
                  return (
                    <Form.Item
                      name="groupIndex"
                      label={t.projectDetail.targetGroup}
                      initialValue={0}
                      tooltip={t.projectDetail.targetGroupTooltip}
                    >
                      <Select>
                        <Select.Option value={0}>{t.projectDetail.group0}</Select.Option>
                        {Array.from({ length: groupCount }).map((_, i) => (
                          <Select.Option key={i + 1} value={i + 1}>
                            {t.projectDetail.groupN.replace("{{n}}", String(i + 1))}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  );
                }
                return null;
              }}
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
