import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Select, Button, Card } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { MOCK_TEAM_MEMBERS, MOCK_ROLES } from "../../../constants";

const MemberDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const isNew = !memberId;
  const { t } = useLanguage();
  const m = MOCK_TEAM_MEMBERS.find((i) => i.id === memberId);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (m) {
      form.setFieldsValue({
        name: m.name,
        email: m.email,
        role: m.role,
        status: m.status,
      });
    }
  }, [m]);

  const onFinish = async (values: {
    name: string;
    email: string;
    role: string;
    status: string;
  }) => {
    navigate("/members");
  };

  return (
    <div className="p-6">
      <Card title={isNew ? t.memberDetail.newTitle : t.memberDetail.editTitle}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={t.memberDetail.name}
            name="name"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t.memberDetail.email}
            name="email"
            rules={[
              { required: true, type: "email", message: "请输入有效邮箱" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={t.memberDetail.role}
            name="role"
            rules={[{ required: true, message: "请选择角色" }]}
          >
            <Select
              options={MOCK_ROLES.map((r) => ({
                label: r.name,
                value: r.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            label={t.memberDetail.status}
            name="status"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select
              options={[
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
            />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => navigate("/members")}
              style={{ marginRight: 8 }}
            >
              {t.memberDetail.cancel}
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {t.memberDetail.save}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default MemberDetailPage;
