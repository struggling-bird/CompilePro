import React, { useEffect, useState } from "react";
import {
  Card,
  Progress,
  Button,
  Form,
  InputNumber,
  Divider,
  message,
  List,
  Typography,
} from "antd";
import {
  ReloadOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  getQuotaInfo,
  updateQuota,
  QuotaInfo,
} from "../../../../services/storageAnalysis";
import { useLanguage } from "../../../../contexts/LanguageContext";

const { Text, Title } = Typography;

const QuotaManagement: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<QuotaInfo | null>(null);
  const [form] = Form.useForm();

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const data = await getQuotaInfo();
      setInfo(data);
      form.setFieldsValue({
        total: data.total,
        warningThreshold: data.warningThreshold,
      });
    } catch (error) {
      message.error(t.settings.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleUpdate = async (values: any) => {
    try {
      await updateQuota(values.total, values.warningThreshold);
      message.success(t.settings.saveSuccess);
      fetchInfo();
    } catch (error) {
      message.error(t.settings.saveFailed);
    }
  };

  const cleanSuggestions = [
    {
      title: t.settings.tempFiles,
      size: "2.5 GB",
      description: t.settings.tempFilesDesc,
    },
    {
      title: t.settings.logFiles,
      size: "1.2 GB",
      description: t.settings.logFilesDesc,
    },
    {
      title: t.settings.cache,
      size: "800 MB",
      description: t.settings.cacheDesc,
    },
  ];

  return (
    <div className="space-y-6">
      <Card title={t.settings.storageQuotaUsage} className="shadow-sm">
        {info && (
          <div className="text-center py-4">
            <Progress
              type="dashboard"
              percent={parseFloat(((info.used / info.total) * 100).toFixed(1))}
              format={(percent) => (
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{percent}%</span>
                  <span className="text-sm text-gray-500">
                    {info.used}GB / {info.total}GB
                  </span>
                </div>
              )}
              strokeColor={
                (info.used / info.total) * 100 > info.warningThreshold
                  ? "#ff4d4f"
                  : "#1890ff"
              }
            />
          </div>
        )}

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          initialValues={{ total: 100, warningThreshold: 80 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={`${t.settings.totalSpace} (GB)`}
              name="total"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label={t.settings.warningThreshold}
              name="warningThreshold"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={100} style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <div className="flex justify-end">
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {t.settings.saveChanges}
            </Button>
          </div>
        </Form>
      </Card>

      <Card title={t.settings.cleanupSuggestions} className="shadow-sm">
        <List
          itemLayout="horizontal"
          dataSource={cleanSuggestions}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="clean"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  {t.settings.clean}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<Text strong>{item.title}</Text>}
                description={item.description}
              />
              <div className="text-right">
                <Text type="secondary">{t.settings.potentialSaving}</Text>
                <div className="font-medium text-green-600">{item.size}</div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default QuotaManagement;
