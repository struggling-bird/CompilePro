import React, { useEffect, useState, useMemo } from "react";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  message,
  Tooltip,
  Select,
} from "antd";
import {
  InfoCircleOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  getStorageConfigs,
  updateStorageConfig,
  StorageConfig,
  ConfigOption,
} from "../../../services/storageConfig";

const FileStorageSettings: React.FC = () => {
  const { t } = useLanguage();
  const [configs, setConfigs] = useState<StorageConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const data = await getStorageConfigs();
      setConfigs(data || []);
      // Initialize form values
      const initialValues: Record<string, any> = {};
      data?.forEach((c) => {
        initialValues[c.key] =
          c.type === "json" ? JSON.stringify(c.value, null, 2) : c.value;
      });
      form.setFieldsValue(initialValues);
    } catch (error) {
      message.error(t.settings.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const groupedConfigs = useMemo(() => {
    const groups: Record<string, StorageConfig[]> = {};
    configs.forEach((c) => {
      const g = c.group || "default";
      if (!groups[g]) groups[g] = [];
      groups[g].push(c);
    });
    return groups;
  }, [configs]);

  const handleSave = async (groupName: string) => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      const groupConfigs = groupedConfigs[groupName];

      const promises = groupConfigs.map(async (config) => {
        const newValue = values[config.key];
        const oldValue =
          config.type === "json"
            ? JSON.stringify(config.value, null, 2)
            : config.value;

        // Only update if changed
        if (newValue != oldValue) {
          // loose equality for string/number match
          await updateStorageConfig(config.key, { value: newValue });
        }
      });

      await Promise.all(promises);
      message.success(t.settings.saveSuccess);
      fetchConfigs(); // Refresh to get latest state
    } catch (error) {
      console.error(error);
      message.error(t.settings.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const renderFormItem = (config: StorageConfig) => {
    const label = (
      <span>
        {config.description || config.key}
        {config.tip && (
          <Tooltip title={config.tip}>
            <InfoCircleOutlined className="ml-2 text-gray-400" />
          </Tooltip>
        )}
      </span>
    );

    if (config.options && config.options.length > 0) {
      return (
        <Form.Item name={config.key} label={label}>
          <Select>
            {config.options.map((opt: ConfigOption) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      );
    }

    switch (config.type) {
      case "boolean":
        return (
          <Form.Item name={config.key} label={label} valuePropName="checked">
            <Switch />
          </Form.Item>
        );
      case "number":
        return (
          <Form.Item name={config.key} label={label}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        );
      case "json":
        return (
          <Form.Item name={config.key} label={label}>
            <Input.TextArea rows={4} style={{ fontFamily: "monospace" }} />
          </Form.Item>
        );
      case "string":
      default:
        if (config.isSensitive) {
          return (
            <Form.Item name={config.key} label={label}>
              <Input.Password placeholder="******" />
            </Form.Item>
          );
        }
        return (
          <Form.Item name={config.key} label={label}>
            <Input />
          </Form.Item>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="mb-6 flex justify-end items-center">
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchConfigs}
          loading={loading}
        >
          {t.settings.refresh}
        </Button>
      </div>

      {configs.length === 0 && !loading ? (
        <div className="text-center py-10 text-gray-500">
          {t.settings.noConfigs}
        </div>
      ) : (
        <Form form={form} layout="vertical">
          {Object.keys(groupedConfigs).map((group) => (
            <div key={group} className="max-w-3xl mb-8">
              {groupedConfigs[group].map((config) => (
                <div key={config.key} className="mb-4">
                  {renderFormItem(config)}
                </div>
              ))}
              <div className="mt-6 border-t pt-4">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => handleSave(group)}
                  loading={saving}
                >
                  {t.settings.saveChanges}
                </Button>
              </div>
            </div>
          ))}
        </Form>
      )}
    </div>
  );
};

export default FileStorageSettings;
