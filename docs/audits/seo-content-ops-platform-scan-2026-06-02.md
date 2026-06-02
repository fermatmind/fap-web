# FermatMind SEO Content Operations Platform Scan — 2026-06-02

## 1. 一句话结论

FermatMind 现在已经具备 CMS/API-backed 文章路由、文章模型、SEO metadata、sitemap 枚举、Article/FAQ/Breadcrumb schema、基础 CTA 与统计链路，因此可以开始做首批 3 篇文章的选题 brief 和 CMS draft 准备；但不建议直接发布，必须先确认后台 draft/preview/noindex、逐篇 CTA 目标、SEO 运营基线、GSC/百度/GA4 复盘台账与 P0 private URL 复查状态。

## 2. 扫描范围与限制

本次扫描只读检查了：

- 前端仓库：`/Users/rainie/Desktop/GitHub/fap-web`
- 后端/API/CMS 仓库：`/Users/rainie/Desktop/GitHub/fap-api`
- 前端 articles/tests/personality/career/sitemap/robots/metadata/schema/tracking 相关代码
- 后端 Laravel API、Filament Ops CMS、Article/Landing Surface/SEO 服务、SEO Ops 文档
- 生产公开 sitemap 与公开 API 响应

本次没有执行：

- 没有修改业务代码、CMS 数据、生产配置、analytics/GSC/百度资源平台设置
- 没有创建 CMS 文章、订单、支付或真实私人 URL 访问
- 没有发布内容、提交 sitemap、调用百度 API push
- 没有安装依赖、运行 migration、创建 PR
- 没有登录生产 CMS 后台做 UI 操作；CMS 后台能力判断来自代码扫描，生产权限和实际 UI 状态仍需人工确认

本报告是唯一新增文件。

## 3. 仓库与系统边界

| 仓库/目录 | 状态 | 技术栈 | 角色 |
|---|---:|---|---|
| `fap-web` | 可访问 | Next.js 16.1.2、React 19、TypeScript、pnpm、next-sitemap | 前端运行时、SEO metadata、sitemap 生成、CMS 内容渲染、analytics bridge |
| `fap-api` | 可访问 | Laravel 12、PHP 8.4、Filament 3.2、MySQL/Postgres 风格 Eloquent、S3/Media、Sentry | 后端 API、CMS/admin、Article/Landing Surface 内容权威、SEO Ops |
| sibling `fap-web-*` / `fap-api-*` | 可见 | 多个本地 worktree/任务目录 | 不作为本次系统源头，只视为历史/分支工作区 |

系统边界判断：

- 前端不是文章内容权威。`fap-web` 对文章、landing surface、personality、career 等 CMS-backed surface 只做渲染、metadata 消费、sitemap 枚举。
- 后端/CMS 是文章内容、发布状态、SEO 字段、canonical、indexability 的权威层。
- sitemap 由前端 `next-sitemap.config.js` 生成，但 URL 列表来自 backend/CMS public API 和 public authority endpoints。
- CMS/admin 由 `fap-api/backend/app/Filament/Ops/**` 承担。
- SEO 中台能力主要在 `fap-api/backend/app/Filament/Ops/Pages/*Seo*`、`backend/docs/seo/**`、`fap-web/docs/analytics/**`、`fap-web/docs/audits/**`、`scripts/seo/**`。

## 4. 前端 SEO 资产

### 4.1 `/zh/articles` 当前状态

