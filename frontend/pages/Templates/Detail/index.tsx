import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, Card } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { MOCK_TEMPLATES } from "../../../constants";

const TemplateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isNew = !templateId;
  const { t } = useLanguage();

  const tpl = MOCK_TEMPLATES.find((i) => i.id === templateId);

  const [form] = Form.useForm();
  React.useEffect(() => {
    if (tpl) {
      form.setFieldsValue({ name: tpl.name, description: tpl.description });
    }
  }, [tpl]);

  const onFinish = async (values: { name: string; description: string }) => {
    navigate("/templates");
  };

  return (
    <div className="p-6">
      <Card
        title={isNew ? t.templateDetail.newTitle : t.templateDetail.editTitle}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={t.templateDetail.name}
            name="name"
            rules={[{ required: true, message: "请输入模板名称" }]}
          >
            <Input placeholder="Template name" />
          </Form.Item>
          <Form.Item label={t.templateDetail.description} name="description">
            <Input.TextArea rows={4} placeholder="Description" />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate("/templates")}
              style={{ marginRight: 8 }}
            >
              {t.templateDetail.cancel}
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {t.templateDetail.save}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default TemplateDetailPage;
