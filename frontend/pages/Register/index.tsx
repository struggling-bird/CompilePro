import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { Globe } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../apis/auth";
import { useLanguage } from "../../contexts/LanguageContext";

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await register({
        email: values.email,
        password: values.password,
        username: values.username,
      });
      message.success(t.register.successMessage);
      navigate("/login");
    } catch (error: any) {
      message.error(error.message || t.register.failMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      {/* Top right lang switch */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center text-slate-500 hover:text-slate-800"
        >
          <Globe className="w-4 h-4 mr-1" />
          {language === "en" ? "EN" : "中文"}
        </button>
      </div>

      <div className="w-full max-w-md px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-slate-800 mb-2">
            {t.register.title}
          </h1>
        </div>

        <Form
          name="register"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t.register.emailRequired },
              { type: "email", message: t.register.emailInvalid },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" />}
              placeholder={t.register.emailPlaceholder}
            />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[{ required: true, message: t.register.usernameRequired }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder={t.register.usernamePlaceholder}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: t.register.passwordRequired }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder={t.register.passwordPlaceholder}
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: t.register.confirmPasswordRequired },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t.register.passwordMismatch));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder={t.register.confirmPasswordPlaceholder}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-blue-500 hover:bg-blue-600 border-none"
            >
              {t.register.registerBtn}
            </Button>
          </Form.Item>

          <div className="text-center text-xs text-slate-400 mt-4">
            {t.register.hasAccount}{" "}
            <Link to="/login" className="text-blue-500 hover:text-blue-600">
              {t.register.loginNow}
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