| 问题 | 结论 |
|---|---|
| 静态/CMS/API-backed | API-backed 动态路由。`app/(localized)/[locale]/articles/page.tsx` 使用 `getCmsArticlesWithLastKnownGood()`，并声明 `dynamic = "force-dynamic"`。 |
| 文章内容来源 | 后端公开 API `/api/v0.5/articles` 与 `/api/v0.5/articles/{slug}`。不是本地 MD/MDX，不是前端 hardcoded 正文。 |
| draft/published/noindex | 前端只读取 publicly readable 文章。draft/noindex 权威在后端 `Article.status/is_public/is_indexable/published_revision_id` 与 SEO meta。 |
| title/description/canonical | 支持。列表页用 `buildPageMetadata`，详情页优先读取 `getCmsArticleSeoWithLastKnownGood()` 的 `seo_surface_v1/meta`。 |
| Article/FAQ/Breadcrumb schema | 支持。详情页渲染 Article JSON-LD、BreadcrumbList；FAQPage 仅来自可见 `answer_surface_v1.faqBlocks`。 |
| tags/topics/related tests/articles | Article type 支持 category/tags/related_test_slug/related_test_slugs/test_edges/landing_surface/answer_surface；前端已渲染相关内容和 CTA。 |
| author/reviewer/updatedAt | 支持。Article API type 包含 author/reviewer/reading_minutes/updated/published 字段，详情页使用 article payload。 |
| CTA slots | 支持。详情页使用 `landing_surface_v1.ctaBundle` 和 `SeoTrackedCtaLink`。 |
| internal links | 支持。Markdown/HTML 内容经 sanitizer 和 link hydrator 渲染，CMS body 可以放站内链接。 |
| sitemap | 支持。`next-sitemap.config.js` 通过 `/v0.5/articles` 枚举公开、indexable article detail URL。 |
| 多语言 | 支持 `zh-CN` / `en` 映射，前端 locale segment 是 `/zh` / `/en`。 |
| 是否适合立刻做文章运营 | 适合做 brief 和 CMS draft；发布前仍需后台权限、preview/noindex、逐篇 CTA 和数据台账确认。 |

### 4.2 核心页面表

| route | content source | metadata source | sitemap | indexability | canonical/schema | CTA/internal links | analytics tracking | SEO 运营落地价值 |
|---|---|---|---|---|---|---|---|---|
| `/` | 前端产品 shell + CMS/API landing/data | 前端 metadata + CMS/API | 生产 sitemap 未单独计入 `/zh`，root 策略需确认 | indexable | canonical 需按 root 策略验收 | 首页 CTA | public analytics | 品牌入口，可承接导航，不是首批文章目标页 |
| `/zh` | localized root，实际可能 canonical/root 合并 | 同上 | 生产 sitemap 未出现 exact `/zh` | indexable/策略待确认 | 是否独立 canonical 需确认 | 首页 CTA | public analytics | 需确认是否应独立进入 sitemap |
| `/zh/tests` | 测试 hub，CMS/API-backed | test hub metadata | sitemap 包含 tests family | indexable | WebPage/Breadcrumb 类 schema | test CTA/internal links | start_test 入口 | 核心 SEO 聚合页 |
| `/zh/tests/mbti-personality-test-16-personality-types` | scale lookup + CMS landing surface | scale SEO + landing surface | 包含 | indexable | canonical、FAQ/Breadcrumb 已实现 | 主 CTA + landing 模块 | start_test 等 | L1 主落地页 |
| `/zh/tests/holland-career-interest-test-riasec` | scale lookup + CMS landing surface | scale SEO + landing surface | 包含 | indexable | canonical、FAQ/Breadcrumb 已实现 | RIASEC CTA + landing 模块 | start_test 等 | L2 职业兴趣承接页 |
| `/zh/tests/big-five-personality-test-ocean-model` | scale lookup + CMS landing surface | scale SEO + landing surface | 包含 | indexable | canonical、FAQ/Breadcrumb 已实现 | test CTA | start_test 等 | L2/L1 对比承接页 |
| `/zh/personality` | CMS personality API | CMS/personality metadata | 包含 personality family | indexable | profile/schema 由 CMS/API 驱动 | personality internal links | public analytics | MBTI 类型内链承接 |
| `/zh/career/jobs` | career jobs API | career jobs metadata | 生产 sitemap 未出现 exact hub，但 job details 大量进入 | indexable | canonical `/zh/career/jobs` | jobs/career links | public analytics | 职业意图强，需决定 hub 是否进 sitemap |
| `/zh/articles` | CMS article list API | frontend list metadata + CMS list payload | 包含 article detail；list 是否在静态 sitemap 需单独确认 | indexable | CollectionPage/Breadcrumb | article cards/internal links | public analytics | 可以作为文章运营入口 |

### 4.3 主要前端缺口

- 文章详情页的 `start_test` CTA 默认来自后端 `landing_surface_v1`。后端当前 detail surface 的默认 start test 目标偏 MBTI；职业/RIASEC 文章发布前必须确认每篇文章的 `related_test_slug`、CTA bundle 或正文链接会指向正确测试。
- `/zh/career/jobs` 作为职业 SEO hub 当前可访问且 index/follow，但生产 sitemap exact loc 未出现；是否纳入 sitemap 需要策略确认。
- 文章 preview 不是前端公开路由能力，未确认 draft preview token 或后台 preview URL。

