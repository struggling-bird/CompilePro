# 项目结构说明

## 顶层目录
- `backend/`：后端服务根目录（NestJS + TypeScript）
- `frontend/`：前端工程（与后端接口交互，不在本文展开）

## 后端主要文件与目录
- `src/main.ts`：应用入口，注册全局校验与统一响应拦截器、Swagger 文档（`src/main.ts:9`）
- `src/app.module.ts`：根模块，注册 Config/TypeORM/Cache/Logger/Auth/Users/Roles/Audit 等模块（`src/app.module.ts:15`）
- `src/app.controller.ts`、`src/app.service.ts`：示例基础控制器与服务

### 认证与用户
- `src/auth/`：认证模块
  - `auth.module.ts`：JWT/Passport 配置，依赖注入（`src/auth/auth.module.ts:13`）
  - `auth.controller.ts`：注册、登录、当前用户接口（`src/auth/auth.controller.ts:13`）
  - `auth.service.ts`：登录校验、令牌签发（`src/auth/auth.service.ts:21`）
  - `authenticated.guard.ts`：统一认证守卫（继承 `AuthGuard('jwt')`）
  - `jwt.strategy.ts`：JWT 校验策略（从 Header 中提取 Bearer Token）
  - `dto/`：登录/注册 DTO（中文注释与示例）
- `src/users/`：用户模块
  - `users.module.ts`、`users.controller.ts`、`users.service.ts`
  - `user.entity.ts`：用户实体（用户名、密码、邮箱、状态、角色、创建时间）
  - `dto/`：用户响应、更新状态、分配角色 DTO

### 角色与权限
- `src/roles/`：角色管理
  - `role.entity.ts`：角色实体（名称、描述、权限配置）
  - `roles.module.ts`、`roles.controller.ts`、`roles.service.ts`
  - `dto/`：创建角色、更新权限 DTO

### 审计与日志
- `src/audit/`：审计日志模块
  - `audit.entity.ts`：审计日志实体（操作、目标用户、操作者、详情、时间）
  - `audit.module.ts`、`audit.service.ts`：记录用户状态与角色变更
- `src/logger/`：Winston 日志
  - `logger.module.ts`、`logger.provider.ts`：每日滚动、控制台输出，参数由环境变量控制
- `src/shared/`：共享拦截器与工具
  - `api-response.interceptor.ts`：统一响应结构（成功/失败）（`src/shared/api-response.interceptor.ts:18`）
  - `request-logging.interceptor.ts`：请求日志（方法、路径、状态码、耗时）

### 缓存与基础设施
- `src/redis/`：Redis 客户端封装（`ioredis`），提供 `get/set/del` 基本能力
- `CacheModule`：全局缓存（`cache-manager-redis-yet`），在 `app.module.ts` 注册，默认 TTL 30 秒

## 配置与环境
- `.env.dev`：开发环境配置（`DB_SYNC=true`、`DB_MIGRATIONS_RUN=false`、日志 `debug` 等）
- `.env`：生产环境配置（`DB_SYNC=false`、`DB_MIGRATIONS_RUN=true`、构建混淆与压缩开启）
- `ConfigModule.forRoot`：根据 `NODE_ENV` 加载对应文件（`src/app.module.ts:17`）
- 重要配置项：数据库（MySQL）、Redis、日志、JWT、构建产物控制

## 构建与脚本
- `package.json`：脚本与依赖
  - `build`：TypeScript 编译产出 `dist`
  - `build:prod`：编译 → 代码混淆 → 产物压缩（受环境变量开关控制）
- `scripts/obfuscate.js`：对 `dist/*.js` 执行混淆
- `scripts/archive.js`：打包 `dist` 为 `artifacts/dist.tar.gz`

## 测试
- `test/`：测试目录
  - `app.e2e-spec.ts`：基础 E2E 测试
  - `auth.e2e-spec.ts`：注册、登录、鉴权失败、停用登录失败 E2E 测试
  - `jest-e2e.json`：E2E 测试配置

## 文档
- `docs/development-guidelines.md`：开发规范手册（模块划分、校验与文档规范、缓存与性能、日志与错误处理）
- `docs/authentication.md`：登录与鉴权机制说明（JWT、守卫、策略、接口与错误码）
- `README.md`：项目概述与使用指南

## 运行与访问
- 开发：`npm run start:dev`，文档：`http://localhost:3000/api`
- 生产：`NODE_ENV=production` 使用 `.env`，可执行 `npm run build:prod` 生成产物后部署
- 前端请求适配统一响应：`frontend/utils/request.ts:39`
