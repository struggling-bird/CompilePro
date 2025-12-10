import React, { useState, useEffect } from "react";
import {
  SettingOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  HddOutlined,
  GlobalOutlined,
  TeamOutlined,
  LayoutOutlined,
  UserSwitchOutlined,
  MenuOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { TabView } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  userEmail: string;
  onLogout: () => void;
}

type NavItemConfig = {
  id: string;
  labelKey: string;
  icon: any;
  tab?: TabView;
  children?: NavItemConfig[];
};

const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  userEmail,
  onLogout,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For Mobile Drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // For Desktop Collapse
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["team"]); // Track expanded parent menus
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  const navConfig: NavItemConfig[] = [
    {
      id: "compile",
      labelKey: "compile",
      icon: AppstoreOutlined,
      tab: TabView.COMPILE,
    },
    {
      id: "templates",
      labelKey: "templates",
      icon: LayoutOutlined,
      tab: TabView.TEMPLATES,
    },
    {
      id: "manage",
      labelKey: "manage",
      icon: HddOutlined,
      tab: TabView.MANAGE,
    },
    {
      id: "customers",
      labelKey: "customers",
      icon: TeamOutlined,
      tab: TabView.CUSTOMERS,
    },
    {
      id: "team",
      labelKey: "team",
      icon: UserSwitchOutlined,
      children: [
        {
          id: "members",
          labelKey: "members",
          icon: UserOutlined,
          tab: TabView.MEMBERS,
        },
        {
          id: "roles",
          labelKey: "roles",
          icon: SafetyCertificateOutlined,
          tab: TabView.ROLES,
        },
      ],
    },
  ];

  // Helper to check if a parent has an active child
  const isParentActive = (item: NavItemConfig) => {
    return item.children?.some((child) => child.tab === activeTab);
  };

  // Auto-expand parent if child is active
  useEffect(() => {
    navConfig.forEach((item) => {
      if (
        item.children &&
        isParentActive(item) &&
        !expandedMenus.includes(item.id)
      ) {
        setExpandedMenus((prev) => [...prev, item.id]);
      }
    });
  }, [activeTab]);

  const toggleMenu = (id: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      // If opening from collapsed state, ensure we add it to expanded
      if (!expandedMenus.includes(id)) {
        setExpandedMenus([...expandedMenus, id]);
      }
    } else {
      setExpandedMenus((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  const renderNavItem = (item: NavItemConfig, level = 0) => {
    // @ts-ignore
    const label = t.layout[item.labelKey] || item.labelKey;
    const isActive = item.tab === activeTab;
    const isParent = !!item.children;
    const isExpanded = expandedMenus.includes(item.id);
    const hasActiveChild = isParent && isParentActive(item);
    const Icon = item.icon;

    if (isParent) {
      return (
        <div key={item.id} className="mb-1">
          <button
            onClick={() => toggleMenu(item.id)}
            title={isCollapsed ? label : ""}
            className={`
              flex items-center w-full transition-all duration-200 rounded-md group relative
              ${
                isCollapsed
                  ? "justify-center py-3 px-0 mx-2"
                  : "px-3 py-2.5 mx-2"
              }
              ${
                hasActiveChild || isExpanded
                  ? "text-white bg-white/10"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }
            `}
          >
            <Icon
              className={`flex-shrink-0 transition-all duration-300 ${
                isCollapsed ? "w-6 h-6" : "w-5 h-5 mr-3"
              } ${hasActiveChild ? "text-blue-400" : ""}`}
            />

            <span
              className={`font-medium text-sm tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 flex-1 text-left ${
                isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
              }`}
            >
              {label}
            </span>

            {!isCollapsed && (
              <DownOutlined
                className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                  isExpanded ? "transform rotate-180" : ""
                }`}
              />
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700 transition-opacity">
                {label}
              </div>
            )}
          </button>

          {/* Render Children with Tree Line */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded && !isCollapsed
                ? "max-h-96 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="mt-1 ml-4 pl-4 border-l border-slate-700/50 space-y-1 mr-2">
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </div>
          </div>
        </div>
      );
    }

    // Leaf Item
    return (
      <button
        key={item.id}
        onClick={() => {
          if (item.tab) onTabChange(item.tab);
          setIsSidebarOpen(false);
        }}
        title={isCollapsed ? label : ""}
        className={`
          flex items-center w-full transition-all duration-200 rounded-md mb-1 group relative
          ${isCollapsed ? "justify-center py-3 px-0 mx-2" : "py-2 px-3"}
          ${level > 0 && !isCollapsed ? "" : "mx-2"} 
          ${
            isActive
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
          }
        `}
      >
        <Icon
          className={`flex-shrink-0 transition-all duration-300 ${
            isCollapsed ? "w-6 h-6" : "w-4.5 h-4.5 mr-3"
          } ${
            isActive
              ? "text-white"
              : "text-slate-400 group-hover:text-slate-300"
          }`}
        />

        <span
          className={`font-medium text-sm tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
          }`}
        >
          {label}
        </span>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700 transition-opacity">
            {label}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-30 
        ${isCollapsed ? "w-20" : "w-64"} 
        bg-[#0B1120] text-slate-300 
        transform transition-all duration-300 ease-in-out flex flex-col shadow-2xl border-r border-slate-800/50
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
      `}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center h-16 border-b border-slate-800/50 transition-all duration-300 ${
            isCollapsed ? "justify-center px-0" : "px-6"
          }`}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
            Z
          </div>
          <span
            className={`font-bold text-xl tracking-tight ml-3 text-slate-100 whitespace-nowrap transition-all duration-300 ${
              isCollapsed
                ? "w-0 opacity-0 overflow-hidden"
                : "w-auto opacity-100"
            }`}
          >
            ZhugeIO
          </span>
          <button
            className="md:hidden ml-auto text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <CloseOutlined className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 scrollbar-none">
          {navConfig.map((item) => renderNavItem(item))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/50 bg-[#0B1120]">
          <div className="space-y-1 mb-4">
            <button
              onClick={() => onTabChange(TabView.SETTINGS)}
              title={isCollapsed ? t.layout.settings : ""}
              className={`
                  flex items-center w-full rounded-md transition-colors group relative
                  ${
                    isCollapsed
                      ? "justify-center py-3 px-0 mx-2"
                      : "px-3 py-2.5 mx-2"
                  }
                  ${
                    activeTab === TabView.SETTINGS
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                  }
                `}
            >
              <SettingOutlined
                className={`${
                  isCollapsed ? "w-5 h-5" : "w-4.5 h-4.5 mr-3"
                } transition-all`}
              />
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                }`}
              >
                {t.layout.settings}
              </span>
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700 transition-opacity">
                  {t.layout.settings}
                </div>
              )}
            </button>

            <button
              onClick={onLogout}
              title={isCollapsed ? t.layout.logout : ""}
              className={`
                  flex items-center w-full rounded-md transition-colors group relative
                  ${
                    isCollapsed
                      ? "justify-center py-3 px-0 mx-2"
                      : "px-3 py-2.5 mx-2"
                  }
                  text-slate-400 hover:text-red-400 hover:bg-white/5
                `}
            >
              <LogoutOutlined
                className={`${
                  isCollapsed ? "w-5 h-5" : "w-4.5 h-4.5 mr-3"
                } transition-all`}
              />
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                }`}
              >
                {t.layout.logout}
              </span>
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700 transition-opacity">
                  {t.layout.logout}
                </div>
              )}
            </button>
          </div>

          {/* Collapse Toggle (Desktop Only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center py-2 text-slate-500 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-slate-700/30"
          >
            {isCollapsed ? (
              <RightOutlined className="w-5 h-5" />
            ) : (
              <LeftOutlined className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 transition-all duration-300">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 shadow-sm z-10 sticky top-0">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuOutlined className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden sm:block animate-in fade-in slide-in-from-left-2 tracking-tight">
              {activeTab === TabView.COMPILE && t.layout.compile}
              {activeTab === TabView.MANAGE && t.layout.manage}
              {activeTab === TabView.TEMPLATES && t.layout.templates}
              {activeTab === TabView.CUSTOMERS && t.layout.customers}
              {(activeTab === TabView.MEMBERS || activeTab === TabView.ROLES) &&
                t.layout.team}
              {activeTab === TabView.SETTINGS && t.layout.settings}
            </h2>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <GlobalOutlined className="w-4 h-4 mr-1.5" />
              {language === "en" ? "EN" : "中文"}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center space-x-3 pl-1">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-white">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-700 leading-none">
                  {userEmail.split("@")[0]}
                </span>
                <span className="text-xs text-slate-400 mt-0.5">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden p-4 sm:p-6">
          <div className="bg-white shadow-sm border border-slate-200 rounded-xl h-full overflow-hidden relative">
            {children}
          </div>
        </main>

        {/* Footer Info */}
        <div className="bg-slate-50 py-3 px-6 text-center text-xs text-slate-400 border-t border-slate-200/50">
          {t.layout.footer}
        </div>
      </div>
    </div>
  );
};

export default Layout;
