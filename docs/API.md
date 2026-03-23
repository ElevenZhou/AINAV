# ai搭子 API 文档

> API 基础路径：`http://localhost:3001/api/v1`  
> 所有响应均为 `application/json`

---

## 目录

- [工具 API](#工具-api)
- [分类 API](#分类-api)
- [案例 API](#案例-api)
- [搜索 API](#搜索-api)
- [广告 API](#广告-api)
- [爪专区 API](#爪专区-api)
- [Agent API](#agent-api)
- [管理 API（需鉴权）](#管理-api需鉴权)

---

## 工具 API

### 获取工具列表

```
GET /tools
```

查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码 |
| `limit` | number | 20 | 每页数量（最大 100） |
| `categoryId` | string | — | 按分类 ID 筛选 |
| `status` | string | `PUBLISHED` | 状态筛选（公开接口固定为 PUBLISHED） |

响应示例：
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "ChatGPT",
      "slug": "chatgpt",
      "url": "https://chat.openai.com",
      "description": "OpenAI 出品的对话式 AI 助手",
      "iconUrl": null,
      "hotScore": 99,
      "viewCount": 12500,
      "isClaw": false,
      "status": "PUBLISHED",
      "category": { "id": "uuid", "name": "AI 对话", "slug": "ai-chat" },
      "tags": [{ "id": "uuid", "name": "免费" }]
    }
  ],
  "total": 27,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

### 获取热门工具

```
GET /tools/top?limit=12
```

返回按 `hotScore` 降序的 TOP N 工具列表（数组格式）。

---

### 获取工具详情

```
GET /tools/:slug
```

返回工具完整信息，同时异步增加 `viewCount`。

404 示例：
```json
{ "statusCode": 404, "message": "Tool not found" }
```

---

## 分类 API

### 获取所有分类

```
GET /categories
```

返回所有分类数组，每个分类含 `_count.tools` 字段。

响应示例：
```json
[
  {
    "id": "uuid",
    "name": "AI 对话",
    "slug": "ai-chat",
    "iconEmoji": "💬",
    "description": "对话式 AI 助手",
    "sortOrder": 1,
    "_count": { "tools": 5 }
  }
]
```

---

### 获取分类详情（含工具）

```
GET /categories/:slug
```

返回分类信息及该分类下所有 `PUBLISHED` 工具。

---

## 案例 API

### 获取案例列表

```
GET /cases
```

查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | number | 1 | 页码 |
| `limit` | number | 12 | 每页数量 |
| `scenario` | string | — | 按场景类型筛选 |

---

### 获取今日案例

```
GET /cases/today
```

优先返回 `isPinned=true` 的案例，否则返回最新发布的案例。

---

### 获取案例场景列表

```
GET /cases/scenarios
```

返回所有不重复的场景字符串数组，用于筛选器。

---

### 获取案例详情

```
GET /cases/:id
```

返回案例完整信息，含 `steps`（数组）、`prompt`、`outputSample`、`riskNote`、`relatedToolSlugs`（数组）。

---

## 搜索 API

### 全文搜索

```
GET /search?q=ChatGPT&page=1&limit=20
```

查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `q` | string | — | 搜索关键词（必填） |
| `page` | number | 1 | 页码 |
| `limit` | number | 20 | 每页数量 |

响应示例：
```json
{
  "query": "ChatGPT",
  "hits": [ { ...工具对象... } ],
  "total": 5,
  "page": 1,
  "processingTimeMs": 3
}
```

后端使用 Meilisearch，若服务不可用自动降级到 PostgreSQL `LIKE` 查询。

---

## 广告 API

### 获取指定广告位的广告

```
GET /ads/slot/:slotCode
```

内置 Slot Code（见管理文档）。返回当前有效的广告对象，若无则返回 `null`。  
**注意**：此接口会自动记录一次曝光（`impressionCount + 1`）。

响应示例：
```json
{
  "id": "uuid",
  "title": "品牌推广",
  "imageUrl": "https://example.com/banner.png",
  "linkUrl": "https://example.com",
  "description": "广告描述文字"
}
```

---

### 记录广告点击

```
POST /ads/click/:adId
```

无需请求体，将 `clickCount + 1`。

---

## 爪专区 API

### 获取爪专区工具列表

```
GET /claw?page=1&limit=20
```

返回所有 `isClaw=true` 且状态为 `PUBLISHED` 的工具，分页格式同工具列表。

---

### 获取爪专区精选

```
GET /claw/featured?limit=6
```

返回精选爪工具数组。

---

## Agent API

> 所有 Agent API 需要请求头 `x-api-key: <AGENT_API_KEY>`

### 查询接口

```
POST /agent/query
Header: x-api-key: <key>
Content-Type: application/json
```

请求体：
```json
{
  "type": "tools",
  "query": "图像生成工具",
  "limit": 5
}
```

`type` 可选值：

| type | 说明 |
|------|------|
| `tools` | 搜索工具列表 |
| `cases` | 搜索案例 |
| `claw` | 爪专区工具 |
| `search` | 全文搜索 |

---

### Webhook 接入

```
POST /agent/webhook
Header: x-api-key: <key>
       x-webhook-signature: <HMAC-SHA256-hex>
```

签名方式：对请求体 JSON 字符串使用 `HMAC-SHA256`，密钥为 `WEBHOOK_SIGNING_SECRET`。

---

## 管理 API（需鉴权）

> 所有管理 API 需要请求头 `x-admin-key: <ADMIN_SECRET>`

### 统计数据

```
GET /admin/stats
```

返回：
```json
{
  "tools": 27,
  "pendingTools": 3,
  "cases": 5,
  "ads": 4,
  "categories": 8
}
```

---

### 工具管理

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/admin/tools?page=1&limit=20` | 获取工具列表（含 PENDING） |
| `GET` | `/admin/tools/pending` | 获取待审核工具 |
| `POST` | `/admin/tools` | 新增工具 |
| `PUT` | `/admin/tools/:id` | 更新工具 |
| `POST` | `/admin/tools/:id/approve` | 审核通过（发布） |
| `POST` | `/admin/tools/:id/reject` | 拒绝（Body: `{ "note": "原因" }`） |
| `POST` | `/admin/tools/:id/offline` | 下线 |

新增/更新工具请求体：
```json
{
  "name": "工具名称",
  "slug": "tool-slug",
  "url": "https://example.com",
  "description": "工具描述",
  "categoryId": "uuid",
  "iconUrl": "https://...",
  "isClaw": false
}
```

---

### 案例管理

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/admin/cases?page=1&limit=20` | 案例列表 |
| `POST` | `/admin/cases` | 新增案例 |
| `PUT` | `/admin/cases/:id` | 更新案例 |
| `DELETE` | `/admin/cases/:id` | 删除案例 |

新增/更新案例请求体：
```json
{
  "title": "案例标题",
  "scenario": "内容创作",
  "summary": "场景摘要",
  "prompt": "核心提示词",
  "outputSample": "输出示例",
  "steps": ["步骤一", "步骤二"],
  "relatedToolSlugs": ["chatgpt", "midjourney"],
  "riskNote": "注意事项（可选）",
  "publishedAt": "2024-01-01T00:00:00Z",
  "isPinned": false
}
```

---

### 广告管理

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/admin/ads/slots` | 广告位列表 |
| `POST` | `/admin/ads/slots` | 新建广告位 |
| `GET` | `/admin/ads` | 广告列表 |
| `POST` | `/admin/ads` | 新建广告 |
| `PUT` | `/admin/ads/:id` | 更新广告（含状态、时间） |

---

### 分类管理

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/admin/categories` | 分类列表 |
| `POST` | `/admin/categories` | 新建分类 |
| `PUT` | `/admin/categories/:id` | 更新分类 |
| `DELETE` | `/admin/categories/:id` | 删除分类 |

---

### 搜索索引

```
POST /admin/search/sync
```

触发将所有 `PUBLISHED` 工具同步到 Meilisearch 索引。

---

### 审核日志

```
GET /admin/audit-logs?page=1&limit=20
```

返回工具审核操作记录（操作人、操作类型、时间、备注）。
