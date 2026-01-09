import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { GlobalOutlined, UserAddOutlined } from "@ant-design/icons";
import { useLanguage } from "../contexts/LanguageContext";
import { register } from "../services/auth";
import { message, Form, Input, Button } from "antd";
import styles from "./Login.module.less";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const onFinish = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      message.error("两次输入的密码不一致");
      return;
    }
    try {
      await register({
        email: values.email,
        username: values.username,
        password: values.password,
      });
      message.success("注册成功，请登录");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      message.error("注册失败，请稍后重试");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  return (
    <div className={styles.container}>
      {/* Decorative Background */}
      <div className={styles.decorativeBgTop}></div>
      <div className={styles.blobBlue}></div>
      <div className={styles.blobPurple}></div>

      {/* Top Controls */}
      <div className={styles.languageToggle}>
        <button onClick={toggleLanguage}>
          <GlobalOutlined style={{ marginRight: 6, fontSize: 14 }} />
          {language === "en" ? "EN" : "中文"}
        </button>
      </div>

      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>Z</div>
          <h1 className={styles.title}>{t.register.title}</h1>
          <p className={styles.subtitle}>Join ZhugeIO Deployment Manager</p>
        </div>

        <Form onFinish={onFinish} layout="vertical" className={styles.form}>
          <Form.Item
            label={t.register.emailPlaceholder}
            name="email"
            rules={[
              { required: true, message: "请输入邮箱地址" },
              { type: "email", message: "邮箱地址格式不正确" },
            ]}
          >
            <Input placeholder="name@company.com" size="large" />
          </Form.Item>

          <Form.Item
            label={t.register.usernamePlaceholder}
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="Your username" size="large" />
          </Form.Item>

          <Form.Item
            label={t.register.passwordPlaceholder}
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码长度至少 6 位" },
            ]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className={styles.submitBtn}
            icon={<UserAddOutlined />}
          >
            {t.register.registerBtn}
          </Button>

          <div className={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--color-blue-600)" }}>
              Sign in
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
