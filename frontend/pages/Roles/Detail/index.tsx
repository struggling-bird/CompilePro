import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Checkbox, Button, Card } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useLanguage } from "../../../contexts/LanguageContext";
import { MOCK_ROLES, MOCK_PERMISSIONS } from "../../../constants";
import styles from "../styles/Detail.module.less";

const RoleDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const isNew = !roleId;
  const { t } = useLanguage();
  const role = MOCK_ROLES.find((r) => r.id === roleId);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    }
  }, [role]);

  const onFinish = async (values: {
    name: string;
    description: string;
    permissions: string[];
  }) => {
    navigate("/roles");
  };

  const groups = Array.from(new Set(MOCK_PERMISSIONS.map((p) => p.group)));

  return (
    <div className={styles.container}>
      <Card title={isNew ? t.roleDetail.newTitle : t.roleDetail.editTitle}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={t.roleDetail.name}
            name="name"
            rules={[{ required: true, message: "请输入角色名称" }]}
          >
            <Input disabled={role?.isSystem} />
          </Form.Item>
          <Form.Item label={t.roleDetail.description} name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          {groups.map((g) => {
            const perms = MOCK_PERMISSIONS.filter((p) => p.group === g);
            return (
              <Form.Item key={g} label={g} name={["permissions"]}>
                <Checkbox.Group
                  options={perms.map((p) => ({ label: p.name, value: p.id }))}
                />
              </Form.Item>
            );
          })}
          <div className={styles.actions}>
            <Button onClick={() => navigate("/roles")}>
              {t.roleDetail.cancel}
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {t.roleDetail.save}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RoleDetailPage;