## 5. 后端/API/CMS 内容模型

### 5.1 Article 内容模型

后端 `Article` 模型存在，支持：

- 基础内容：`title`、`excerpt`、`content_md`、`content_html`、`slug`、`locale`
- 作者与审核：`author_name`、`reviewer_name`、`author_admin_user_id`
- 阅读与媒体：`reading_minutes`、cover image URL/alt/width/height/variants、Media Library 选择
- 发布状态：`status`、`is_public`、`is_indexable`、`published_at`、`scheduled_at`
- 版本：`working_revision_id`、`published_revision_id`、`ArticleTranslationRevision`
- 多语言：`locale`、`translation_group_id`、`source_locale`、translation status/hash
- 分类：category、tags
- 测试关联：`related_test_slug`、test edges
- SEO：`ArticleSeoMeta`，包含 SEO title/description/canonical/OG/robots/schema JSON

`scopePubliclyReadable()` 要求文章已发布、存在 `published_revision_id`，并且 published revision 状态为 published。draft 不会通过公开 API 被前端读取。

### 5.2 API 能力

公开 API：

- `GET /api/v0.5/articles`
- `GET /api/v0.5/articles/{slug}`
- `GET /api/v0.5/articles/{slug}/seo`
- `GET /api/v0.5/landing-surfaces/{surfaceKey}`
- `GET /api/v0.3/scales/lookup`
- sitemap source / public content APIs

CMS 写 API 存在但本次未调用：

- `POST /api/v0.5/cms/articles`
- `PUT /api/v0.5/cms/articles/{id}`
- `POST /api/v0.5/cms/articles/{id}/seo`
- `POST /api/v0.5/cms/articles/{id}/publish`
- `POST /api/v0.5/cms/articles/{id}/unpublish`

### 5.3 发布、draft、scheduled、preview

| 能力 | 扫描结论 |
|---|---|
| CMS article model | Yes |
| landing_surface_v1 model | Yes，`LandingSurfaceResource` 和 public/internal API 均存在 |
| MBTI/Holland landing source | scale lookup + backend/CMS landing surface；近期 draft proposal 仅是 docs，不是 runtime authority |
| CMS 新建文章 | Yes，Filament `ArticleResource` 支持 create |
| draft | Yes，默认 draft / `is_public=false` |
| publish | Yes，通过 release/publish service，要求 publishable revision |
| scheduled publish | Partial，字段存在但 Filament ArticleResource 中 `scheduled_at` 为 disabled；未确认 scheduler 执行链路 |
| noindex | Yes，`is_indexable` 和 SEO meta robots |
| canonical | Yes，ArticleSeoService 生成 canonical，也支持 canonical_url 字段 |
| FAQ | Partial，公开响应支持 `answer_surface_v1.faqBlocks`，但 ArticleResource 表单未看到一等 FAQ block 编辑器 |
| internal links | Yes，通过 Markdown/HTML 正文；一等 internal link registry/graph 在 SEO Ops 层需确认 |
| CTA blocks | Partial，landing/answer surface 支持；ArticleResource 表单主要是 `related_test_slug`，未确认逐篇 CTA bundle UI |
| author/reviewer | Yes |
| topic/tag/category | Yes，category/tags；topic 另有 CMS topic resources/API |
| zh-CN/en | Yes |
| 发布权限控制 | Yes，Filament `ContentAccess::canWrite/canRelease` 和 release queue |
| 内容审核流 | Yes，Editorial Review/Release pages 存在；发布 action 要求审核状态 approved |
| 版本历史 | Yes，working/published revision 与 translation revisions |
| sitemap feed API | Yes，frontend sitemap 从 `/v0.5/articles` 等 public APIs 枚举 |
| article detail API | Yes |
| preview | Unknown/Partial，代码中未确认公开 draft preview URL；后台 public URL action 仅已 public 时显示 |

## 6. CMS 后台能力

代码扫描确认的后台能力：

