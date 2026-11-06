# 塔罗工具站完整实施方案（Cloudflare 全栈）

> 版本：v1.0  
> 日期：2026-11-06  
> 状态：可执行方案，先做小规模验证，不直接一次性铺大矩阵  
> 技术约束：运行、数据、存储、CDN、安全、AI、部署全部使用 Cloudflare。

## 0. 一句话方案

做一个**无需注册、打开即抽牌的 Tarot Card Generator**：

> 用户输入一个具体问题，洗牌、抽一张牌、得到正逆位、核心含义、行动建议和可分享结果；免费结果完成流量承接，付费深度报告完成变现。

首攻 `tarot card generator`，第二阶段承接 `free tarot reading`，`tarot yes or no` 等站点有权重后再进入。**不做泛 AI 塔罗 App，不做 78×78 薄组合页。**

---

## 1. 产品定位

### 1.1 目标用户

- 想快速获得一个 yes/no/maybe 或方向性提示的英文用户；
- 不想注册、不想留下邮箱、不想等待真人；
- 愿意为“更完整的解释、关系/事业/金钱场景化解读”支付小额费用；
- 主要市场先做美国，后续再做西班牙语、葡萄牙语和德语。

### 1.2 产品承诺

**5 秒内完成一次可理解、可分享、可继续追问的塔罗抽牌。**

### 1.3 不做什么

- 不做“万能 AI 塔罗聊天”，首版不让聊天成为主入口；
- 不做需要上传生日、照片、通讯录的重产品；
- 不做医疗、法律、投资、心理诊断建议；
- 不做 78 张牌 × 78 张牌的组合页面；
- 不用 AI 决定抽牌结果，不用 AI 编造牌义事实；
- 不依赖邮件营销或账号体系完成首版闭环。

---

## 2. 关键词与页面优先级

数据口径必须分开记录，不能把 Semrush KD、哥飞 KD、Google Keyword Planner 月搜混成一个数。

| 关键词 | 美国月搜 | 哥飞 KD | 其他口径 | 阶段 | 决策 |
|---|---:|---:|---|---|---|
| `tarot card generator` | 9.9K（Semrush 精确） | 34.4 | Semrush KD 51、CPC $2.06 | Phase 1 | 首攻工具页 |
| `free tarot reading` | 40.5K（Semrush 精确） | 38.9 | 快照族量约 49.5K–50K | Phase 2 | 第二入口，不按空白市场看 |
| `tarot reading` | 33.1K（Semrush 精确） | 45.7 | Semrush KD 74、CPC $7.11 | Phase 3 | 变现大词，站点有权重后打 |
| `tarot yes or no` | 18.1K（Semrush 精确） | 54.8 | 与 `yes or no tarot` 共用 SERP | Phase 2/3 | 不是首轮 KPI |
| `free tarot yes or no readings` | Planner 14.8K | 14.7（历史） | 趋势接近 0、低出价、族量回落 | 暂不主攻 | 只做辅助长尾 |
| `free psychic reading` | 9.9K（Semrush） | 34.7（历史） | 高 CPC，适合后续商业页 | Phase 3 | 后续高价值入口 |
| `ai tarot reading` | 1.3K | 41.3（历史） | 趋势回落 | 观察 | 不投 |

### 2.1 关键纠错

`tarot yes or no` 与 `yes or no tarot` 基本共用同一页 SERP。Semrush 曾给两个语序分别报出 KD 7 和 KD 61，这两个数不能当成两个独立机会。以哥飞 KD、实际 SERP、平台固定位和可争位为准。

### 2.2 90 天目标

- `tarot card generator` 进入前 20；
- `free tarot reading` 获得稳定曝光和索引；
- 30 个核心内容页完成收录；
- 免费抽牌完成率 ≥ 70%；
- 结果分享率 ≥ 3%；
- 付费报告转化率 ≥ 1%；
- LCP p75 ≤ 2.5 秒，INP ≤ 200ms，CLS ≤ 0.1。

`tarot yes or no` 进入前 20 不作为首轮 KPI。该 SERP 有 Reddit、YouTube 等平台位，剩余位置多为 DR 57–74 的老站，等站点 DR 到 25–30 后再打。

---

## 3. 信息架构与 URL

