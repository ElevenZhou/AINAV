# ai搭子 (AInav)

中文 AI 导航站首期实现骨架，目标覆盖：
- 高响应前台（Next.js）
- 及时收录与后台管理（NestJS API）
- 站内搜索（Meilisearch）
- 每日经典案例
- 广告位与投放基础
- Agent 访问端口（REST + Webhook）
- claw 专区（OpenClaw/智能体工具）

## Tech Stack

- Frontend: Next.js 15 + React 19
- Backend: NestJS 11 + Prisma + PostgreSQL
- Search: Meilisearch
- Cache/Queue prep: Redis

## 目录

- apps/web: 前台
- apps/api: 后台与开放接口
- infra: 本地依赖编排
- docs: 需求与接口文档

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 拷贝环境变量

```bash
cp .env.example .env
```

3. 启动基础依赖

```bash
npm run start:infra
```

4. 初始化数据库与搜索索引（Windows）

```powershell
npm run bootstrap:db:win
```

5. 启动 API

```bash
npm run dev:api
```

6. 启动 Web

```bash
npm run dev:web
```

## 回归检查（Windows）

```powershell
# 全量：包含构建 + 启动 + 关键 API/页面探测
npm run check:regression:win

# 已手动启动基础设施时可跳过 infra
powershell -ExecutionPolicy Bypass -File .\scripts\regression-check.ps1 -SkipInfraStartup
```

## 停止本地服务

```powershell
# 停止本地 3000/3001 端口服务
npm run stop:local

# 停止 Docker 基础设施
npm run stop:infra
```

## 当前里程碑

- [x] 项目骨架
- [x] 模块化 API 占位接口
- [x] 首页与频道入口占位
- [x] Prisma migration 与种子数据
- [x] 管理后台 UI
- [ ] 采集任务与审核流