- 文章管理入口：`ArticleResource`
- Landing Surface 管理入口：`LandingSurfaceResource`
- 内容 overview / metrics / release / editorial review / content workspace
- SEO operations 页面：`SeoOperationsPage`，属于写-capable 修复面
- SEO dashboard/read-only 页面：`SeoDashboardAccessPage`，用于 URL truth、issue queue、search channel、安全卡片等观测
- 文章表单支持 Markdown 正文、作者、审核人、阅读时长、封面媒体、locale、category、tags、related_test_slug、translation markers、SEO title/description/canonical/OG/noindex
- 发布按钮/发布队列存在，且 release 受权限与 editorial review approved 条件约束

尚未确认的后台能力：

- 生产后台当前登录态、用户权限、是否能创建 draft
- draft preview URL 或 preview token 是否已可用
- 是否能直接编辑每篇文章的 FAQ blocks、CTA bundle、internal link blocks，而不是仅通过正文 Markdown/landing surface raw JSON
- 是否能看到 MBTI/Holland landing surface 现有记录并安全创建 unpublished draft
- scheduled publish 是否有实际调度器，不只是字段
- rollback/历史版本 UI 是否对运营可用

对首批 3 篇的影响：

- 可以准备 CMS draft 输入。
- 不建议 publish，直到后台 operator 确认可创建 draft、可预览、draft 不进 sitemap/llms/search submit、发布前可设置 noindex/canonical/CTA/FAQ/internal links。

## 7. SEO 中台能力

已存在的能力：

| 能力 | 当前状态 |
|---|---|
| URL inventory / URL Truth | Partial/Yes，backend SEO Ops 文档和 dashboard 具备 URL Truth 概念与只读 view |
| SEO baseline table | Partial，已有 `docs/audits/seo-operations-plan-2026-06-02.md`，但不是正式可执行台账 |
| keyword registry | Partial/No，未看到可运营的正式关键词池 |
| article brief registry | No，未创建首批 article brief；本次明确禁止创建 |
| article status tracking | Partial，CMS 有 status；SEO 运营维度台账未形成 |
| content QA checklist | Yes/Partial，backend SOP 有 gate checks；需要变成首批文章 checklist |
| publish checklist | Yes/Partial，CMS Article SOP 与 SEO no-go protocols 存在 |
| sitemap submit checklist | Partial，SEO Ops no-go/approval 存在；未形成首批 URL submit 表 |
| GSC / 百度资源平台记录 | Partial/No，本次未访问后台；没有确认现有基线数据表 |
| GA4 event mapping table | Yes，analytics docs 已有 conversion setup / tracking runbook |
| article → test CTA tracking | Partial，前端有 `SeoTrackedCtaLink` 和 safe attribution；backend 一等 `source_slug/cta_id/target_test_slug` ingest 仍在 docs 中标为 deferred |
| UTM campaign registry | Yes/Partial，`docs/analytics/utm-channel-governance.md` 和 helper 存在 |
| internal link graph | Partial，SEO Ops 有 internal link graph 概念/命令；未确认首批文章人工 link plan |
| page priority registry | Partial/No，需建立 SEO 运营基线表 |
| noindex/private URL watchlist | Yes/Partial，analytics/privacy docs 和 private-route checks 存在；P0-12 生产复查仍需完成 |
| Search Console query/page export storage | No/Unknown，未确认真实导出存储 |
| 百度统计入口页/受访页异常记录 | Partial，analytics docs 有 QA 项；未确认正式台账 |
| weekly review template | Yes/Partial，SEO Ops SOP 有 daily/weekly/monthly review，但首批文章专用模板未落地 |

最小缺失资产：

1. `SEO-OPS-P0-01`：首批 SEO 运营基线表，记录 URL、keyword、intent、target page、CTA、sitemap、indexability、GSC/Baidu/GA4 状态。
2. `SEO-CMS-P0-03`：draft preview/noindex 验收，证明 draft 不进 sitemap/llms/search submit。
3. `SEO-TRACKING-P0-06`：article → test CTA tracking 验收，尤其是 RIASEC 文章不能落到默认 MBTI CTA。
4. `SEO-CONTENT-P1-07`：首批 3 篇 brief，必须在系统能力验收后创建。

## 8. sitemap 与 URL 资产

### 8.1 生产与本地 sitemap 差异

扫描到的生产 sitemap：

