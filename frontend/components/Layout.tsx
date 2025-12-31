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
  UserOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { TabView } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import styles from "./Layout.module.less";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  userEmail: string;
  userRoleName?: string;
  isSuperAdmin?: boolean;
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
  userRoleName,
  isSuperAdmin,
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["team"]); // Track expanded parent menus
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  const navConfig: NavItemConfig[] = [
    {
      id: "metaProjects",
      labelKey: "metaProjects",
      icon: AppstoreOutlined,
      tab: TabView.META_PROJECTS,
    },
    {
      id: "templates",
      labelKey: "templates",
      icon: LayoutOutlined,
      tab: TabView.TEMPLATES,
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

  const menuItems = useMemo(() => {
    return navConfig.map((item) => {
      // @ts-ignore
      const label = t.layout[item.labelKey] || item.labelKey;
      const Icon = item.icon;
      if (item.children) {
        return {
          key: item.id,
          icon: <Icon style={{ fontSize: 20 }} />,
          label,
          children: item.children.map((child) => {
            const ChildIcon = child.icon;
            // @ts-ignore
            const childLabel = t.layout[child.labelKey] || child.labelKey;
            return {
              key: child.tab!,
              icon: <ChildIcon style={{ fontSize: 16 }} />,
              label: childLabel,
            };
          }),
        } as any;
      }
      return {
        key: item.tab!,
        icon: <Icon style={{ fontSize: 20 }} />,
        label,
      } as any;
    });
  }, [t, navConfig]);

  return (
    <AntLayout className={styles.layoutContainer}>
      <AntLayout.Sider
        theme="dark"
        width={256}
        collapsible
        collapsed={isCollapsed}
        onCollapse={(c) => setIsCollapsed(c)}
        collapsedWidth={64}
        breakpoint="lg"
        trigger={null}
        className={styles.sider}
      >
        <div className={styles.logoWrapper}>
          <div className={styles.logoIcon}>Z</div>
          <span
            className={styles.logoText}
            style={{
              opacity: isCollapsed ? 0 : 1,
              width: isCollapsed ? 0 : "auto",
            }}
          >
            ZhugeIO
          </span>
        </div>

        <div className={styles.collapseTrigger}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <RightOutlined /> : <LeftOutlined />}
          </button>
        </div>

        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[activeTab]}
          openKeys={isCollapsed ? [] : expandedMenus}
          onOpenChange={(keys) => setExpandedMenus(keys as string[])}
          items={menuItems}
          onClick={({ key }) => {
            const k = key as TabView;
            if (Object.values(TabView).includes(k)) {
              onTabChange(k);
              if (k === TabView.META_PROJECTS) navigate("/meta-projects");
              else if (k === TabView.TEMPLATES) navigate("/templates");
              
              else if (k === TabView.CUSTOMERS) navigate("/customers");
              else if (k === TabView.MEMBERS) navigate("/members");
              else if (k === TabView.ROLES) navigate("/roles");
              else if (k === TabView.SETTINGS) navigate("/settings");
            }
          }}
          inlineCollapsed={isCollapsed}
          style={{ height: "calc(100% - 64px)", borderRight: 0 }}
        />
      </AntLayout.Sider>

      <AntLayout>
        <AntLayout.Header className={styles.header}>
          <div className={styles.headerRight}>
            <Button
              size="small"
              onClick={toggleLanguage}
              icon={<GlobalOutlined />}
            >
              {language === "en" ? "EN" : "中文"}
            </Button>

            <div className={styles.divider} />

            <Dropdown
              menu={{
                items: [
                  {
                    key: "settings",
                    label: t.layout.settings,
                    icon: <SettingOutlined />,
                  },
                  ...(isSuperAdmin
                    ? [
                        {
                          key: "systemSettings",
                          label: t.layout.systemSettings || "System Settings",
                          icon: <ToolOutlined />,
                        },
                      ]
                    : []),
                  { type: "divider" },
                  {
                    key: "logout",
                    label: t.layout.logout,
                    icon: <LogoutOutlined />,
                    danger: true,
                  },
                ],
                onClick: ({ key }) => {
                  if (key === "settings") {
                    onTabChange(TabView.SETTINGS);
                    navigate("/settings");
                  }
                  if (key === "systemSettings") {
                    onTabChange(TabView.SETTINGS);
                    navigate("/settings/system");
                  }
                  if (key === "logout") onLogout();
                },
              }}
            >
              <Avatar
                style={{ backgroundColor: "#3b82f6", cursor: "pointer" }}
                size="default"
              >
                {userEmail.charAt(0).toUpperCase()}
              </Avatar>
            </Dropdown>
          </div>
        </AntLayout.Header>

        <AntLayout.Content className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </AntLayout.Content>

        <AntLayout.Footer className={styles.footer}>
          {t.layout.footer}
        </AntLayout.Footer>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