### 3.1 页面结构

| URL | 页面任务 | 索引 |
|---|---|---|
| `/` | Tarot Card Generator，核心抽牌入口 | index |
| `/free-tarot-reading` | 免费塔罗阅读说明和抽牌入口 | index |
| `/cards/` | 牌义索引页 | index |
| `/cards/{card-slug}/` | 单张牌完整牌义：正位、逆位、爱情、事业、金钱、常见问题 | index |
| `/spreads/one-card/` | 单牌阵 | index |
| `/spreads/three-card/` | 三牌阵 | index |
| `/spreads/celtic-cross/` | 凯尔特十字 | index |
| `/questions/love/` | 爱情问题入口 | index |
| `/questions/career/` | 事业问题入口 | index |
| `/questions/money/` | 金钱问题入口 | index |
| `/tarot-yes-or-no/` | Yes/No 专门工具，Phase 2 上线 | index，条件触发 |
| `/reading/{token}/` | 用户本次结果 | noindex |
| `/report/{token}/` | 付费报告或报告下载 | noindex |
| `/methodology/` | 算法、随机性、AI 使用、限制 | index |
| `/about/` | 作者、编辑、联系方式 | index |
| `/privacy/`、`/terms/`、`/disclaimer/`、`/refund/` | 法务 | index |
| `/admin/` | 内部数据、内容、订单 | Cloudflare Access 保护 |

### 3.2 首版页面数量

- **工具页**：首页、free tarot reading、3 个牌阵页；
- **牌义页**：先做 22 张大阿卡纳 + 8 张高意图小阿卡纳，共 30 页；
- **问题页**：爱情、事业、金钱、关系决策 4 页；
- **方法说明与法务**：5 页；
- **付费结果页**：动态生成，不进入站点地图。

首版不做 78×78 组合页。小阿卡纳 78 张的工具数据可以全部存在 D1，但 SEO 页面按验证结果逐步开放。

### 3.3 页面质量门槛

每个牌义页至少具备：

- 独立标题、meta description、H1；
- 600–900 字原创解释，不使用模板替换生成整段；
- 正位、逆位、爱情、事业、金钱、yes/no 六个模块；
- 一个可操作抽牌 CTA；
- 2–4 个相关牌、牌阵和问题页内链；
- 真实更新时间、作者/编辑说明；
- 不开空页面、不以占位文本上线。

---

## 4. 用户流程

### 4.1 免费抽牌

1. 用户从首页、牌义页或搜索结果进入；
2. 选择问题类型：general / love / career / money / decision；
3. 可选输入一句问题，默认不保存原始问题；
4. 点击 Draw a Card；
5. Worker 校验 Turnstile 和 rate limit；
6. Worker 在边缘用加密安全随机数抽牌；
7. 返回牌面、正逆位、三行摘要、完整解释、行动建议；
8. 用户可复制、下载分享图、重置或做第二次抽牌；
9. 结果页出现一次性的深度报告 CTA，不打断免费结果。

### 4.2 付费报告

1. 用户点击 `Get the full reading`；
2. Worker 创建 report 记录；
3. 跳转 Stripe Checkout；
4. Stripe webhook 到 Cloudflare Worker；
5. Worker 校验签名并写入 D1；
6. Queue 触发 Cloudflare Workflow；
7. Workflow 依次完成：校验订单 → 组装结构化牌义 → Workers AI 生成解释 → 规则校验 → 保存 R2 → 生成短期签名链接；
8. 用户回到 `/report/{token}/` 查看报告；
9. 失败自动重试，用户可凭 token 再次访问。

### 4.3 分享

- 分享页只展示牌面、摘要和站点品牌，不展示用户原始问题；
- `/reading/{token}/` 设置 `noindex, follow`；
- 分享图由 Worker 即时生成或由 Queue 异步生成后写入 R2；
- 图片不得包含敏感问题、个人姓名、生日或支付信息。

---

## 5. Cloudflare 技术架构

### 5.1 架构图

