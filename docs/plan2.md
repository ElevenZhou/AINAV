# ai搭子 · AI中文导航站 — 完整建设规划

> 目标：建设一个"收录快、检索快、可运营变现、可被 Agent 调用"的中文 AI 导航站。  
> 技术选型：**Next.js + NestJS + PostgreSQL + Meilisearch + Redis**，单体模块化架构快速上线，后按流量拆分独立服务。

---

## 核心需求矩阵

| 需求 | 对应模块 | 处理阶段 |
|------|----------|----------|
| 响应快速 | SSR/SSG + CDN + Redis 分层缓存 | Phase 0 / Phase 3 |
| 及时收录 | 双入口采集流水线 + 审核队列 | Phase 2 |
| 后台管理 | 审核台、工具管理、广告管理 | Phase 5 |
| 广告位 | 首页横幅、信息流、详情侧栏、专区专题位 | Phase 3 / Phase 5 |
| 站内搜索 | Meilisearch + 中文同义词/容错/联想词 | Phase 4 |
| 每日经典案例 | 案例结构 + 定时发布 + 历史归档 | Phase 6 |
| Agent 访问端口 | REST API + Webhook + API Key 治理 | Phase 7 |
| claw 专区 | OpenClaw / 智能体工具专区 | Phase 1 / Phase 3 |

---

## Phase 0 — 目标与 KPI 冻结（第 1 周）

**目的：** 在敲第一行业务代码前对齐验收口径，避免后期返工。

### 首期验收指标

| 指标 | 目标值 |
|------|--------|
| 首屏 TTFB | ≤ 200ms（CDN 命中） |
| 搜索 P95 延迟 | ≤ 300ms |
| 热点工具收录可见 | ≤ 6 小时（SLA A 档） |
| 普通工具收录可见 | ≤ 24 小时（SLA B 档） |
| 平均后台审核时长 | ≤ 4 小时 |
| Agent API 可用性 | ≥ 99.9% |
| 广告位填充率 | ≥ 80%（首期） |

### MVP 范围边界

- **包含：** PC + 移动 Web、无登录投稿端、核心导航 + 搜索 + 案例
- **排除（首期）：** 移动 App、复杂推荐算法、RTB 竞价广告、MCP 接口、用户注册体系

---

## Phase 1 — 信息架构与数据模型（第 1–2 周）

### 频道体系

```
首页
├── 分类聚合页（对话/绘图/视频/编程/设计/…）
├── 工具详情页
├── claw 专区（OpenClaw / 智能体工具）
├── 每日经典案例（今日案例 + 历史归档）
├── 站内搜索结果页
├── 提交收录页
└── 关于与商务合作页
```

### 核心数据实体

| 实体 | 关键字段 |
|------|----------|
| Tool（工具） | id, name, slug, url, description, category, tags, status, updatedAt |
| Category（分类） | id, name, slug |
| Tag（标签） | id, name, slug |
| DailyCase（每日案例） | id, title, scenario, prompt, outputSample, steps, relatedToolIds, publishedAt |
| AdSlot（广告位） | id, code, name, enabled |
| AuditLog（审核记录） | id, toolId, action, operator, note, createdAt |
| ApiCallLog（接口日志） | id, apiKey, endpoint, statusCode, latencyMs, createdAt |

### 工具状态流转

```
PENDING（待审核）
  ↓ 通过
PUBLISHED（已发布）
  ↓ 失效检测 / 手动下线
OFFLINE（下线）
  ↓ URL 复活
PUBLISHED
```

---

## Phase 2 — 采集与及时收录流水线（第 2–4 周）

### 双入口机制

```
自动采集（定时爬虫）  ─┐
人工后台录入 / CSV导入  ─┼──▶ 统一审核队列 ──▶ 一审发布 ──▶ 已发布
用户前台提报（二期）   ─┘
```

### 去重与质检策略

- 同域名聚合：相同 host 视为同一工具
- 标题相似度 > 0.85 触发去重提示
- 可访问性检测：HTTP 200 / 301 通过，4xx/5xx 拦截
- 风险词拦截：违规关键词自动拒绝并记录

### 增量更新策略

