import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Select, Button, Card } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { MOCK_CUSTOMERS, MOCK_DEPLOYMENTS } from "../../../constants";

const DeploymentDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { deploymentId } = useParams();
  const isNew = !deploymentId;
  const { t } = useLanguage();
  const record = MOCK_DEPLOYMENTS.find((d) => d.id === deploymentId);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (record) {
      form.setFieldsValue({
        name: record.name,
        customerName: record.customerName,
        environment: record.environment,
      });
    }
  }, [record]);

  const onFinish = async (values: {
    name: string;
    customerName: string;
    environment: string;
  }) => {
    navigate("/manage");
  };

  return (
    <div className="p-6">
      <Card
        title={
          isNew ? t.deploymentDetail.newTitle : t.deploymentDetail.editTitle
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label={t.deploymentDetail.name}
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="customerName"
            label={t.deploymentDetail.customer}
            rules={[{ required: true, message: "请选择客户" }]}
          >
            <Select
              options={MOCK_CUSTOMERS.map((c) => ({
                label: c.name,
                value: c.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="environment"
            label={t.deploymentDetail.environment}
            rules={[{ required: true, message: "请选择环境" }]}
          >
            <Select
              options={[
                { label: "dev", value: "dev" },
                { label: "staging", value: "staging" },
                { label: "prod", value: "prod" },
              ]}
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate("/manage")}
              style={{ marginRight: 8 }}
            >
              {t.deploymentDetail.cancel}
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {t.deploymentDetail.save}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default DeploymentDetailPage;
