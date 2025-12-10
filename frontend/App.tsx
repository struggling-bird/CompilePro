import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import { TabView } from "./types";
import { LanguageProvider } from "./contexts/LanguageContext";

// Page Components
import Login from "./pages/Login";
import Register from "./pages/Register";
import CompileList from "./pages/CompileList";
import ProjectDetail from "./pages/ProjectDetail";
import ManageList from "./pages/ManageList";
import DeploymentDetail from "./pages/DeploymentDetail";
import BuildExecution from "./pages/BuildExecution";
import BuildHistory from "./pages/BuildHistory";
import SettingsPage from "./pages/SettingsPage";
import TemplateList from "./pages/TemplateList";
import TemplateDetail from "./pages/TemplateDetail";
import CustomerList from "./pages/CustomerList";
import CustomerDetail from "./pages/CustomerDetail";
import MemberList from "./pages/MemberList";
import MemberDetail from "./pages/MemberDetail";
import RoleList from "./pages/RoleList";
import RoleDetail from "./pages/RoleDetail";

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState("zhuge@zhugeio.com");
  const [activeTab, setActiveTab] = useState<TabView>(TabView.COMPILE);

  const navigate = useNavigate();
  const location = useLocation();

  // Sync tab state with route
  useEffect(() => {
    if (location.pathname.includes("/compile")) setActiveTab(TabView.COMPILE);
    else if (location.pathname.includes("/templates"))
      setActiveTab(TabView.TEMPLATES);
    else if (location.pathname.includes("/manage"))
      setActiveTab(TabView.MANAGE);
    else if (location.pathname.includes("/customers"))
      setActiveTab(TabView.CUSTOMERS);
    else if (location.pathname.includes("/members"))
      setActiveTab(TabView.MEMBERS);
    else if (location.pathname.includes("/roles")) setActiveTab(TabView.ROLES);
    else if (location.pathname.includes("/settings"))
      setActiveTab(TabView.SETTINGS);
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
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      userEmail={currentUser}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/compile" replace />} />
        <Route path="/compile" element={<CompileList />} />
        <Route path="/compile/:projectId" element={<ProjectDetail />} />
        <Route path="/templates" element={<TemplateList />} />
        <Route path="/templates/new" element={<TemplateDetail />} />
        <Route path="/templates/:templateId" element={<TemplateDetail />} />
        <Route path="/manage" element={<ManageList />} />
        <Route path="/manage/new" element={<DeploymentDetail />} />
        <Route path="/manage/:deployId" element={<DeploymentDetail />} />
        <Route path="/manage/:deployId/history" element={<BuildHistory />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/new" element={<CustomerDetail />} />
        <Route path="/customers/:customerId" element={<CustomerDetail />} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/members/new" element={<MemberDetail />} />
        <Route path="/members/:memberId" element={<MemberDetail />} />
        <Route path="/roles" element={<RoleList />} />
        <Route path="/roles/new" element={<RoleDetail />} />
        <Route path="/roles/:roleId" element={<RoleDetail />} />
        <Route path="/build/:deployId" element={<BuildExecution />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
};

export default App;