- 总 loc：2270
- tests：18
- articles：30
- personality：66
- career：2122
- jobs detail：2092
- share/result/orders/pay/payment/history：0
- en：1119
- zh：1149
- exact `/zh`：0
- exact `/zh/career/jobs`：0

当前本地 `public/sitemap.xml`：

- 总 loc：261
- tests：18
- articles：26
- personality：66
- career：116
- jobs detail：87
- share/result/orders/pay/payment/history：0
- en：70
- zh：189
- exact `/zh`：0
- exact `/zh/career/jobs`：0

差异原因判断：

- `fap-web` 的 `next-sitemap.config.js` 使用 `additionalPaths` 从后端 public APIs 拉取文章、career guides、methods、data、career jobs、career recommendations、personality、topics、content pages、tests。
- 生产构建环境或生产 API 权威数据拥有更多 career job URL，所以生产 sitemap 有 2092 个 job detail；本地 `public/sitemap.xml` 更像当前工作区生成/缓存产物，不能当生产 URL truth。
- 两者都没有 private result/orders/share/pay/payment/history URL，未发现 sitemap 私密 URL 回归。

### 8.2 `/zh/career/jobs` 与 `/zh`

- `/zh/career/jobs` 是 index/follow 且可作为职业 SEO hub，但生产 sitemap exact loc 未出现；job detail URLs 大量存在。
- 是否加入 `/zh/career/jobs` 需要 SEO 策略确认：如果它是职业列表 hub，应加入 sitemap；如果只是交互搜索页且内容高度分页/筛选，应通过内部链接承接即可。
- `/zh` 未进入 sitemap，可能是 root canonical 策略导致；需要确认 `/zh` 是否 canonical 到 `/`，还是应作为中文首页独立 URL 进入 sitemap。

### 8.3 当前最应该推给搜索引擎的 URL

可优先进入 GSC/Baidu 人工检查或 submit checklist 的 URL 类型：

- `/zh/tests/mbti-personality-test-16-personality-types`
- `/zh/tests/holland-career-interest-test-riasec`
- `/zh/tests/big-five-personality-test-ocean-model`
- `/zh/articles`
- 已发布、indexable、canonical 正常的 zh 文章详情页
- 主要 MBTI personality type pages
- 经过策略确认后的 `/zh/career/jobs` hub

暂时不该推送：

- draft/noindex 文章
- `/zh/result/**`
- `/zh/orders/**`
- `/zh/share/**`
- `/zh/pay/**`
- `/zh/payment/**`
- `/zh/history/**`
- 带 `orderNo`、`resultId`、`token` 等 query 的 URL
- 未确认 claim boundary 或 CTA 目标的文章

## 9. 内容发布链路

### 9.1 当前实际链路

1. 选题：目前可在 docs/audits 或未来 SEO baseline 表记录；正式 keyword/brief registry 未确认。
2. brief：尚未创建首批 brief；本次禁止创建。
3. 正文：应在 CMS draft 或 docs proposal 中准备，最终内容权威必须进入 backend CMS Article。
4. 审核：Filament Editorial Review/Content Release 页面和 SOP 存在，发布 action 需要 review approved。
5. 进入 CMS：ArticleResource 或 `/api/v0.5/cms/articles` 可创建/更新，但本次禁止调用。
6. preview：未确认；需要后台 UI/权限验证。
7. metadata/schema：ArticleResource + ArticleSeoService + frontend detail page 支持。
8. internal links：正文 Markdown/HTML 支持；正式 internal link graph/QA 需运营台账。
9. publish：ArticlePublishService 设置 `published`、`is_public=true`、`published_revision_id`。
10. sitemap：下一次 sitemap 生成通过 `/v0.5/articles` 收录 public/indexable article detail。
11. GSC/百度：SOP 要求人类明确批准；不自动提交。
12. article → test click：前端 `SeoTrackedCtaLink` + safe attribution 支持；backend 一等字段仍需增强。
13. start/complete/view_result：analytics P0 train 已标准化；后台配置仍需按 runbook 验证。
14. 7/14 天复盘：SEO Ops SOP 有 cadence；首批文章专用表未形成。
15. 内容更新：应通过 CMS draft/revision/update/publish 流程，不改前端 fallback。

### 9.2 理想链路

