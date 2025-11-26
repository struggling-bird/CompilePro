import React, { useState, useEffect } from "react";
import {
  Settings,
  LogOut,
  Layers,
  HardDrive,
  Globe,
  Users,
  LayoutTemplate,
  UserCog,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
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
    { id: "compile", labelKey: "compile", icon: Layers, tab: TabView.COMPILE },
    {
      id: "templates",
      labelKey: "templates",
      icon: LayoutTemplate,
      tab: TabView.TEMPLATES,
    },
    { id: "manage", labelKey: "manage", icon: HardDrive, tab: TabView.MANAGE },
    {
      id: "customers",
      labelKey: "customers",
      icon: Users,
      tab: TabView.CUSTOMERS,
    },
    {
      id: "team",
      labelKey: "team",
      icon: UserCog,
      children: [
        {
          id: "members",
          labelKey: "members",
          icon: Users,
          tab: TabView.MEMBERS,
        },
        {
          id: "roles",
          labelKey: "roles",
          icon: ShieldCheck,
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
        <div key={item.id} className="mb-2">
          <button
            onClick={() => toggleMenu(item.id)}
            title={isCollapsed ? label : ""}
            className={`
              flex items-center w-full transition-all duration-200 rounded-xl group relative
              ${
                isCollapsed ? "justify-center py-3 px-0 mx-3" : "px-4 py-3 mx-3"
              }
              ${
                hasActiveChild || isExpanded
                  ? "text-white bg-slate-800"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }
            `}
          >
            <Icon
              className={`flex-shrink-0 transition-all ${
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
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${
                  isExpanded ? "transform rotate-180" : ""
                }`}
              />
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700 transition-opacity">
                {label}
              </div>
            )}
          </button>

          {/* Render Children with Tree Line */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded && !isCollapsed
                ? "max-h-96 opacity-100 mt-1"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="ml-6 pl-3 border-l border-slate-700/50 space-y-1 mr-3">
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
          flex items-center w-full transition-all duration-200 rounded-xl mb-1 group relative
          ${isCollapsed ? "justify-center py-3 px-0 mx-3" : "py-3 px-4"}
          ${level > 0 && !isCollapsed ? "ml-0 pl-10" : "mx-3"} 
          ${
            isActive
              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-medium"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }
        `}
      >
        <Icon
          className={`flex-shrink-0 transition-all ${
            isCollapsed ? "w-6 h-6" : "w-4 h-4 mr-3"
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
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700 transition-opacity">
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
        bg-slate-900 text-slate-300 
        transform transition-all duration-300 ease-in-out flex flex-col shadow-2xl border-r border-slate-800
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
      `}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center h-20 transition-all duration-300 ${
            isCollapsed ? "justify-center px-0" : "px-6"
          }`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20 flex-shrink-0 ring-1 ring-white/10">
            Z
          </div>
          <span
            className={`font-bold text-xl tracking-tight ml-3 text-white whitespace-nowrap transition-all duration-300 ${
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
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 scrollbar-none">
          {navConfig.map((item) => renderNavItem(item))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/50 bg-slate-900">
          {/* Action Items */}
          <div className="space-y-1 mb-4">
            <button
              onClick={() => onTabChange(TabView.SETTINGS)}
              title={isCollapsed ? t.layout.settings : ""}
              className={`
                  flex items-center w-full rounded-xl transition-colors group relative
                  ${isCollapsed ? "justify-center py-2" : "px-4 py-2"}
                  ${
                    activeTab === TabView.SETTINGS
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-medium"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }
                `}
            >
              <Settings
                className={`${
                  isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3"
                } transition-all`}
              />
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                }`}
              >
                {t.layout.settings}
              </span>
            </button>

            <button
              onClick={onLogout}
              title={isCollapsed ? t.layout.logout : ""}
              className={`
                  flex items-center w-full rounded-xl transition-colors group relative
                  ${isCollapsed ? "justify-center py-2" : "px-4 py-2"}
                  text-slate-400 hover:text-red-400 hover:bg-slate-800/50
                `}
            >
              <LogOut
                className={`${
                  isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-3"
                } transition-all`}
              />
              <span
                className={`text-sm font-medium transition-all duration-300 ${
                  isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                }`}
              >
                {t.layout.logout}
              </span>
            </button>
          </div>

          {/* Collapse Toggle (Desktop Only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-full items-center justify-center py-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-700/50"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 transition-all duration-300">
        {/* Top Header */}
        <header className="bg-white h-20 flex items-center justify-between px-8 shrink-0 border-b border-slate-200/60 z-10">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4 p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 hidden sm:block animate-in fade-in slide-in-from-left-2">
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
              <Globe className="w-4 h-4 mr-1.5" />
              {language === "en" ? "EN" : "中文"}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center space-x-3 pl-1">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-white">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-700 leading-none">
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
