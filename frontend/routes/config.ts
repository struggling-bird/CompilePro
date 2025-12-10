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
  CompileList: lazy(() => import("../pages/CompileList")),
  ProjectDetail: lazy(() => import("../pages/ProjectDetail")),
  TemplateList: lazy(() => import("../pages/TemplateList")),
  TemplateDetail: lazy(() => import("../pages/TemplateDetail")),
  ManageList: lazy(() => import("../pages/ManageList")),
  DeploymentDetail: lazy(() => import("../pages/DeploymentDetail")),
  BuildHistory: lazy(() => import("../pages/BuildHistory")),
  BuildExecution: lazy(() => import("../pages/BuildExecution")),
  CustomerList: lazy(() => import("../pages/CustomerList")),
  CustomerDetail: lazy(() => import("../pages/CustomerDetail")),
  MemberList: lazy(() => import("../pages/MemberList")),
  MemberDetail: lazy(() => import("../pages/MemberDetail")),
  RoleList: lazy(() => import("../pages/RoleList")),
  RoleDetail: lazy(() => import("../pages/RoleDetail")),
};

export const routes: RouteItem[] = [
  { path: "/login", component: Pages.Login, meta: { auth: "public" } },
  { path: "/register", component: Pages.Register, meta: { auth: "public" } },

  {
    path: "/compile",
    component: Pages.CompileList,
    meta: { auth: "private", tab: TabView.COMPILE },
  },
  {
    path: "/compile/:projectId",
    component: Pages.ProjectDetail,
    meta: { auth: "private", tab: TabView.COMPILE },
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
