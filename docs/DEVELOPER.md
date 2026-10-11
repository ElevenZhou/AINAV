# ai搭子 — 开发者指南

> 本文档面向接手/维护该项目的开发者，覆盖环境搭建、架构说明、常用命令和关键约定。

---

## 目录

1. [项目概览](#项目概览)
2. [技术栈](#技术栈)
3. [目录结构](#目录结构)
4. [快速启动](#快速启动)
5. [环境变量](#环境变量)
6. [数据库](#数据库)
7. [后端 API 模块说明](#后端-api-模块说明)
8. [前端页面说明](#前端页面说明)
9. [管理后台](#管理后台)
10. [搜索系统](#搜索系统)
11. [广告系统](#广告系统)
12. [Agent 接入](#agent-接入)
13. [常用命令速查](#常用命令速查)
14. [部署说明](#部署说明)

---

## 项目概览

**ai搭子** 是一个中文 AI 工具导航网站，核心功能：

| 功能 | 说明 |
|------|------|
| 工具收录 | 分类展示 AI 工具，支持标签、热度排序 |
| 每日案例 | 典型使用场景 + 提示词 + 步骤 |
| 站内搜索 | Meilisearch 全文检索，降级到数据库 LIKE |
| 爪专区 | 专门收录 AI Agent / 自动化工具 |
| 广告位 | 多槽位广告管理，按展示/点击计费 |
| 管理后台 | 工具审核、内容管理、数据统计 |
| Agent API | 供第三方 LLM Agent 调用的结构化接口 |

---

## 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| 前端框架 | Next.js (App Router) | 15.1.6 |
| 前端语言 | TypeScript + React | 19 |
| 后端框架 | NestJS | 11 |
| ORM | Prisma | 6 |
| 数据库 | PostgreSQL | 16 |
| 搜索引擎 | Meilisearch | 1.9 |
| 缓存 | Redis | 7（预留，暂未启用） |
| 基础设施 | Docker Compose | — |

---

## 目录结构

```
AInav/
├── apps/
│   ├── web/                  # Next.js 前端
│   │   ├── app/              # App Router 页面
│   │   │   ├── page.tsx      # 首页
│   │   │   ├── tools/        # 工具列表 + 详情
│   │   │   ├── cases/        # 案例列表 + 详情
│   │   │   ├── category/     # 分类页
│   │   │   ├── search/       # 搜索页
│   │   │   ├── claw/         # 爪专区
│   │   │   └── admin/        # 管理后台（纯前端，x-admin-key 鉴权）
│   │   ├── components/ui/    # 公共组件
│   │   └── lib/api.ts        # API 请求封装
│   └── api/                  # NestJS 后端
│       ├── src/
│       │   ├── modules/      # 业务模块
│       │   │   ├── tools/    # 工具模块
│       │   │   ├── cases/    # 案例模块
│       │   │   ├── search/   # 搜索模块
│       │   │   ├── ads/      # 广告模块
│       │   │   ├── claw/     # 爪专区模块
│       │   │   ├── agent/    # Agent API 模块
│       │   │   ├── categories/ # 分类模块
│       │   │   └── admin/    # 管理接口模块
│       │   └── common/prisma/ # PrismaService（全局注入）
│       └── prisma/
│           ├── schema.prisma # 数据库模型
│           └── seed.ts       # 种子数据
├── infra/
│   └── docker-compose.yml   # PostgreSQL + Meilisearch + Redis
├── docs/                    # 文档
└── scripts/                 # 初始化脚本
```

---

## 快速启动

### 前提条件

- Node.js 20+
- Docker Desktop（运行基础设施）
- npm 10+

### 步骤

```bash
# 1. 克隆仓库并安装依赖
git clone <repo>
cd AInav
npm install

# 2. 复制并编辑环境变量
cp .env.example .env
# 至少确保 ADMIN_SECRET 已修改

# 3. 启动基础设施（PostgreSQL + Meilisearch + Redis）
npm run start:infra

# 4. 初始化数据库（迁移 + 种子数据）
# Windows（包含 Prisma migrate + seed + 搜索索引同步）：
npm run bootstrap:db:win

# 5. 启动开发环境
npm run dev:api    # 后端 http://localhost:3001
npm run dev:web    # 前端 http://localhost:3000
```

---

## 环境变量

所有变量在根目录 `.env.example` 中有说明，以下是关键变量：

| 变量名 | 示例值 | 用途 |
|--------|--------|------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/aidazi_nav` | Prisma 连接字符串 |
| `MEILI_HOST` | `http://localhost:7700` | Meilisearch 地址 |
| `MEILI_API_KEY` | `masterKey` | Meilisearch 主密钥 |
| `ADMIN_SECRET` | `changeme-admin-2024` | 管理后台 `x-admin-key` 密钥 |
| `ADMIN_EMAIL` | `admin@ainav.local` | 种子脚本创建默认管理员账号 |
| `ADMIN_PASSWORD_HASH` | `<bcrypt-hash>` | 默认管理员密码哈希（可选） |
| `AGENT_API_KEY` | `strong-random-key` | Agent API `x-api-key` 密钥 |
| `WEBHOOK_SIGNING_SECRET` | `strong-random-secret` | Webhook 签名密钥 |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | 前端调用 API 的基础路径 |
| `REDIS_URL` | `redis://localhost:6379` | Redis 地址（预留）|

---

## 数据库

### Prisma 数据模型（11 个）

| 模型 | 说明 |
|------|------|
| `Category` | 工具分类（8 个默认分类） |
| `Tag` | 工具标签（免费/国产/开源等） |
| `Tool` | 核心工具表，含 `isClaw`/`hotScore`/`status` |
| `User` | 管理员/用户账号（角色：`USER` / `ADMIN`） |
| `ToolTag` | 工具-标签多对多 |
| `AuditLog` | 工具审核日志 |
| `DailyCase` | 每日案例 |
| `AdSlot` | 广告位定义 |
| `Ad` | 广告内容 |
| `ApiCallLog` | Agent API 调用日志 |
| `WebhookSubscription` | Webhook 订阅 |

### 常用迁移命令

```bash
cd apps/api

# 开发迁移（自动命名）
npx prisma migrate dev

# 生成 Prisma Client
npx prisma generate

# 查看数据库（图形界面）
npx prisma studio

# 重新执行种子数据
npx ts-node prisma/seed.ts
```

### 工具状态流转

```
提交 → PENDING → (管理员审核) → PUBLISHED
                             → REJECTED (拒绝)
PUBLISHED → (管理员操作) → OFFLINE
OFFLINE   → (管理员操作) → PUBLISHED
```

---

## 后端 API 模块说明

### 全局配置

- **API 前缀**：`/api/v1`
- **全局验证管道**：`ValidationPipe({ whitelist: true })`
- **端口**：`process.env.PORT ?? 3001`

### 模块列表

| 模块 | 路径 | 说明 |
|------|------|------|
| Tools | `/api/v1/tools` | 工具 CRUD、分页、热度排序 |
| Categories | `/api/v1/categories` | 分类列表和详情 |
| Cases | `/api/v1/cases` | 每日案例列表和详情 |
| Search | `/api/v1/search` | Meilisearch 全文搜索 |
| Ads | `/api/v1/ads` | 广告位展示和点击记录 |
| Claw | `/api/v1/claw` | 爪专区工具（isClaw=true） |
| Agent | `/api/v1/agent` | LLM Agent 调用接口 |
| Admin | `/api/v1/admin` | 管理 CRUD（需 `x-admin-key`） |

---

## 前端页面说明

| 路由 | 渲染策略 | 说明 |
|------|----------|------|
| `/` | SSR（每次请求） | 首页：分类、热门工具、今日案例 |
| `/tools` | SSR（动态） | 工具列表，支持分类筛选 + 分页 |
| `/tools/[slug]` | SSR（动态） | 工具详情 + 相关推荐 |
| `/category/[slug]` | SSG（`generateStaticParams`） | 分类页，构建时预生成 |
| `/cases` | SSR（动态） | 案例列表，场景筛选 |
| `/cases/[id]` | SSR（动态） | 案例详情 |
| `/search` | CSR（带 Suspense） | 搜索结果页 |
| `/claw` | SSR（动态） | 爪专区，分页 |
| `/admin/*` | CSR（`'use client'`） | 管理后台，LocalStorage 存储 admin key |

### API 请求封装

所有数据请求通过 `apps/web/lib/api.ts` 统一封装，基础 URL 为 `process.env.NEXT_PUBLIC_API_URL`。

---

## 管理后台

### 访问

浏览器打开 `http://localhost:3000/admin`，在输入框填入 `ADMIN_SECRET` 值即可。

### 功能

| 页面 | 功能 |
|------|------|
| `/admin` | 统计概览（工具数/案例数/广告数），快捷操作 |
| `/admin/tools` | 工具列表 + 新增 + 审核（通过/拒绝/下线） |
| `/admin/cases` | 案例 CRUD，支持置顶 |
| `/admin/ads` | 广告位管理 + 广告内容管理 |
| `/admin/categories` | 分类 CRUD（名称/Slug/Emoji 图标） |

### 鉴权机制

所有 `/api/v1/admin/*` 接口要求请求头 `x-admin-key: <ADMIN_SECRET>`。  
前端将 admin key 存储在浏览器 `localStorage['admin_key']`。

---

## 搜索系统

SearchService 实现双层搜索：

1. **Meilisearch**（优先）：通过 `@meilisearch/meilisearch` 客户端查询 `tools` 索引
2. **PostgreSQL LIKE**（降级）：当 Meilisearch 不可用时，自动切换到 `name LIKE` 查询

**同步索引**：
```bash
# 通过管理 API 触发全量同步
curl -X POST http://localhost:3001/api/v1/admin/search/sync \
  -H "x-admin-key: <ADMIN_SECRET>"
```

新工具审核通过时会自动触发单条同步。

---

## 广告系统

### 广告位 Slot Code（内置）

| Slot Code | 位置说明 |
|-----------|----------|
| `HOME_BANNER` | 首页顶部横幅 |
| `LIST_SIDEBAR` | 列表页侧栏 |
| `LIST_FEED_1` | 列表页信息流 |
| `DETAIL_BOTTOM` | 详情页底部 |

### 数据流

```
客户端请求广告 → GET /api/v1/ads/slot/:slotCode
→ AdsService 查找该 slotCode 下状态为 ACTIVE 的广告
→ 返回广告数据 + 记录 impression

用户点击广告 → POST /api/v1/ads/click/:adId
→ clickCount + 1
```

---

## Agent 接入

### 查询接口

```
POST /api/v1/agent/query
Header: x-api-key: <AGENT_API_KEY>
Body: {
  "type": "tools" | "cases" | "claw" | "search",
  "query": "搜索关键词",
  "limit": 10
}
```

### Webhook 接口

```
POST /api/v1/agent/webhook
Header: x-api-key: <AGENT_API_KEY>
       x-webhook-signature: <HMAC-SHA256>
```

---

## 常用命令速查

```bash
# 根目录
npm run dev:web          # 启动前端开发服务器
npm run dev:api          # 启动后端开发服务器
npm run build:web        # 构建前端
npm run build:api        # 构建后端
npm run start:infra      # 启动 Docker 基础设施
npm run check:regression:win  # Windows 一键回归检查
npm run stop:local       # 停止 3000/3001 本地服务

# apps/api
cd apps/api
npx prisma studio        # 数据库图形界面
npx prisma migrate dev   # 开发环境迁移
npx prisma generate      # 重新生成 Prisma Client
npx ts-node prisma/seed.ts  # 填充种子数据
npm run build            # NestJS 编译验证

# apps/web
cd apps/web
npm run build            # Next.js 生产构建验证
npm run lint             # ESLint 检查
```

### 回归脚本常用参数（Windows）

```powershell
# 跳过 infra 启动（本机已有数据库/搜索服务时）
powershell -ExecutionPolicy Bypass -File .\scripts\regression-check.ps1 -SkipInfraStartup

# 跳过构建（仅做可达性）
powershell -ExecutionPolicy Bypass -File .\scripts\regression-check.ps1 -SkipBuild

# 检查后保留服务运行
powershell -ExecutionPolicy Bypass -File .\scripts\regression-check.ps1 -KeepRunning
```

### 常见报错排查

- `Docker command not found`：未安装 Docker Desktop。安装后重试，或使用 `-SkipInfraStartup` 并确保本地 PostgreSQL 已启动。
- `Database is not reachable on localhost:5432`：数据库未启动。执行 `npm run start:infra` 或启动本地 PostgreSQL。
- `DATABASE_URL is not configured`：检查根目录 `.env`（脚本会在 `.env` 缺失时临时回退读取 `.env.example`）。

---

## 部署说明

### 生产环境推荐

1. **数据库**：托管 PostgreSQL（如 Supabase / Neon / Railway）
2. **Meilisearch**：Meilisearch Cloud 或自托管（推荐 ≥ 1 GB RAM）
3. **前端**：Vercel（直接连接 GitHub，自动 CI/CD）
4. **后端**：Railway / Render / Docker 自托管

### 关键生产变量

```env
NODE_ENV=production
DATABASE_URL=<生产数据库连接串>
MEILI_HOST=<生产 Meilisearch 地址>
ADMIN_SECRET=<强随机密钥，至少 32 位>
AGENT_API_KEY=<强随机密钥>
WEBHOOK_SIGNING_SECRET=<强随机密钥>
NEXT_PUBLIC_API_URL=<生产 API 域名>/api/v1
```

> **安全提示**：生产环境务必修改所有默认密钥，不要将 `.env` 提交到代码仓库。