```text
Browser
  │
  ▼
Cloudflare DNS / CDN / WAF / Cache Rules
  │
  ▼
Cloudflare Worker（Astro SSR + API）
  ├── Static Assets：SEO 页面、牌义页、静态资源
  ├── D1：牌、阅读记录、订单、内容版本
  ├── KV：配置、feature flag、短缓存
  ├── R2：分享图、报告、导出文件、备份
  ├── Cloudflare Images：牌面图和响应式图片
  ├── Queues：异步报告、分享图、事件聚合
  ├── Workflows：付费报告和可重试任务
  ├── Workers AI ── AI Gateway：报告生成与质量日志
  ├── Turnstile：抽牌和支付前的人机校验
  ├── Analytics Engine / Web Analytics：产品与 SEO 观测
  └── Cloudflare Access：/admin 内部后台

Stripe Checkout / Webhook 是唯一支付轨道；它不承载网站、数据库或文件。
```

### 5.2 组件职责

| Cloudflare 产品 | 用途 |
|---|---|
| Registrar + DNS | 域名、DNS、SSL |
| WAF + Bot Management | 规则防护、恶意流量、异常请求 |
| Rate Limiting | 抽牌、报告、事件接口限流 |
| Turnstile | 免登录人机校验 |
| Workers + Static Assets | 页面、API、边缘逻辑 |
| Workers Builds | 连接 Git，自动构建和发布 |
| D1 | 关系数据、阅读记录、订单、内容版本 |
| KV | 轻量配置、页面片段的短缓存 |
| R2 | 图片、报告、备份、导出文件 |
| Cloudflare Images | 牌面图、响应式尺寸、CDN 分发 |
| Queues | 报告、分享图、清理任务异步执行 |
| Workflows | 付费报告的可重试流水线 |
| Workers AI | 付费报告的受控文本生成 |
| AI Gateway | 模型请求缓存、观测、限流和错误分析 |
| Vectorize | Phase 2 的牌义语义检索，不是首版必需 |
| Analytics Engine | 抽牌、转化、分享、错误等产品事件 |
| Web Analytics | 真实用户访问和 Core Web Vitals |
| Workers Logs / Logpush | 结构化日志和长期审计 |
| Cloudflare Access | 保护 `/admin` 和内部工具 |
| Email Routing | 只用于 support@ 收件，不承担用户事务邮件 |

### 5.3 为什么不用外部基础设施

- 不用 Vercel、Netlify、Supabase、Neon、Redis、S3 或独立 Node 服务器；
- 页面和 API 都在 Worker；
- 关系数据在 D1；
- 文件在 R2；
- 缓存和短配置在 KV；
- AI 在 Workers AI；
- 部署通过 Cloudflare Workers Builds；
- 域名、DNS、WAF、缓存、分析和安全都在 Cloudflare。

### 5.4 唯一的外部接口

Cloudflare 没有收单和银行卡支付产品。首版使用 Stripe Checkout 和 Stripe webhook，但网站、数据、文件、AI、部署、CDN、安全仍然全部在 Cloudflare。

如果“全部 Cloudflare”被严格解释为连支付也不能接第三方，那么这个产品无法首版收款。建议把 Stripe 限定为支付轨道，不引入任何外部后端。

---

## 6. 技术栈与项目结构

### 6.1 前端

- Astro + `@astrojs/cloudflare`；
- React/Svelte island 仅用于抽牌交互；
- 静态 SEO 页面在构建期生成；
- 客户端不直接访问 D1、KV 或 Workers AI；
- 所有写操作走同域 `/api/v1/*`；
- 不加载 Google Fonts、外部统计脚本或第三方 CDN。

选择 Astro 的原因：

- SEO 页面默认输出 HTML；
- 内容页和工具页可以分开渲染；
- 不需要为静态牌义页加载完整 SPA 运行时；
- Cloudflare Adapter 可直接部署到 Worker。

### 6.2 目录建议

```text
tarot-cloudflare/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── free-tarot-reading.astro
│   │   ├── cards/[slug].astro
│   │   ├── spreads/[slug].astro
│   │   ├── questions/[slug].astro
│   │   ├── methodology.astro
│   │   └── api/v1/
│   ├── components/
│   │   ├── DrawTool.tsx
│   │   ├── CardResult.tsx
│   │   ├── ShareCard.tsx
│   │   └── SeoLinks.astro
│   ├── lib/
│   │   ├── draw.ts
│   │   ├── interpretation.ts
│   │   ├── ai.ts
│   │   ├── auth.ts
│   │   ├── rate-limit.ts
│   │   └── schema.ts
│   └── content/
│       ├── cards/
│       ├── spreads/
│       └── questions/
├── migrations/
├── scripts/
│   ├── seed-d1.ts
│   ├── backup-d1-to-r2.ts
│   └── validate-content.ts
├── public/
├── wrangler.jsonc
└── astro.config.mjs
```