| 分类热度 | 巡检频率 | 失效复检 |
|----------|----------|----------|
| 高热（Top 20%） | 1–3 小时 | 每日批量 |
| 普通 | 6–24 小时 | 每日批量 |

### 运营看板指标

新增收录数 · 审核通过率 · 平均审核时长 · 链接失效率 · 日活跃收录来源数

---

## Phase 3 — 前台与性能（第 3–5 周）

### 渲染策略

| 页面 | 策略 | 缓存 TTL |
|------|------|----------|
| 首页 | SSR + Redis | 60 秒 |
| 分类页 | SSR + Redis | 60 秒 |
| 工具详情 | ISR | 5 分钟 |
| claw 专区 | SSR + Redis | 60 秒 |
| 每日案例 | ISR | 1 小时 |
| 搜索结果 | 客户端 CSR | 不缓存 |

### 性能策略

- CDN 分发静态资源与 API 响应
- Redis 两层缓存：L1 热门词（5s TTL）/ L2 分类列表（60s TTL）
- 图片懒加载 + WebP 格式
- 关键接口分页（page/limit）与字段裁剪（fields 参数）

### 广告位规划

| 位置代码 | 说明 | 尺寸建议 |
|----------|------|----------|
| AD_SLOT_HOME_TOP_BANNER | 首页顶部横幅 | 1200×90 |
| AD_SLOT_LIST_FEED_1 | 分类列表信息流第 5 位 | 卡片同尺寸 |
| AD_SLOT_DETAIL_SIDEBAR | 工具详情右侧 | 300×250 |
| AD_SLOT_CLAW_FEATURE | claw 专区专题位 | 灵活 |

---

## Phase 4 — 搜索系统（第 3–6 周）

### 索引字段

```json
{
  "searchableAttributes": ["name", "description", "tags", "category"],
  "displayedAttributes": ["id", "name", "slug", "description", "url", "updatedAt"],
  "filterableAttributes": ["category", "tags", "status"],
  "sortableAttributes": ["updatedAt", "hotScore"]
}
```

### 中文检索体验

- 同义词：ChatGPT ↔ GPT-4 ↔ 智能对话；Midjourney ↔ AI绘图
- 拼写容错（typoTolerance）：距离 2
- 前缀匹配（prefixSearch）：开启
- 联想词接口：`GET /api/v1/search/suggest?q=`
- 热门词榜（每日刷新 Top 20）

### 排序策略

```
综合分 = 0.5 × 相关度分 + 0.3 × 热度分 + 0.2 × 新鲜度分 + 运营加权
```

支持前端切换：**最相关 / 最新收录 / 最热门**

---

## Phase 5 — 后台管理与运营（第 4–7 周）

### 后台模块清单

| 模块 | 核心功能 |
|------|----------|
| 工具管理 | CRUD、批量审核、状态管理、标签绑定 |
| 分类 & 标签管理 | 层级分类维护、热词标签管理 |
| 审核台 | 待审队列、批量通过/拒绝、变更留痕 |
| 案例管理 | 创建/编辑、定时发布、置顶、历史档案 |
| 广告管理 | 广告位配置、投放排期、频控、曝/点统计 |
| 数据统计 | 收录趋势、搜索词分析、零结果监控、广告转化 |
| 系统配置 | 环境变量、巡检间隔、收录 SLA 阈值 |

### 审核流

```
待审 → [一审] → 发布
           ↓ 拒绝
       拒绝归档（含拒绝原因）
       （可选）二次复核流程
```

### 广告首期策略

- 固定排期（Flight Date 起止）
- 频控：单用户/天最多展示 N 次
- 曝光 & 点击计数（数据库 + Redis 计数）
- 手动上/下线，无 RTB

---

## Phase 6 — 每日经典案例（第 5–7 周）

### 案例数据结构

```typescript
interface DailyCase {
  id: string;
  title: string;
  summary: string;
  scenario: string;       // 行业/场景标签
  prompt: string;         // 输入提示词
  outputSample: string;   // 输出效果示例
  steps: string[];        // 复现步骤
  relatedToolIds: string[];
  riskNote?: string;      // 风险提示（可选）
  publishedAt: Date;
}
```

### 前台入口

- **今日案例** — 固定首页卡片位 + 一级导航入口
- **历史归档** — 按日期/行业/用途筛选
- **关联跳转** — 案例详情直达工具收录页

