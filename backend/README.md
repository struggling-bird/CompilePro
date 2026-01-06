# CompilePro 后端服务

## 概述
NestJS + TypeScript + MySQL + Redis 的后端服务，支持统一响应结构、DTO 校验、Swagger 文档、全局缓存与日志滚动，提供生产构建的代码混淆与产物压缩。

## 技术栈
- NestJS 11（依赖注入、模块化、拦截器、管道、守卫）
- TypeORM（MySQL）
- Redis（ioredis + cache-manager-redis-yet）
- Swagger（@nestjs/swagger）
- ESLint + Prettier
- Jest 单元测试
- Winston + 日志每日滚动

## 快速开始
1. 安装依赖：`npm install`
2. 配置环境：复制 `.env.example` 为 `.env` 并按需修改
3. 开发构建：`npm run build`
4. 启动开发：`npm run start:dev`
5. 文档地址：`http://localhost:3000/api`

## 环境变量
详见 `.env.example`，包含数据库连接、Redis 配置、日志参数、产物构建控制项等。

## 模块结构
- `src/app.module.ts`：全局模块注册（Config、TypeORM、Cache、Logger、业务模块）
- `src/users/*`：示例用户模块（Controller/Service/Entity/DTO）
- `src/shared/api-response.interceptor.ts`：统一响应拦截器
- `src/shared/request-logging.interceptor.ts`：请求日志拦截器
- `src/redis/*`：Redis 服务封装
- `src/logger/*`：Winston 日志适配器

## 统一响应结构
通过拦截器统一输出：
```
{
  code: number,
  message: string,
  data?: any,
  timestamp: number
}
```

## Swagger 规范
- 使用 `@ApiTags`、`@ApiOperation`、`@ApiParam`、`@ApiQuery`、`@ApiBody`、`@ApiResponse`
- 文档路由：`/api`

## 缓存策略
- 全局缓存启用，默认 TTL 30 秒
- 可在控制器方法上通过 `@CacheTTL` 与 `@CacheKey` 覆盖

## 构建与部署
- 开发构建：`npm run build`
- 生产构建（混淆+压缩）：`npm run build:prod`
  - 受 `.env` 的 `OBFUSCATE_ENABLED/ARCHIVE_ENABLED/ARCHIVE_NAME` 控制
  - 产物位置：`artifacts/dist.tar.gz`

## 测试与质量
- 代码检查：`npm run lint`
- 单元测试：`npm run test`

## 参考代码位置
- `src/main.ts:9` 引导应用、全局管道与拦截器、Swagger 初始化
- `src/app.module.ts:12` 注册 Config/Cache/TypeORM/Logger 模块
- `src/users/users.controller.ts:9` 用户详情接口，启用缓存与 Swagger 注解

## 安全与配置管理
- 严禁在代码或日志中输出敏感信息（例如数据库密码、令牌）
- `.env` 不应提交到仓库，使用 `.env.example` 作为参考

