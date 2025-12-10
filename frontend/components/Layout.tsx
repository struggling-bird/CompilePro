import React, { useState, useEffect, useMemo } from "react";
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
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown } from "antd";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const menuItems = useMemo(() => {
    return navConfig.map((item) => {
      // @ts-ignore
      const label = t.layout[item.labelKey] || item.labelKey;
      const Icon = item.icon;
      if (item.children) {
        return {
          key: item.id,
          icon: <Icon className="w-5 h-5" />,
          label,
          children: item.children.map((child) => {
            const ChildIcon = child.icon;
            // @ts-ignore
            const childLabel = t.layout[child.labelKey] || child.labelKey;
            return {
              key: child.tab!,
              icon: <ChildIcon className="w-4 h-4" />,
              label: childLabel,
            };
          }),
        } as any;
      }
      return {
        key: item.tab!,
        icon: <Icon className="w-5 h-5" />,
        label,
      } as any;
    });
  }, [t, navConfig]);

  return (
    <AntLayout className="h-screen">
      <AntLayout.Sider
        theme="dark"
        width={256}
        collapsible
        collapsed={isCollapsed}
        onCollapse={(c) => setIsCollapsed(c)}
        collapsedWidth={64}
        breakpoint="lg"
        trigger={null}
        className="relative"
      >
        <div
          className={`flex items-center h-16 px-4 border-b border-slate-800/50`}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify中心 text白 font-bold text-xl shadow-lg flex-shrink-0">
            Z
          </div>
          <span
            className={`font-bold text-xl tracking-tight ml-3 text-slate-100 ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            }`}
          >
            ZhugeIO
          </span>
        </div>
        <div className="absolute right-0 top-0 h-full w-4 z-20 opacity-0 hover:opacity-100 transition">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle sidebar"
            className="w-full h-full flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            {isCollapsed ? <RightOutlined /> : <LeftOutlined />}
          </button>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          openKeys={isCollapsed ? [] : expandedMenus}
          onOpenChange={(keys) => setExpandedMenus(keys as string[])}
          items={menuItems}
          onClick={({ key }) => {
            const k = key as TabView;
            if (Object.values(TabView).includes(k)) onTabChange(k);
          }}
          inlineCollapsed={isCollapsed}
          style={{ height: "calc(100% - 64px)" }}
        />
      </AntLayout.Sider>
      <AntLayout>
        <AntLayout.Header className="bg白/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <Button
              type="text"
              className="mr-2 md:hidden"
              onClick={() => setIsCollapsed(false)}
              icon={<MenuOutlined />}
            />
            <h2 className="text-xl font-bold text-slate-800 hidden sm:block tracking-tight">
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
            <Button
              size="small"
              onClick={toggleLanguage}
              icon={<GlobalOutlined />}
            >
              {language === "en" ? "EN" : "中文"}
            </Button>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <Dropdown
              menu={{
                items: [
                  {
                    key: "settings",
                    label: t.layout.settings,
                    icon: <SettingOutlined />,
                  },
                  { type: "divider" },
                  {
                    key: "logout",
                    label: t.layout.logout,
                    icon: <LogoutOutlined />,
                    danger: true,
                  },
                ],
                onClick: ({ key }) => {
                  if (key === "settings") onTabChange(TabView.SETTINGS);
                  if (key === "logout") onLogout();
                },
              }}
            >
              <div className="flex items-center space-x-3 pl-1 cursor-pointer">
                <Avatar style={{ backgroundColor: "#2563eb" }}>
                  {userEmail.charAt(0).toUpperCase()}
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-slate-700 leading-none">
                    {userEmail.split("@")[0]}
                  </span>
                  <span className="text-xs text-slate-400 mt-0.5">Admin</span>
                </div>
              </div>
            </Dropdown>
          </div>
        </AntLayout.Header>
        <AntLayout.Content className="overflow-hidden p-4 sm:p-6 bg-slate-50">
          <div className="bg白 shadow-sm border border-slate-200 rounded-xl h-full overflow-hidden relative">
            {children}
          </div>
        </AntLayout.Content>
        <AntLayout.Footer className="bg-slate-50 py-3 px-6 text-center text-xs text-slate-400 border-t border-slate-200/50">
          {t.layout.footer}
        </AntLayout.Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
