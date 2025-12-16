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
import { getCurrentUser } from "./services/auth";
import { getUserById } from "./services/users";

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof localStorage !== "undefined" && !!localStorage.getItem("token")
  );
  const [initialized, setInitialized] = useState(false);
  const [currentUser, setCurrentUser] = useState("zhuge@zhugeio.com");
  const [activeTab, setActiveTab] = useState<TabView>(TabView.PROJECTS);
  const [currentUserRole, setCurrentUserRole] = useState<string | undefined>(
    undefined
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const match = privateRoutes.find((r) => {
      const base = r.path.split("/:")[0];
      return location.pathname.startsWith(base);
    });
    if (match?.meta.tab) setActiveTab(match.meta.tab);
  }, [location]);

  const handleLogin = async (email: string) => {
    setIsAuthenticated(true);
    try {
      const me = await getCurrentUser();
      setCurrentUser(me.username ?? me.email ?? email);
      try {
        const detail = await getUserById(me.id);
        setCurrentUserRole(detail.role?.name || undefined);
      } catch {}
    } catch (err) {
      console.error("fetch me error:", err);
      setCurrentUser(email);
    }
    navigate("/projects");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch {}
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    switch (tab) {
      case TabView.PROJECTS:
        navigate("/projects");
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

  useEffect(() => {
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : null;
    if (token) {
      setIsAuthenticated(true);
      getCurrentUser()
        .then(async (me) => {
          setCurrentUser(me.username ?? me.email);
          try {
            const detail = await getUserById(me.id);
            setCurrentUserRole(detail.role?.name || undefined);
          } catch {}
        })
        .catch((err) => console.error("init fetch me error:", err))
        .finally(() => setInitialized(true));
    } else {
      setInitialized(true);
    }
  }, []);

  if (!initialized) {
    return (
      <Suspense fallback={<div />}>
        <div />
      </Suspense>
    );
  }

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
      userRoleName={currentUserRole}
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
