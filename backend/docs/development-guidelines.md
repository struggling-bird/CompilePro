# 开发规范手册

## 架构与模块
- 按业务域拆分模块：Controller（入参与路由）、Service（业务逻辑）、Repository/Entity（数据访问）
- 使用依赖注入与模块化组织，避免跨模块直接耦合

## 统一响应结构
- 所有接口返回 `ApiResponse<T>`：`code`、`message`、`data`、`timestamp`
- 通过全局拦截器统一处理：`src/shared/api-response.interceptor.ts:16`

## Swagger 规范
- 每个接口补充完整注解：`@ApiTags`、`@ApiOperation`、`@ApiParam`、`@ApiQuery`、`@ApiBody`、`@ApiResponse`
- 调整入参/出参时同步更新文档
- 文档地址：`/api`

## DTO 与校验
- 使用 `class-validator` + `class-transformer` 在 DTO 上进行参数校验与转换
- 路由参数（`@Param`）、查询参数（`@Query`）、请求体（`@Body`）分职责使用
- 全局 `ValidationPipe`：白名单、类型转换、禁止未声明字段：`src/main.ts:12`

## 身份认证与授权
- 所需认证的接口统一使用 `AuthenticatedGuard`
- 推荐集成 `Passport.js` + JWT/OAuth2，细粒度控制

## 数据库与迁移
- 实体定义位于 `src/users/user.entity.ts:1` 等，包含类型、约束
- 开发环境可使用 `synchronize: true`；生产环境必须改为 Migration
- 复杂查询封装在 Repository 层，避免在 Service 层直接写 SQL

## 缓存与性能
- 全局缓存启用（Redis），默认 TTL 30 秒：`src/app.module.ts:12`
- 高频 GET 接口可通过 `@CacheTTL`、`@CacheKey` 定制策略：`src/users/users.controller.ts:9`
- 对列表分页添加必要索引；避免全表扫描

## 日志与监控
- Winston + 每日滚动，支持 JSON 文本格式切换：`src/logger/logger.provider.ts:26`
- 请求耗时与状态码日志：`src/shared/request-logging.interceptor.ts:1`
- 日志参数从 `.env` 读取，支持保留与压缩策略

## 错误处理
- 自定义业务异常与统一错误码（1xx 参数错误、2xx 业务错误、5xx 系统错误）
- 非预期错误通过全局拦截器脱敏返回，同时记录详细日志（不含敏感信息）

## 代码规范
- TypeScript 严格模式；禁止 `any` 滥用
- ESLint + Prettier：`npm run lint`
- 命名与结构遵循高内聚、低耦合原则

## 测试
- 使用 Jest；为核心接口编写单测覆盖正常与异常路径：`npm run test`
- 覆盖率建议 ≥ 80%

## 构建与发布
- 开发构建：`npm run build`
- 生产构建：`npm run build:prod`（代码混淆与压缩，产物位于 `artifacts/`）
- 通过 `.env` 控制混淆与压缩行为

## 提交前检查
- 执行 `npm run lint` 与 `npm run test`，确保无语法错误与失败用例

