# 文件管理系统技术架构及使用说明

## 1. 系统架构概览 (System Architecture)

文件管理模块 (`StorageModule`) 采用**分层架构**与**策略模式**设计，旨在提供高扩展性、安全可靠的文件存储服务。系统支持多存储后端（目前实现本地存储），并集成了安全防护、性能优化及自动化运维能力。

### 1.1 核心组件
- **Controller Layer (`StorageController`)**: 处理 HTTP 请求，集成鉴权 (`AuthenticatedGuard`)、防重放 (`ReplayGuard`) 及 Swagger 文档。
- **Service Layer (`StorageService`)**: 负责业务逻辑，包括元数据管理、加密/解密流处理、临时文件生命周期管理及缩略图生成。
- **Strategy Layer (`StorageStrategy`)**:
  - **Interface**: 定义 `upload`, `download`, `delete`, `exists` 等标准行为。
  - **Implementation**: `LocalStorageStrategy` 实现本地文件系统操作。
  - **Resolver**: `StorageStrategyResolver` 根据配置动态解析存储策略，便于扩展对象存储（如 AWS S3, OSS）。
- **Data Layer (`FileEntity`)**: 基于 TypeORM 的实体定义，记录文件元数据、校验和、加密状态及扫描结果。

### 1.2 关键技术特性
- **流式处理**: 上传/下载均采用 Stream 处理，通过 `ThrottleTransform` 实现下载限速。
- **安全加密**: 支持基于 AES-256-CTR 的透明加解密，密钥与 IV 分离存储。
- **完整性校验**: 上传时自动计算 MD5 和 SHA256 校验和。
- **图片处理**: 集成 `sharp` 库，支持动态缩略图生成、格式转换（WebP）及 EXIF 读取。
- **临时文件管理**: 支持设置临时文件 TTL，配合定时任务 (`Cron`) 自动清理过期文件。

---

## 2. 核心功能详解

### 2.1 文件上传流程
1. **拦截与校验**: 使用 `Multer` 进行内存缓冲，校验 MIME 类型与文件大小。
2. **加密决策**: 根据 MIME 类型配置决定是否加密（AES-256-CTR）。
3. **策略分发**: 通过 `StorageStrategy` 将文件写入物理存储（本地路径规则：`type/YYYY/MM/DD`）。
4. **元数据落库**: 生成 UUID 文件名，记录原始名、大小、路径、校验和 (MD5/SHA256) 及加密 IV。
5. **审计日志**: 记录上传操作审计信息。

### 2.2 文件下载流程
1. **权限与防重放**: 校验用户身份及 `X-Request-Id`。
2. **断点续传**: 支持 HTTP `Range` 头，实现分片下载。
3. **流式解密/传输**: 若文件加密，下载流会自动解密（透明传输）。
4. **限速控制**: 支持 `limitKbps` 参数或全局配置限制下载速率。

---

## 3. 数据库设计 (`FileEntity`)

| 字段名 | 类型 | 说明 | 备注 |
| :--- | :--- | :--- | :--- |
| `id` | UUID | 主键 | |
| `originalName` | Varchar(255) | 原始文件名 | |
| `filename` | Varchar(255) | 系统生成文件名 | UUID + 扩展名 |
| `mimetype` | Varchar(100) | MIME 类型 | |
| `size` | BigInt | 文件大小 | 字节 |
| `path` | Varchar(500) | 存储路径 | 相对路径或 Key |
| `storageType` | Varchar(50) | 存储类型 | 默认 'local' |
| `isTemp` | Boolean | 是否临时文件 | |
| `expiresAt` | Timestamp | 过期时间 | 仅临时文件有效 |
| `isEncrypted` | Boolean | 是否加密 | |
| `encryptionIv` | Varchar(32) | 加密 IV | Hex 格式 |
| `checksumMd5` | Varchar(64) | MD5 校验和 | |
| `checksumSha256` | Varchar(64) | SHA256 校验和 | |

---

## 4. API 接口说明

所有接口响应均遵循 `ApiResponse` 标准结构。

### 4.1 上传文件
- **URL**: `POST /storage/upload`
- **Content-Type**: `multipart/form-data`
- **Query 参数**:
  - `isTemp` (boolean, optional): 是否为临时文件（默认 false）。
- **Body**:
  - `files`: 文件数组（二进制）。
- **功能**: 支持多文件上传，自动按类型和日期归档。

### 4.2 下载文件
- **URL**: `GET /storage/download/:id`
- **Header**:
  - `Range`: `bytes=0-1024` (可选，支持断点续传)
- **Query 参数**:
  - `limitKbps` (number, optional): 限制下载速度（单位: kbps）。
- **响应头**: 包含 `Content-MD5`, `Digest` (SHA-256) 用于完整性校验。

### 4.3 图片预览
- **URL**: `GET /storage/preview/:id`
- **Query 参数**:
  - `w`: 宽度 (px)
  - `h`: 高度 (px, 可选)
- **功能**: 实时生成 WebP 格式缩略图并缓存（依赖 `sharp`）。

### 4.4 清理临时文件
- **URL**: `POST /storage/cleanup`
- **功能**: 手动触发过期临时文件清理任务（系统每小时自动执行一次）。

---

## 5. 配置说明 (Environment Variables)

系统行为可通过以下环境变量进行配置：

```env
# 存储基础配置
STORAGE_MAX_SIZE_MB=50              # 最大上传大小 (MB)
STORAGE_ALLOWED_TYPES=image/,...    # 允许的 MIME 类型
STORAGE_DEFAULT_TYPE=local          # 默认存储策略

# 临时文件配置
STORAGE_TEMP_TTL_HOURS=24           # 临时文件保留时长 (小时)

# 加密配置
STORAGE_ENCRYPTION_ENABLED=true     # 是否启用加密
STORAGE_ENCRYPTION_KEY=...          # 256位加密密钥 (Hex)
STORAGE_ENCRYPT_MIME_TYPES=...      # 指定加密的 MIME 类型 (空则全加密)

# 性能与下载配置
DOWNLOAD_LIMIT_KBPS=0               # 全局默认下载限速 (0为不限)
IMAGE_PREVIEW_QUALITY=80            # 缩略图质量 (1-100)
```

## 6. 共享组件 (`Shared Module`)

- **`ApiResponseInterceptor`**: 全局拦截器，统一将响应格式化为 `{ code: 200, message: 'success', data: ..., timestamp: ... }`，并处理异常转换。
- **`ReplayGuard`**: 基于 Redis 的防重放攻击守卫，验证 `X-Request-Id` header 的唯一性（5分钟有效期）。
