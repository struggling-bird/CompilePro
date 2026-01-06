# 登录与鉴权机制说明

## 概述
- 本系统采用 JWT 作为认证方式，所有受保护接口通过 `AuthenticatedGuard` 校验请求头中的 Bearer Token。
- 统一响应结构：成功 `{ code: 200, message: 'success', data, timestamp }`；失败 `{ code, message, timestamp }`。

## 架构组成
- 控制器：`auth.controller` 提供注册、登录、获取当前用户信息
- 服务：`auth.service` 实现登录校验与令牌签发，`users.service` 提供用户数据读写
- 守卫：`AuthenticatedGuard` 基于 Passport `jwt` 策略进行鉴权
- 策略：`JwtStrategy` 从 Header `Authorization: Bearer <token>` 提取并校验令牌

## 配置项
- `JWT_SECRET`：JWT 签名密钥（生产环境必须使用强随机值）
- `JWT_EXPIRES_IN`：令牌过期时间（单位：秒，默认 `604800` 即 7 天）
- 环境文件加载：生产环境使用 `.env`，开发环境使用 `.env.dev`

## 接口说明
- 注册：`POST /auth/register`
  - 请求体：`{ username, password, email, roleName? }`
  - 返回：`{ id }`
- 登录：`POST /auth/login`
  - 请求体：`{ username, password }`
  - 返回：`{ token }`
- 当前用户：`GET /auth/me`（需认证）
  - Header：`Authorization: Bearer <token>`
  - 返回：`{ id, username, email, status, role, createdAt }`

## 业务校验与错误码
- 登录校验：
  - 用户不存在 → `404`
  - 用户停用（inactive）→ `403`
  - 密码错误 → `401`
- 拦截器统一失败响应：`{ code: <httpStatus>, message, timestamp }`

## 角色与权限
- 角色实体：`name`、`description?`、`permissions(json)`
- 管理接口：
  - 创建角色：`POST /roles`
  - 更新权限：`PUT /roles/:name/permissions`
  - 分配角色：`PUT /users/:id/role`
- 可扩展基于 `permissions` 的守卫，对接口访问进行细粒度控制

## 用户状态
- 状态字段：`active | inactive`
- 更新状态接口：`PUT /users/:id/status`（需认证）
- 登录时状态校验：`inactive` 用户登录返回 `403`

## 审计日志
- 记录用户状态变更与角色分配操作：`action`、`userId`、`actorId`、`details`、`createdAt`
- 用于后续安全审计与问题追踪

## 示例
```bash
# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"P@ssw0rd"}'

# 鉴权访问当前用户
curl http://localhost:3000/api/auth/me \
  -H 'Authorization: Bearer <token>'

# 停用用户
curl -X PUT http://localhost:3000/api/users/<id>/status \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"status":"inactive"}'

# 分配角色
curl -X PUT http://localhost:3000/api/users/<id>/role \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"roleName":"admin"}'
```

## 安全建议
- 禁止在日志中记录敏感信息（密码、密钥、完整令牌）
- 生产环境务必启用强随机的 `JWT_SECRET`，合理设置过期时间与刷新机制
- 对高价值操作（如权限变更、停用用户）进行审计与告警