keyword registry → article brief → claim/internal-link/CTA QA → CMS draft → draft preview → noindex/sitemap/llms 检查 → editorial review approved → controlled publish → sitemap 生成 → 人工 GSC/Baidu 检查/提交 → GA4/Baidu/GSC 7/14/28 天复盘 → CMS revision 更新。

### 9.3 最小可行链路

1. 先建 SEO 运营基线表。
2. 为 3 篇文章写 brief，不写生产正文。
3. 人工确认 CMS 可创建 draft 和 preview。
4. 将 1 篇作为 canary draft 录入 CMS unpublished。
5. 验证 draft 不进 sitemap/llms/search submit，metadata/CTA/internal links 正确。
6. 人工审稿后只发布 1 篇 canary。
7. 观察 7 天，再决定是否继续第 2/3 篇。

## 10. 首批 3 篇 SEO 文章可行性

| 文章 | 承接页 | CMS/article route | title/description/canonical | CTA | internal links | sitemap | noindex draft | preview | article → test tracking | 建议 |
|---|---|---|---|---|---|---|---|---|---|---|
| 不知道自己适合什么职业怎么办？ | Holland/RIASEC、career jobs、MBTI/Big Five 对比 | Yes | Yes | Partial，需指向 RIASEC 60 + career jobs，不能默认 MBTI | Yes | publish 后 Yes | Yes，需后台验收 | Unknown | Partial | 可以写 brief；不建议直接 publish |
| MBTI 和霍兰德哪个更适合选职业？ | MBTI、Holland/RIASEC、Big Five | Yes | Yes | Partial，主 CTA 应分流 MBTI/RIASEC，不可单一默认 | Yes | publish 后 Yes | Yes，需后台验收 | Unknown | Partial | 可以写 brief；适合作为首批 canary |
| 霍兰德职业兴趣测试是什么？RIASEC 六型怎么理解 | Holland/RIASEC 主落地页 | Yes | Yes | Partial，主 CTA 应 `riasec_60`，次 CTA 可 `riasec_140` | Yes | publish 后 Yes | Yes，需后台验收 | Unknown | Partial | 可以写 brief；发布前需确认 RIASEC CTA 和 claim boundary |

共同阻塞：

- 生产 CMS draft/preview 能力未实操确认。
- 逐篇 CTA bundle/related_test_slug/landing surface 是否能指向正确测试未确认。
- 文章 brief registry 和 SEO baseline table 未建立。
- GSC/百度资源平台与 GA4/百度统计复盘表未确认。
- P0 private URL HTML hardening 的生产复查应完成后，再扩大 SEO 提交流程。

## 11. 当前不能做什么

- 不能直接把文章正文写进 `app/**`、`components/**`、`lib/**` 或本地 content JSON/MDX 作为 runtime fallback。
- 不能直接 publish CMS 文章。
- 不能批量生成或批量发布 SEO 文章。
- 不能自动提交 sitemap、百度 push、IndexNow、GSC URL inspection。
- 不能把 Baidu Tongji 当作 private funnel conversion source of truth。
- 不能在 private/noindex route 上配置百度元素转化。
- 不能让 draft/noindex/private URL 进入 sitemap、llms、Search Channel queue。
- 不能用未经确认的数据写“百万用户”“最准”“保证找到职业”等 claim。
- 不能在没有 preview/noindex 验证时发布首批文章。

## 12. 后续任务拆分

