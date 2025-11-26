## 前端（React）实时日志方案
- 日志通道统一改为 WebSocket，替代或禁用 SSE。
- 客户端封装 `LogSocketClient`：
  - 连接：`ws://<host>/ws`，携带 `token`（Query 或受控 Cookie）。
  - 订阅：发送 `{type:"subscribe", buildId}`，支持多任务并行订阅与取消订阅。
  - 心跳与重连：`ping/pong` 心跳，指数退避重连；连接态与光标持久化。
  - 消息格式：`{type:"log", buildId, ts, level, stage, line, cursor}`；错误 `{type:"error", code, message}`；结束 `{type:"end", buildId}`。
  - 渲染：按 `stage` 分段，支持关键字过滤与导出；溢出缓冲控制。
- 权限：无令牌或令牌过期自动跳转登录；按钮级授权控制订阅操作。
- 页面调整：`/builds/:id` 使用 WebSocket 流；日志视图支持断点续订与下载。

## 后端（Node.js）WebSocket 服务
- 技术选型：
  - NestJS：`@nestjs/websockets` + `ws` 适配器；多实例使用 `@socket.io/redis-adapter` 或自研 Redis Pub/Sub。
  - Express：`ws` 或 `socket.io`；推荐 `ws` + Redis Pub/Sub。
- 连接与认证：
  - 握手校验 JWT（Query `token` 或 Cookie）；校验通过后建立连接，失败关闭并审计。
  - 来源校验与速率限制（登录/订阅），避免暴力连接。
- 订阅协议：
  - 客户端发送 `{type:"subscribe", buildId}`；服务端校验权限（项目资源执行权限）。
  - 服务端按 `buildId` 绑定订阅，推送日志消息；支持 `{type:"unsubscribe", buildId}`。
- 日志推送与扩展：
  - Worker 分阶段产生日志，通过 Redis Pub/Sub 将 `{buildId, ts, level, stage, line, cursor}` 推送至 WS 层。
  - 断点续传：客户端提供 `cursor`，服务端从最近缓存位置续推（短期内存或持久化部分日志片段）。
  - 流控：每连接消息速率阈值与队列长度限制，超限丢弃或降采样并告警。
- 审计与安全：连接、订阅、取消订阅、异常断开均写入审计；日志消息仅包含必要字段，避免泄露敏感信息。

## 后端接口文档生成
- OpenAPI 3.0/3.1（REST）：
  - NestJS：集成 `@nestjs/swagger`，自动从 DTO 与装饰器生成；提供 `GET /docs`（Swagger UI）与 `GET /openapi.json`。
  - Express：使用 `swagger-jsdoc`（基于 JSDoc 或 YAML 注释） + `swagger-ui-express`；`GET /docs` 与 `GET /openapi.json`。
  - 安全方案：`BearerAuth`（JWT）；全局响应与错误结构；示例与枚举。
- AsyncAPI（WebSocket/事件）：
  - 描述 WS 通道、消息 schema 与事件流；可选提供 `GET /asyncapi.yaml` 与 UI（如 Redocly/AsyncAPI Studio）。
- 生成与校验：
  - 脚本：`npm run docs:openapi`（输出 JSON/YAML）与 `npm run docs:asyncapi`（可选）。
  - CI 校验：PR 自动校验文档变更与路由一致性，防止接口漂移。

## 文档更新内容
- 前端文档：将 SSE 改为 WebSocket；新增客户端设计、消息协议、心跳与重连、权限与安全、缓冲与导出。
- 后端文档：新增 WebSocket 服务章节（握手、订阅协议、流控、断点续传、审计、安全）；新增 OpenAPI/AsyncAPI 生成与发布章节、依赖与脚本。

## 验收与测试
- 前端：在 `/builds/:id` 连接 WS，订阅并接收日志；断线重连成功；导出日志正确。
- 后端：
  - WS：无 Token 拒绝；有 Token 连接成功；无权限订阅拒绝；日志实时推送；`end` 事件触发；审计可查询。
  - 文档：`/docs` 可访问 Swagger UI；`/openapi.json` 返回有效文档；（可选）`/asyncapi.yaml` 返回事件文档。
- 性能：并发 1000 连接下延迟与丢包率可控；流控策略有效。

## 交付项
- 更新后的 `docs/前端技术设计.md` 与 `docs/后端技术设计.md`。
- 后端文档生成管线脚本与示例配置（不改代码时以计划说明为主）。

请确认以上方案，我将据此更新技术设计文档并准备后端文档生成与 WS 接入的实现细节。