### 运营保障

- 后台支持定时发布（设置 publishedAt 未来时间）
- 支持置顶（pin）与快速下线
- 编辑留痕，防止误操作

---

## Phase 7 — Agent 访问端口（第 6–8 周）

### REST API（只读，v1）

| 端点 | 说明 |
|------|------|
| `POST /api/v1/agent/query` | 工具/案例/claw 查询，body 含 type + q |
| `GET /api/v1/tools` | 工具列表，支持 category/tag/sort 筛选 |
| `GET /api/v1/search?q=` | 全文搜索 |
| `GET /api/v1/cases/daily` | 获取今日案例 |
| `GET /api/v1/claw/featured` | claw 推荐工具列表 |
| `GET /api/v1/health` | 服务健康检查 |

### Webhook 事件

| 事件名 | 触发时机 |
|--------|----------|
| `tool.published` | 新工具审核通过并发布 |
| `case.published` | 每日案例定时发布触发 |
| `ad.config_changed` | 广告位配置变更 |

Webhook 请求头包含 `X-Webhook-Signature`，接收方需校验签名防重放。

### 接口治理

- 认证：`X-Api-Key` Header（服务端环境变量配置）
- 限流：QPS 100 / Key，超限返回 429
- 版本：URL 前缀 `/api/v1`，破坏性变更升版本号
- 审计：每次调用记录 apiKey、endpoint、latencyMs、statusCode
- 安全：仅开放只读能力；写接口（提报/修改）留待二期引入审批流

---

## Phase 8 — 上线与持续优化（第 8 周起）

### 灰度上线步骤

1. 上线核心频道（首页 + 分类 + 详情）
2. 开放站内搜索
3. 开放 Agent REST API
4. 开放 Webhook 推送

### 持续优化方向

| 问题信号 | 优化手段 |
|----------|----------|
| 零结果搜索词 | 补充同义词词典、补录相关工具 |
| 低质收录 | 审核标准收紧、失效率阈值告警 |
| 广告 CTR 低 | 广告素材 A/B 测试、位置调整 |
| 接口延迟上升 | Redis 缓存命中率排查、DB 慢查询治理 |

### 二期预研

- 用户投稿前台（带登录体系）
- MCP Server 接口（面向智谱/Claude Agent 生态）
- 个性化推荐（基于浏览历史）
- 商业化套餐（Premium 广告位 / API 调用配额包）

---

## 技术架构总览

```
┌─────────────────────────────────────────────────────────┐
│  CDN（静态资源 + API 响应缓存）                           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Next.js 前台 (apps/web)                                │
│  SSR / ISR / CSR 混合渲染                               │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP
┌────────────────────▼────────────────────────────────────┐
│  NestJS API (apps/api)  /api/v1                         │
│  tools · search · cases · ads · agent · claw            │
└──────┬──────────┬──────────────┬───────────────────────┘
       │          │              │
┌──────▼───┐ ┌───▼────────┐ ┌──▼───────┐
│PostgreSQL│ │Meilisearch │ │  Redis   │
│(Prisma)  │ │(搜索索引)  │ │(缓存/限流)│
└──────────┘ └────────────┘ └──────────┘
```

---

## 关键决策记录

| 决策项 | 结论 | 原因 |
|--------|------|------|
| 前端框架 | Next.js 15 | SSR/ISR/RSC 渲染灵活，SEO 友好 |
| 后端框架 | NestJS 11 | 模块化、TypeScript 原生、装饰器清晰 |
| 数据库 | PostgreSQL + Prisma | 成熟稳定，类型安全迁移 |
| 搜索引擎 | Meilisearch | 中文友好、轻量易部署、API 简洁 |
| 缓存 | Redis | 分层缓存 + 限流计数 |
| Agent 接口方式 | REST + Webhook | 通用性最高，易被第三方集成 |
| claw 专区定位 | OpenClaw/智能体工具 | 契合自动化 Agent 生态热度 |
| 广告策略首期 | 固定排期 + 频控 | 先验证流量，不引入 RTB 复杂度 |
| 收录 SLA | 热点 ≤6h，普通 ≤24h | 量化运营口径，避免执行歧义 |