### 6.3 `wrangler.jsonc` 示意

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tarot-tools",
  "main": "./dist/_worker.js/index.js",
  "compatibility_date": "2026-11-06",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "404-page"
  },
  "d1_databases": [{
    "binding": "DB",
    "database_name": "tarot-db",
    "database_id": "REPLACE_WITH_D1_ID"
  }],
  "kv_namespaces": [{
    "binding": "CACHE",
    "id": "REPLACE_WITH_KV_ID"
  }],
  "r2_buckets": [{
    "binding": "MEDIA",
    "bucket_name": "tarot-media"
  }],
  "images": {
    "binding": "IMAGES"
  },
  "ai": {
    "binding": "AI"
  },
  "queues": {
    "producers": [{
      "binding": "REPORT_QUEUE",
      "queue": "tarot-reports"
    }],
    "consumers": [{
      "queue": "tarot-reports",
      "max_batch_size": 10,
      "max_batch_timeout": 30
    }]
  },
  "vars": {
    "ENVIRONMENT": "production",
    "SITE_URL": "https://example.com"
  },
  "observability": {
    "enabled": true
  }
}
```

实际部署时以当时 Wrangler schema 和 Cloudflare 控制台资源 ID 为准。

---

## 7. 数据模型

### 7.1 D1 表

```sql
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  arcana TEXT NOT NULL,
  suit TEXT,
  number INTEGER,
  upright_json TEXT NOT NULL,
  reversed_json TEXT NOT NULL,
  love_json TEXT NOT NULL,
  career_json TEXT NOT NULL,
  money_json TEXT NOT NULL,
  yes_no TEXT NOT NULL,
  image_key TEXT,
  seo_title TEXT,
  seo_description TEXT,
  content_version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE readings (
  id TEXT PRIMARY KEY,
  public_token TEXT UNIQUE,
  spread TEXT NOT NULL,
  question_type TEXT NOT NULL,
  cards_json TEXT NOT NULL,
  summary_json TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  utm_json TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT
);

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  reading_id TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  status TEXT NOT NULL,
  r2_key TEXT,
  workflow_id TEXT,
  amount_cents INTEGER,
  currency TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_name TEXT NOT NULL,
  reading_id TEXT,
  locale TEXT,
  route TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE content_versions (
  path TEXT PRIMARY KEY,
  content_hash TEXT NOT NULL,
  version INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_readings_created_at ON readings(created_at);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_events_name_time ON events(event_name, created_at);
```

### 7.2 数据原则

- 原始问题默认不落库；只存问题分类和脱敏后的长度/语言。
- IP 只存加盐 SHA-256，不与原始 IP 同时保存。
- 分享 token 与阅读记录分离，可单独撤销。
- 报告文件存 R2，D1 只存订单和 R2 key。
- 90 天后清理免费阅读记录；付费报告按税务和退款需要保留订单，正文文件可设 180 天过期。
- D1 每周导出到 R2，至少保留 4 周。

---

## 8. API 设计

| 方法 | 路径 | 作用 | 保护 |
|---|---|---|---|
| POST | `/api/v1/draw` | 抽牌并返回结果 | Turnstile、rate limit、idempotency key |
| GET | `/api/v1/readings/{token}` | 读取公开结果 | token、no-store |
| POST | `/api/v1/report/checkout` | 创建付费报告订单 | Turnstile、rate limit |
| POST | `/api/v1/webhooks/stripe` | 接收支付结果 | Stripe signature |
| GET | `/api/v1/report/{token}` | 获取报告状态/签名链接 | token、短 TTL |
| POST | `/api/v1/events` | 记录产品和 SEO 事件 | 限流、字段白名单 |
| GET | `/api/v1/health` | 健康检查 | 无敏感信息 |
| GET | `/admin/*` | 内容、订单、报表 | Cloudflare Access |

### 8.1 抽牌接口

```json
{
  "spread": "one-card",
  "questionType": "love",
  "locale": "en",
  "idempotencyKey": "uuid"
}
```

返回：

```json
{
  "readingId": "rdg_xxx",
  "publicToken": "pub_xxx",
  "cards": [
    {
      "slug": "the-lovers",
      "name": "The Lovers",
      "orientation": "upright",
      "keywords": ["choice", "alignment", "connection"],
      "summary": "A choice asks you to align desire with values."
    }
  ],
  "summary": "This is a card of conscious choice, not a verdict.",
  "nextAction": "Name the choice you are avoiding and make one honest move."
}
```

### 8.2 安全和幂等

- 每个抽牌请求带 idempotency key，重复提交返回同一结果。
- 单 IP：10 次/分钟；单 token：30 次/小时。
- 所有写接口只接受 JSON，限制 body 大小。
- 支付 webhook 校验 Stripe 签名，不信任前端传来的金额。
- 付费报告由 Workflow 处理，Worker 不长时间阻塞。

---

## 9. 抽牌与解释引擎

### 9.1 抽牌

- 服务端使用 `crypto.getRandomValues`；
- 使用拒绝采样避免取模偏差；
- 一张牌包含 `cardId` 和 `orientation` 两部分；
- 抽中的牌和牌阵写入 D1；
- 不把前端随机数当结果；
- 不把用户问题发送到 Workers AI，除非用户明确点击付费报告并同意。

### 9.2 免费结果

免费结果由规则引擎生成：

1. 牌的基础关键词；
2. 正位/逆位语义；
3. 问题类型：general / love / career / money / decision；
4. 一句行动建议；
5. 一条限制说明。

结果必须是可解释的，不允许因为 AI 温度导致每次同一牌完全不同的结论。

### 9.3 付费报告

付费报告才使用 Workers AI：

```text
结构化输入：
牌阵 + 牌 ID + 正逆位 + 问题类型 + 用户允许的短摘要
        ↓
检索 D1/静态内容中的牌义
        ↓
Workers AI 生成解释
        ↓
JSON Schema 校验 + 敏感内容检查 + 长度检查
        ↓
失败重试/降级到规则报告
```

硬性规则：

- AI 不改写抽牌结果；
- AI 不诊断疾病、不提供法律/投资建议；
- 不让用户输入覆盖系统指令；
- 输出必须包含 `entertainment only`；
- 使用 AI Gateway 记录模型、延迟、错误和缓存命中；
- 高并发或模型失败时返回已保存的规则版报告，不阻断交付。

---

## 10. SEO 实施方案

### 10.1 技术 SEO

- 静态 HTML 输出，不依赖客户端渲染牌义；
- 每页唯一 title、description、H1；
- canonical 自指；
- 语言目录 `/es/`、`/pt-br/`、`/de/`；
- `hreflang` + `x-default`；
- `/reading/` 和 `/report/` 全部 `noindex`；
- `robots.txt` 不屏蔽 CSS/JS/牌面资源；
- 站点地图拆分：
  - `/sitemap-index.xml`
  - `/sitemap-cards.xml`
  - `/sitemap-spreads.xml`
  - `/sitemap-questions.xml`
  - `/sitemap-guides.xml`
- 站内链接每个牌义页至少连到 2 个相关牌、1 个牌阵、1 个问题页。

### 10.2 结构化数据

- `WebSite`
- `Organization`
- `BreadcrumbList`
- `WebApplication` 或 `SoftwareApplication`（不要伪造评分和评论）
- `Article` 用于指南页
- `FAQPage` 只用于页面真实可见的问答

不要给抽牌结果页做 `Product` 或虚假 `AggregateRating`。

### 10.3 内容策略

首版 30 个深度页：

- 22 张大阿卡纳；
- 8 张高意图小阿卡纳；
- 3 个牌阵页；
- 4 个问题类型页；
- 1 个 methodology 页。

每页解决一个明确问题：

- 这张牌是什么；
- 正位和逆位分别怎么读；
- 在爱情/事业/金钱里怎么读；
- 用户下一步可以做什么；
- 哪些问题不适合用这张牌判断。

### 10.4 不做的 SEO 动作

- 不批量生成“78 张牌 × 78 个对象”的薄页；
- 不用同义词自动替换整段；
- 不为每个语序变体各建一张页；
- 不把搜索结果页、分享页、报告页放进入口；
- 不买低质量目录外链；
- 不一次上线十种语言。

### 10.5 外链与分发

首版优先：

1. Tarot 社区和论坛的真实工具分享；
2. 免费可嵌入的 `Card of the Day` widget；
3. 原创牌义图表和可引用数据页；
4. 与关系/自我反思类博客做工具合作；
5. 不把 Reddit 当纯发链渠道，先回答真实问题。

---

## 11. 变现设计

### 11.1 免费层

- 单张牌抽牌免费；
- 不限次数但受 rate limit 限制；
- 结果显示核心牌义和行动建议；
- 不要求注册、不要求邮箱、不要求生日。

### 11.2 付费层

首版只做一次性报告，不做订阅：

| 产品 | 价格 | 交付 |
|---|---:|---|
| Single Card Deep Reading | $4.99 | 1 张牌 + 问题类型 + 深度解释 |
| Three Card Reading | $9.99 | 3 张牌 + 关系/选择综合解读 |
| Relationship Deep Reading | $14.99 | 双人关系牌阵，Phase 2 |
| 5 Reading Credits | $19.99 | 5 次报告额度，Phase 3 |

价格必须通过真实支付和退款验证后再调整，不把对标站价格当成自己的定价证明。

### 11.3 转化事件

- `draw_started`
- `draw_completed`
- `share_clicked`
- `report_cta_viewed`
- `checkout_started`
- `checkout_completed`
- `report_ready`
- `report_failed`
- `refund_requested`

转化率按“完成抽牌 → 点击 report CTA → 进入 checkout → 支付成功 → 打开报告”逐层记录，不只看最终 GMV。

### 11.4 广告与联盟

- 首版不把展示广告作为主收入；
- 免费词 CPC 低，广告收入不足以支撑内容；
- 报告后置导流真人解读可作为 Phase 3；
- 任何 affiliate 必须核验准入、地域、佣金和退款规则。

---

## 12. 安全、隐私与合规

### 12.1 安全

- Cloudflare WAF 托管规则 + 自定义规则；
- 登录后台使用 Cloudflare Access；
- Turnstile 保护抽牌和 checkout；
- API 输入长度、字符集、content-type 白名单；
- CSP、HSTS、X-Content-Type-Options、Referrer-Policy；
- secrets 用 Worker Secrets，不写进仓库；
- Stripe webhook 验签；
- R2 报告使用短期签名 URL，不公开 bucket。

### 12.2 隐私

- 默认不保存用户原始问题；
- 不采集生日、照片、通讯录；
- IP 只存加盐 hash；
- 分析事件不包含问题文本；
- 提供删除请求入口；
- 90 天清理免费阅读，付费订单按退款/税务需要保留。

### 12.3 内容边界

- 18+；
- 明确写 `for entertainment and self-reflection only`；
- 不提供医疗、法律、金融、心理诊断建议；
- 不承诺准确率、复合成功率、收益或关系结果；
- AI 生成内容标注 `AI-assisted`；
- 所有牌义页面有作者/编辑和更新时间。

### 12.4 退款与拒付

- 报告未生成：自动重试，超过 10 分钟自动退款；
- 报告已生成且用户已访问：按明确退款政策处理；
- checkout 页面写清交付内容、价格和退款条件；
- 保留订单、交付时间、访问记录，降低 chargeback 风险。

---

## 13. CI/CD 与环境

### 13.1 Cloudflare Workers Builds

- 连接 GitHub 仓库；
- 生产分支：`main`；
- PR 自动创建 preview deployment；
- 生产部署需通过结构检查和 smoke test；
- 不用 Vercel、Netlify、GitHub Pages 承载网站。

### 13.2 环境

| 环境 | 用途 | 数据 |
|---|---|---|
| local | Wrangler dev | 本地 D1/KV/R2 模拟 |
| preview | PR 预览 | 独立 D1/KV/R2 |
| production | 正式站 | 独立 D1/KV/R2 |

### 13.3 数据库迁移

```bash
npx wrangler d1 migrations create tarot-db 0001_init
npx wrangler d1 migrations apply tarot-db --remote
```

- 迁移文件进 Git；
- 先 preview 后 production；
- 不在生产控制台手改 schema；
- 每次发布前导出 D1 到 R2；
- 回滚以 Worker 版本 + D1 备份为准。

### 13.4 发布前检查

```bash
npm run build
npm run typecheck
npm run test
npm run validate:content
npx wrangler deploy --dry-run
```

没有通过以下项目不上线：

- 30 个页面可访问且无空白；
- 所有牌都能抽到；
- 正逆位比例合理；
- 支付 success/cancel/失败路径可走通；
- `robots.txt` 和 sitemap 正常；
- 404、500、rate limit 页面可读；
- 移动端首屏可完成抽牌；
- 没有控制台致命错误。

---

## 14. 观测与运维

### 14.1 观测

- Cloudflare Web Analytics：访问、Core Web Vitals；
- Analytics Engine：抽牌、分享、支付、错误；
- Workers Logs：结构化 request id；
- AI Gateway：模型延迟、失败、缓存、成本；
- Logpush 到 R2：需要长期审计时启用；
- Cloudflare Notifications：错误率、队列积压、支付失败告警。

### 14.2 关键指标

| 指标 | 目标 |
|---|---:|
| Worker 5xx | < 0.5% |
| 抽牌 API p95 | < 800ms |
| 页面 TTFB p75 | < 500ms |
| LCP p75 | < 2.5s |
| 免费抽牌完成率 | > 70% |
| 结果分享率 | > 3% |
| report CTA 点击率 | > 5% |
| checkout 完成率 | > 60% |
| 付费报告成功率 | > 99% |
| 退款率 | < 5% |

### 14.3 清理任务

用 Worker Cron Trigger：

- 清理过期免费阅读；
- 删除过期报告文件；
- 聚合每日事件到 D1；
- 检查 D1 到 R2 的备份是否成功；
- 标记超过 10 分钟未完成的报告并重试/退款。

---

## 15. 成本估算

低流量 MVP 的 Cloudflare 成本结构：

- Workers Paid：约 $5/月起；
- D1：MVP 数据量通常在免费额度或低用量范围内；
- R2：存储和读取成本低，出口流量不计费；
- Cloudflare Images：按图片数量和转换量计；
- Workers AI：按模型 token/调用计，必须设置每日预算；
- Workers Builds：按构建分钟计；
- 域名：年费；
- Stripe：按支付手续费计。

建议设置：

- Workers AI 每日硬上限；
- 每个付费报告的最大 token；
- 报告失败降级到规则版；
- 免费抽牌不调用大模型；
- 分享图异步生成并缓存到 R2。

---

## 16. 开发排期

### Week 1：骨架与内容

- Cloudflare Registrar/DNS/WAF；
- Astro + Cloudflare Worker 项目；
- Wrangler 本地环境；
- D1 schema 和 78 张牌数据；
- 30 个牌义页面；
- 基础抽牌 API；
- 首页和免费阅读页。

验收：本地可完成 10 次抽牌；牌义页全部有独立内容；移动端可用。

### Week 2：产品与分享

- Turnstile；
- rate limit；
- 正逆位和解释规则；
- 分享 token；
- 分享图；
- SEO metadata、JSON-LD、sitemap、robots；
- Web Analytics 和 Analytics Engine。

验收：搜索结果页可被索引；分享链接不泄露问题；Lighthouse 达标。

### Week 3：付费闭环

- Stripe Checkout；
- webhook 验签；
- Queues + Workflows；
- Workers AI + AI Gateway；
- R2 报告；
- 退款和失败重试；
- 后台订单页。

验收：测试支付完成 → 报告生成 → 打开报告 → 失败重试 → 退款路径全通。

### Week 4：上线与压测

- 软发布；
- GSC 提交；
- WAF 自定义规则；
- 错误告警；
- 备份演练；
- 首轮 30 页内容审计；
- 10 个真实用户可用性测试。

验收：无 P0/P1 缺陷；生产环境 smoke test 通过；回滚脚本可用。

---

## 17. 90 天执行与止损

### 0–30 天

- 完成 30 个深度页；
- 首页和 `free tarot reading` 页完成；
- 建立 10–20 个真实外链/社区曝光；
- 观察收录、展示、CTR 和抽牌完成率。

### 31–60 天

- 按 GSC 找出有曝光无点击的页面；
- 给前 10 个页面补 FAQ、示例、内链；
- 上线 3 个牌阵页；
- 测试 `tarot card generator` 的标题和首屏。

### 61–90 天

- 如果 `tarot card generator` 进入前 20：扩到 20–30 个“牌 + 问题意图”深度页；
- 如果 `free tarot reading` 有稳定曝光：优化免费页到结果页的转化；
- 如果两个词都没有起色：停止扩页，只保留工具和 10 个核心页；
- 如果付费转化 < 1%：先修结果页和报告价值，不加大投放。

### 停止条件

- 90 天 `tarot card generator` 仍在 50 名外；
- 30 个页面没有稳定索引；
- 免费抽牌完成率 < 40%；
- 付费报告退款率 > 10%；
- AI 报告成本高于收入；
- 站点收到明确的合规或支付风险警告。

---

## 18. 风险清单

| 风险 | 影响 | 处理 |
|---|---|---|
| SERP 被大站和 AI Overview 占据 | 点击低 | 先做工具意图，不靠纯解释文章 |
| 78 张牌页面变薄 | 收录但不排名 | 首版只开 30 个高质量页，按 GSC 扩 |
| AI 生成内容不稳定 | 报告不可交付 | 结构化输入、JSON schema、规则降级 |
| 用户问题含敏感信息 | 隐私风险 | 默认不保存原文，只存分类和 hash |
| 牌面版权 | 下架/投诉 | 使用原创或明确授权素材 |
| Stripe 拒付 | 收入损失 | 清楚交付、退款政策、保留交付证据 |
| Cloudflare 供应商锁定 | 迁移成本 | 内容 Markdown 化，数据可导出，R2 保存原始备份 |
| 多语言重复内容 | 收录下降 | 先英文，单语言验证后再逐语言人工本地化 |

---

## 19. 上线清单

### 产品

- [ ] 78 张牌数据完整；
- [ ] 正位、逆位、爱情、事业、金钱、yes/no 内容完整；
- [ ] 首页 5 秒内可完成一次抽牌；
- [ ] 结果可分享、可重置；
- [ ] 付费报告可购买、可恢复、可退款；
- [ ] 404、500、rate limit 页面可读。

### SEO

- [ ] 30 个页面可索引；
- [ ] 每页唯一 title/description/H1；
- [ ] canonical、hreflang、x-default 正确；
- [ ] sitemap 和 robots 正确；
- [ ] 结果页、报告页、后台 noindex；
- [ ] 结构化数据通过 Rich Results 测试；
- [ ] GSC、Bing Webmaster 提交。

### Cloudflare

- [ ] DNS、SSL、WAF、rate limit；
- [ ] D1、KV、R2、Images、Queues、Workflows；
- [ ] Turnstile；
- [ ] Workers Builds；
- [ ] Preview/Production 分离；
- [ ] D1 到 R2 备份；
- [ ] Access 保护 `/admin`；
- [ ] Analytics Engine、Web Analytics、Logs；
- [ ] Workers AI 预算和 AI Gateway 告警。

### 法务与运营

- [ ] Privacy、Terms、Disclaimer、Refund；
- [ ] 18+ 和 entertainment only；
- [ ] 作者/编辑/更新时间；
- [ ] 支付交付说明和退款流程；
- [ ] support@ 收件；
- [ ] 数据删除入口；
- [ ] 牌面素材授权记录。

---

## 20. 最终判定

这是一个**可做的工具站**，但不是一个靠“AI 生成塔罗”就能自动成功的项目。

真正的壁垒是：

1. 抽牌结果的即时可用性；
2. 牌义内容的深度和一致性；
3. 结果分享和回访；
4. 免费结果到付费报告的转化；
5. Cloudflare 边缘架构带来的低成本和低延迟。

执行顺序固定为：

**Tarot Card Generator → Free Tarot Reading → 牌阵/问题深度页 → Tarot Yes or No → 付费关系报告 → 多语言。**

