import React, { useState } from "react";
import {
  MessageOutlined,
  GlobalOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { login } from "../services/auth";
import { message, Form, Input, Button, Checkbox } from "antd";
import styles from "./Login.module.less";

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [autoLogin, setAutoLogin] = useState(true);
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const res = await login({ email: values.email, password: values.password });
      localStorage.setItem("token", res.token);
      onLogin(values.email);
      navigate("/compile");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "请求失败，请稍后重试";
      console.error("Login error:", err);
      message.error(msg);
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
          <div className={styles.logoContainer}>
            Z
          </div>
          <h1 className={styles.title}>{t.login.title}</h1>
          <p className={styles.subtitle}>
            Welcome back, please login to your account
          </p>
        </div>

        <Form onFinish={onFinish} layout="vertical" className={styles.form}>
          <div style={{ marginBottom: 16 }}>
            <Form.Item
              label={t.login.emailPlaceholder}
              name="email"
              rules={[
                { required: true, message: "请输入邮箱地址" },
                { type: "email", message: "邮箱地址格式不正确" },
              ]}
            >
              <Input placeholder="name@company.com" size="large" />
            </Form.Item>
            <Form.Item
              label={t.login.passwordPlaceholder}
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 6, message: "密码长度至少 6 位" },
              ]}
            >
              <Input.Password placeholder="••••••••" size="large" />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14 }}>
            <label className={styles.checkboxLabel}>
              <Checkbox
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
              />
              <span>
                {t.login.autoLogin}
              </span>
            </label>
            <a
              href="#"
              className={styles.forgotPasswordLink}
            >
              {t.login.forgotPassword}
            </a>
          </div>

          <div style={{ marginTop: 24 }}>
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              className={styles.submitBtn}
            >
              <LoginOutlined style={{ marginRight: 8 }} />
              {t.login.loginBtn}
            </Button>
          </div>

          <div className={styles.footer}>
            {t.login.noAccount}
            <Button
              type="link"
              onClick={() => navigate("/register")}
              style={{ fontWeight: 600, paddingLeft: 4 }}
            >
              {t.login.register}
            </Button>
          </div>
        </Form>
      </div>

      {/* Floating Chat Bubble */}
      <div className={styles.floatingChat}>
        <button>
          <MessageOutlined style={{ fontSize: 24 }} />
        </button>
      </div>
    </div>
  );
};

export default Login;