| id | 优先级 | 标题 | 目标 | 范围 | 不做什么 | 验收标准 | 依赖 | PR | CMS 操作 | 后台权限 |
|---|---|---|---|---|---|---|---|---|---|---|
| SEO-OPS-P0-01 | P0 | SEO 运营基线表 | 建立 URL/keyword/CTA/sitemap/index/analytics/GSC/Baidu 台账 | docs/operations 或 docs/audits | 不发布内容、不调用后台 | 表内覆盖核心 URL 和首批 3 篇计划 | 无 | 可 docs-only | No | No |
| SEO-CMS-P0-02 | P0 | 文章 CMS draft/publish 能力确认 | 确认 ArticleResource 创建 draft、审核、发布权限 | 后台 UI 只读/截图/权限清单 | 不创建真实内容 | 确认 operator 能/不能创建 draft、release 条件 | 后台登录 | No 或 docs-only | No | Yes |
| SEO-CMS-P0-03 | P0 | 文章 preview 与 noindex draft | 证明 draft 不进 sitemap/llms/search submit，确认 preview 方案 | CMS/admin + frontend route 验收 | 不 publish | draft preview/noindex/sitemap gate 有证据 | SEO-CMS-P0-02 | 可能需要 | 可能 draft only | Yes |
| SEO-FE-P0-04 | P0 | 文章路由/metadata/schema 验收 | 对文章 list/detail 做 production smoke 和 contract | fap-web articles/metadata/schema tests | 不改 CMS 内容 | title/description/canonical/Article/FAQ/Breadcrumb 正常 | P0-12 deploy recheck | 可能需要 | No | No |
| SEO-SITEMAP-P0-05 | P0 | sitemap URL count 与 career/jobs 策略确认 | 解释 2270 vs 261，决定 `/zh/career/jobs` 和 `/zh` sitemap 策略 | next-sitemap + backend sitemap source + docs | 不提交 sitemap | URL policy 明确，无 private URL | SEO-OPS-P0-01 | 可能需要 | No | No |
| SEO-TRACKING-P0-06 | P0 | article → test CTA tracking | 确认 article CTA 到 test 的 source_slug/cta_id/test_slug 可复盘 | frontend tracking docs/code + backend ingest contract | 不改 GA/Baidu 后台 | 文章点击到 start_test 可用 GA4/source attribution 验证且不泄露 ID | analytics train 已合并 | 可能需要 | No | GA4 read |
| SEO-CMS-P0-11 | P0 | 逐篇文章 CTA 目标配置能力 | 避免 RIASEC/职业文章落到默认 MBTI CTA | Article related_test_slug、landing_surface_v1、answer_surface_v1 | 不写前端 fallback | 每篇文章可配置主/次 CTA，preview 可见 | SEO-CMS-P0-02 | 可能需要 | Yes, draft only | Yes |
| SEO-CONTENT-P1-07 | P1 | 首批 3 篇文章 brief | 写选题 brief、claim boundary、internal links、CTA plan | docs/content 或 CMS draft proposal | 不写完整正文、不 publish | 每篇有 intent、outline、CTA、links、claim notes | P0-01/P0-02/P0-06 | docs-only | No | No |
| SEO-CONTENT-P1-08 | P1 | 首批 3 篇文章 CMS draft | 将审核后的正文录入 CMS unpublished draft | CMS Article draft | 不 publish | draft 存在、noindex、不进 sitemap、preview OK | P1-07/P0-03 | No | Yes draft | Yes |
| SEO-CONTENT-P1-09 | P1 | 人工审稿与发布 | 对 1 篇 canary 文章做人工 publish | CMS review/release | 不批量发布 | 审稿 approved、publish 后 metadata/sitemap OK | P1-08 | No | Yes publish | Yes |
| SEO-REVIEW-P1-10 | P1 | 7/14 天复盘 | 复盘 indexed/impressions/clicks/start/complete | GSC/Baidu/GA4/SEO baseline | 不自动重写内容 | 7/14 天报告和下一步建议 | P1-09 | docs-only | No | GA4/GSC/Baidu read |

## 13. 需要用户确认的问题

1. 生产 CMS 后台是否有可用账号，并且该账号是否具备 Article draft、SEO fields、review/release 的权限？
2. CMS 是否已有 draft preview URL/token？如果没有，是否接受先用 staging/unpublished preview 方案？
3. 首批文章是否以 1 篇 canary 发布，还是 3 篇全部 draft 后再统一审稿？
4. `/zh/career/jobs` 是否要作为职业 SEO hub 进入 sitemap？
5. `/zh` 是否应独立进入 sitemap，还是继续 canonical/root 策略？
6. GA4、GSC、百度资源平台、百度统计是否已有只读权限可用于 7/14 天复盘？
7. P0-12 private route HTML hardening 是否已经 merge/deploy 并完成生产复查？
8. 首批 3 篇的主 CTA 是否统一优先 Holland/RIASEC，还是根据文章 intent 分流到 MBTI/Big Five/RIASEC？
9. 内容审核责任人是谁？谁有最终 publish approval？
10. 是否允许创建 docs-only SEO baseline 和首批 brief PR？
