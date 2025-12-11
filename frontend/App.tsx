import React, { useState, useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import { publicRoutes, privateRoutes } from "./routes/config";
import { TabView } from "./types";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState("zhuge@zhugeio.com");
  const [activeTab, setActiveTab] = useState<TabView>(TabView.COMPILE);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const match = privateRoutes.find((r) => {
      const base = r.path.split("/:")[0];
      return location.pathname.startsWith(base);
    });
    if (match?.meta.tab) setActiveTab(match.meta.tab);
  }, [location]);

  const handleLogin = (email: string) => {
    setCurrentUser(email);
    setIsAuthenticated(true);
    navigate("/compile");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    switch (tab) {
      case TabView.COMPILE:
        navigate("/compile");
        break;
      case TabView.TEMPLATES:
        navigate("/templates");
        break;
      case TabView.MANAGE:
        navigate("/manage");
        break;
      case TabView.CUSTOMERS:
        navigate("/customers");
        break;
      case TabView.MEMBERS:
        navigate("/members");
        break;
      case TabView.ROLES:
        navigate("/roles");
        break;
      case TabView.SETTINGS:
        navigate("/settings");
        break;
    }
  };

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div />}>
        <Routes>
          {publicRoutes.map(({ path, component: C }) => (
            <Route
              key={path}
              path={path}
              element={path === "/login" ? <C onLogin={handleLogin} /> : <C />}
            />
          ))}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      userEmail={currentUser}
      onLogout={handleLogout}
    >
      <Suspense fallback={<div />}>
        <Routes>
          <Route path="/" element={<Navigate to="/compile" replace />} />
          {privateRoutes.map(({ path, component: C }) => (
            <Route key={path} path={path} element={<C />} />
          ))}
        </Routes>
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  const AntdWrapper: React.FC = () => {
    const { language } = useLanguage();
    return (
      <ConfigProvider locale={language === "zh" ? zhCN : enUS}>
        <Router>
          <AppContent />
        </Router>
      </ConfigProvider>
    );
  };

  return (
    <LanguageProvider>
      <AntdWrapper />
    </LanguageProvider>
  );
};

export default App;
