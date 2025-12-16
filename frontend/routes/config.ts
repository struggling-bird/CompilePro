import React, { lazy } from "react";
import { TabView } from "../types";

export type Meta = {
  auth: "public" | "private";
  tab?: TabView;
  title?: string;
};

export type RouteItem = {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  meta: Meta;
};

const Pages = {
  Login: lazy(() => import("../pages/Login")),
  Register: lazy(() => import("../pages/Register")),
  MetaProjectList: lazy(() => import("../pages/MetaProjects/List")),
  MetaProjectDetail: lazy(() => import("../pages/MetaProjects/Detail")),
  TemplateList: lazy(() => import("../pages/Templates/List")),
  TemplateDetail: lazy(() => import("../pages/Templates/Detail")),
  ManageList: lazy(() => import("../pages/Manage/List")),
  DeploymentDetail: lazy(() => import("../pages/Manage/DeploymentDetail")),
  BuildHistory: lazy(() => import("../pages/Manage/BuildHistory")),
  BuildExecution: lazy(() => import("../pages/Manage/BuildExecution")),
  CustomerList: lazy(() => import("../pages/Customers/List")),
  CustomerDetail: lazy(() => import("../pages/Customers/Detail")),
  EnvironmentList: lazy(() => import("../pages/Customers/Environments/List")),
  EnvironmentDetail: lazy(
    () => import("../pages/Customers/Environments/Detail")
  ),
  MemberList: lazy(() => import("../pages/Members/List")),
  MemberDetail: lazy(() => import("../pages/Members/Detail")),
  RoleList: lazy(() => import("../pages/Roles/List")),
  RoleDetail: lazy(() => import("../pages/Roles/Detail")),
  SettingsPage: lazy(() => import("../pages/Settings")),
};

export const routes: RouteItem[] = [
  { path: "/login", component: Pages.Login, meta: { auth: "public" } },
  { path: "/register", component: Pages.Register, meta: { auth: "public" } },

  {
    path: "/meta-projects",
    component: Pages.MetaProjectList,
    meta: { auth: "private", tab: TabView.META_PROJECTS },
  },
  {
    path: "/meta-projects/:projectId",
    component: Pages.MetaProjectDetail,
    meta: { auth: "private", tab: TabView.META_PROJECTS },
  },

  {
    path: "/templates",
    component: Pages.TemplateList,
    meta: { auth: "private", tab: TabView.TEMPLATES },
  },
  {
    path: "/templates/new",
    component: Pages.TemplateDetail,
    meta: { auth: "private", tab: TabView.TEMPLATES },
  },
  {
    path: "/templates/:templateId",
    component: Pages.TemplateDetail,
    meta: { auth: "private", tab: TabView.TEMPLATES },
  },

  {
    path: "/manage",
    component: Pages.ManageList,
    meta: { auth: "private", tab: TabView.MANAGE },
  },
  {
    path: "/manage/new",
    component: Pages.DeploymentDetail,
    meta: { auth: "private", tab: TabView.MANAGE },
  },
  {
    path: "/manage/:deployId",
    component: Pages.DeploymentDetail,
    meta: { auth: "private", tab: TabView.MANAGE },
  },
  {
    path: "/manage/:deployId/history",
    component: Pages.BuildHistory,
    meta: { auth: "private", tab: TabView.MANAGE },
  },

  {
    path: "/customers",
    component: Pages.CustomerList,
    meta: { auth: "private", tab: TabView.CUSTOMERS },
  },
  {
    path: "/customers/new",
    component: Pages.CustomerDetail,
    meta: { auth: "private", tab: TabView.CUSTOMERS },
  },
  {
    path: "/customers/:customerId",
    component: Pages.CustomerDetail,
    meta: { auth: "private", tab: TabView.CUSTOMERS },
  },
  {
    path: "/customers/:customerId/environments",
    component: Pages.EnvironmentList,
    meta: { auth: "private", tab: TabView.CUSTOMERS },
  },
  {
    path: "/customers/:customerId/environments/new",
    component: Pages.EnvironmentDetail,
    meta: { auth: "private", tab: TabView.CUSTOMERS },
  },
  {
    path: "/customers/:customerId/environments/:envId",
    component: Pages.EnvironmentDetail,
    meta: { auth: "private", tab: TabView.CUSTOMERS },
  },

  {
    path: "/members",
    component: Pages.MemberList,
    meta: { auth: "private", tab: TabView.MEMBERS },
  },
  {
    path: "/members/new",
    component: Pages.MemberDetail,
    meta: { auth: "private", tab: TabView.MEMBERS },
  },
  {
    path: "/members/:memberId",
    component: Pages.MemberDetail,
    meta: { auth: "private", tab: TabView.MEMBERS },
  },

  {
    path: "/roles",
    component: Pages.RoleList,
    meta: { auth: "private", tab: TabView.ROLES },
  },
  {
    path: "/roles/new",
    component: Pages.RoleDetail,
    meta: { auth: "private", tab: TabView.ROLES },
  },
  {
    path: "/roles/:roleId",
    component: Pages.RoleDetail,
    meta: { auth: "private", tab: TabView.ROLES },
  },

  {
    path: "/build/:deployId",
    component: Pages.BuildExecution,
    meta: { auth: "private", tab: TabView.MANAGE },
  },
  {
    path: "/settings",
    component: Pages.SettingsPage,
    meta: { auth: "private", tab: TabView.SETTINGS },
  },
];

export const publicRoutes = routes.filter((r) => r.meta.auth === "public");
export const privateRoutes = routes.filter((r) => r.meta.auth === "private");
