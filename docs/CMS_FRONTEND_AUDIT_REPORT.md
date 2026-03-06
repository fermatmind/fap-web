# CMS Frontend Audit Report

审计时间：2026-03-06  
审计范围：`/Users/rainie/Desktop/GitHub/fap-web`、`app`、`components`、`lib`、`public`、`package.json`、`next.config.*`、`tsconfig.json`、`/Users/rainie/Desktop/GitHub/fap-api/docs`

结论先行：`fap-web` 当前已经是一套可构建、可运行、内容量较完整的前端内容站，但它不是一套已经打通后端 CMS 的前端。就“CMS 内容系统上线条件”而言，当前结论是未就绪。

## 1. Frontend Scope Summary

### 当前 `fap-web` 的真实实现范围

- `articles` 已实现，内容源来自 `content/blog/**/*.mdx`，通过 `velite.config.ts` 编译到 `.velite`，再由 `lib/content.ts` 提供给页面。
- `career` 已实现，内容源来自 `content/career/jobs/**/*.mdx`、`content/career/industries/**/*.mdx`、`content/career/guides/**/*.mdx`、`content/career/recommendations/**/*.mdx`，同样走 Velite 本地内容链路。
- `personality` 已实现，但不是独立 CMS 实体；页面内容由 `lib/personality.ts` 基于本地 MBTI recommendation 数据派生。
- `topics` 已实现，但 topic cluster 定义写死在 `lib/topics.ts`，不是表驱动，也不是 CMS API 驱动。
- 路由层采用 Next.js App Router + locale 路由组：真实页面挂在 `app/(localized)/[locale]/*`。
- 根路径 `/articles`、`/career`、`/personality`、`/topics` 并没有对应的根级 `page.tsx`，而是依赖 `middleware.ts` 做 308 locale 重定向。

### 已存在页面

- `articles`
  - 列表页：`app/(localized)/[locale]/articles/page.tsx`
  - 详情页：`app/(localized)/[locale]/articles/[slug]/page.tsx`
  - 真实内容规模：18 个 article slug，每个 slug 有 `en/zh` 两套 MDX
- `career`
  - 中心页：`app/(localized)/[locale]/career/page.tsx`
  - alias 页：`app/(localized)/[locale]/career/[slug]/page.tsx`
  - 子页面族：`career/jobs/*`、`career/industries/*`、`career/guides/*`、`career/recommendations/*`
  - 真实内容规模：30 个 job slug、12 个 industry slug、20 个 guide slug
- `personality`
  - 列表页：`app/(localized)/[locale]/personality/page.tsx`
  - 详情页：`app/(localized)/[locale]/personality/[type]/page.tsx`
  - 真实内容规模：16 个 MBTI type detail page
- `topics`
  - 列表页：`app/(localized)/[locale]/topics/page.tsx`
  - 详情页：`app/(localized)/[locale]/topics/[slug]/page.tsx`
  - 真实内容规模：3 个 topic cluster：`mbti`、`big-five`、`iq-eq`
- 辅助页面
  - `/blog` 与 `/blog/[slug]` 已作为 legacy redirect 到 `/articles`
  - `/robots.txt`、`/sitemap.xml` 已存在于 `public/`

### 缺失页面

- 不存在根级 `app/articles/*`、`app/career/*`、`app/personality/*`、`app/topics/*` 页面文件；当前访问依赖 locale redirect middleware，而不是根级 page file。
- 不存在独立内容页形态的 `/career/[slug]`；当前它只是 alias redirect page，不是最终内容页。
- 不存在 `app/robots.ts`。
- 不存在 `app/sitemap.ts`。
- 不存在任何 CMS preview、CMS diff、CMS content source switch、CMS publish status 显示页面。

### 与 CMS 目标范围的差距

- 当前前端内容源是本地 MDX/Velite 与代码派生数据，不是后端 CMS。
- 前端未对接任何 `/api/v0.5/articles*` 内容接口，也未对接任何 `/api/v0.5/career*`、`/api/v0.5/personality*`、`/api/v0.5/topics*`。
- `topics` 仍是前端硬编码配置，不是 CMS 实体。
- `personality` 与 `career` 当前是内容展示站，不是 CMS 驱动站。
- `robots` 与 `sitemap` 也不是 CMS 驱动产物；它们当前来自静态文件和 `next-sitemap` 的本地内容生成。

## 2. Route Audit

| Route | 页面文件是否存在 | 是否可构建 | 是否需要 API 依赖 | 审计说明 |
| --- | --- | --- | --- | --- |
| `/articles` | 根级 page file 不存在；真实页面文件存在于 `app/(localized)/[locale]/articles/page.tsx` | 是。`pnpm run build` 通过，构建输出中为 `ƒ /[locale]/articles` | 否 | 依赖 `middleware.ts` 将 `/articles` 重定向到 `/{locale}/articles`；数据来自 `listBlogPostsGroupedByTest()` 本地内容 |
| `/articles/[slug]` | 根级 page file 不存在；真实页面文件存在于 `app/(localized)/[locale]/articles/[slug]/page.tsx` | 是。构建输出中为 `● /[locale]/articles/[slug]` | 否 | 通过 `generateStaticParams()` 静态生成；内容来自 `resolveBlogPostBySlug()` 本地内容，不调用 v0.5 article API |
| `/career` | 根级 page file 不存在；真实页面文件存在于 `app/(localized)/[locale]/career/page.tsx` | 是。构建输出中为 `● /[locale]/career` | 否 | 页面数据来自 `listCareerJobs()`、`listCareerIndustries()`、`listCareerGuides()` 本地内容 |
| `/career/[slug]` | 根级 page file 不存在；真实页面文件存在于 `app/(localized)/[locale]/career/[slug]/page.tsx` | 是。构建输出中为 `● /[locale]/career/[slug]` | 否 | 这是 alias redirect page，会跳到 `/career/jobs/{slug}`、`/career/guides/{slug}` 或 `/career/industries/{slug}`，不是最终内容页 |
| `/personality` | 根级 page file 不存在；真实页面文件存在于 `app/(localized)/[locale]/personality/page.tsx` | 是。构建输出中为 `● /[locale]/personality` | 否 | 页面数据来自 `listPersonalityProfiles()`，由本地 recommendation 数据派生 |
| `/personality/[type]` | 根级 page file 不存在；真实页面文件存在于 `app/(localized)/[locale]/personality/[type]/page.tsx` | 是。构建输出中为 `● /[locale]/personality/[type]` | 否 | `generateStaticParams()` 生成 16 型人格页面；不依赖 CMS API |
| `/topics` | 根级 page file 不存在；真实页面文件存在于 `app/(localized)/[locale]/topics/page.tsx` | 是。构建输出中为 `● /[locale]/topics` | 否 | 页面数据来自 `listTopicClusters()`，topic 定义写死在 `lib/topics.ts` |
| `/topics/[slug]` | 根级 page file 不存在；真实页面文件存在于 `app/(localized)/[locale]/topics/[slug]/page.tsx` | 是。构建输出中为 `● /[locale]/topics/[slug]` | 否 | `generateStaticParams()` 基于本地 3 个 topic slug 生成；无 CMS/API 依赖 |
| `/robots.txt` | 是，`public/robots.txt` | 是 | 否 | 静态文件存在，但内容硬编码 `https://fermatmind.com/sitemap.xml`，不是 env-aware 生成 |
| `/sitemap.xml` | 是，`public/sitemap.xml`，并由 `next-sitemap` postbuild 生成/覆盖 | 是 | 否 | 当前由 `next-sitemap.config.js` 基于本地 Velite 内容和 hardcoded topic/personality/career path 生成，不读取 CMS API |

## 3. Layout / Navigation Audit

### 是否存在全局 layout

- 存在根 layout：`app/(root)/layout.tsx`
- 存在 locale layout：`app/(localized)/[locale]/layout.tsx`
- locale layout 已接入统一 `SiteChrome`，把 header、footer、cookie banner 放在全站骨架中

### `header` / `footer` / `breadcrumb` / `nav` 是否存在

- `header` 存在：`components/layout/SiteHeader.tsx`
- `footer` 存在：`components/layout/SiteFooter.tsx`
- 顶部导航存在：`SiteHeader` 中已有 `tests / articles / personality / career / help / business`
- locale switcher 存在：`LocaleSwitcher`
- `breadcrumb` 组件存在：`components/breadcrumb/Breadcrumb.tsx`
- 目标页面中，`articles`、`articles/[slug]`、`career`、`personality`、`personality/[type]`、`topics`、`topics/[slug]` 均已使用 breadcrumb

### content layout 是否统一

- 基本统一：
  - 多数目标页面使用 `<Container as="main" className="space-y-6 py-10">`
  - 常见结构为 `Breadcrumb + Hero Section + Cards/Article Body + Related Content`
- 不完全统一：
  - `articles` 列表页是分组分页布局
  - `career` 首页偏 hub/portal 布局
  - `career/[slug]` 是 alias redirect，不具备内容 layout
  - `career/jobs/[slug]` 与 `career/industries/[slug]` 没有统一的 Related Content 区域

### 是否具备 Related Content 组件

- 存在：`components/content/RelatedContent.tsx`
- 已落地使用：
  - `articles/[slug]`
  - `career/guides/[slug]`
  - `personality/[type]`
  - `topics/[slug]`
  - `career/recommendations/mbti/[type]`
- 未统一覆盖：
  - `articles` 列表页
  - `career` 首页
  - `career/jobs/[slug]`
  - `career/industries/[slug]`
  - `personality` 列表页
  - `topics` 列表页

### 已完成能力

- 已有全局站点骨架和 locale-aware layout
- 已有统一 header/footer/nav/breadcrumb
- 已有 Related Content 组件并在多类 detail page 使用
- 已有统一容器、卡片、内容正文渲染模式

### 缺口

- 没有 CMS 专用 layout 能力，例如 preview badge、draft state、publish status、revision compare
- Related Content 不是所有内容页的统一能力
- `/career/[slug]` 不是最终内容模板，CMS 若以单一 slug 输出 career detail，会与当前路由设计不匹配

## 4. SEO Rendering Audit

### `generateMetadata` / `metadata` 使用情况

- 已实现页面级 metadata：
  - `/articles`
  - `/articles/[slug]`
  - `/career`
  - `/personality`
  - `/personality/[type]`
  - `/topics`
  - `/topics/[slug]`
- 根 layout 与 locale layout 也提供了全局 metadataBase、title template、默认 OpenGraph/Twitter 配置

### canonical 输出能力

- 已具备。统一通过 `lib/seo/metadata.ts` 的 `buildPageMetadata()` 输出 `alternates.canonical` 与语言 alternate。
- `/articles/[slug]` 还实现了英文内容缺失时 canonical 回退到中文路径的逻辑，这说明 canonical 逻辑是前端本地内容逻辑，而不是 CMS SEO API 逻辑。

### meta title / description

- 目标页面均有 `title` / `description` 输出能力。
- 数据来源是本地内容或代码派生值，不是 `/api/v0.5/articles/{slug}/seo`。

### OpenGraph

- 已实现，主要来源：
  - locale layout 默认图：`/share/mbti_wide_1200x630.png`
  - `buildPageMetadata()` 支持 page-level `openGraph`
- 缺口：
  - 本次审计的 CMS 目标页面未看到基于 CMS 数据的 page-specific OG image
  - `app/og/[slug]/route.tsx` 存在，但只服务测试页面语境，不是 articles/career/personality/topics 的 CMS 内容 OG 方案

### Twitter Card

- 已实现，来源同上
- 缺口同 OpenGraph：目标 CMS 页面没有单页级动态图片策略

### JSON-LD

| 页面 | JSON-LD 状态 |
| --- | --- |
| `/articles` | 未实现 JSON-LD |
| `/articles/[slug]` | 已实现 `Article` + `Breadcrumb` JSON-LD |
| `/career` | 已实现 `WebPage` + `Breadcrumb` JSON-LD |
| `/career/[slug]` | 未实现；该页本身只是 redirect alias |
| `/personality` | 已实现 `WebPage` + `Breadcrumb` JSON-LD |
| `/personality/[type]` | 已实现 `Person` + `Breadcrumb` JSON-LD |
| `/topics` | 已实现 `WebPage` + `Breadcrumb` JSON-LD |
| `/topics/[slug]` | 已实现 `WebPage` + `Breadcrumb` JSON-LD |

### `robots.ts`

- 未实现。
- 当前 `robots` 方案是静态 `public/robots.txt`。
- 风险：该文件硬编码生产域名 sitemap 地址，不适合作为 staging/env-aware 输出方案。

### `sitemap.ts`

- 未实现。
- 当前 sitemap 方案是：
  - `next-sitemap.config.js`
  - `postbuild` 运行 `next-sitemap`
  - 输出到 `public/sitemap.xml` 与 `public/sitemap-0.xml`
- 这套方案依赖本地 Velite 内容与 hardcoded paths，不依赖 CMS API。

### 哪些页面已实现，哪些未实现

- 已实现且 SEO 完整度较高：
  - `/articles/[slug]`
  - `/career`
  - `/personality`
  - `/personality/[type]`
  - `/topics`
  - `/topics/[slug]`
- 部分实现：
  - `/articles` 有 metadata/canonical，但没有 JSON-LD
  - `/career/[slug]` 可访问可构建，但本质是 redirect alias，不应按正常内容页验收
- 未实现为 Next App SEO route：
  - `robots.ts`
  - `sitemap.ts`

## 5. Build / Runtime Audit

### `package.json` 是否存在

- 存在。
- `packageManager` 声明为 `pnpm@10.28.1`
- `engines.node` 声明为 `>=20 <21`

### npm scripts 是否完整

- 基本完整：
  - `dev`
  - `build`
  - `start`
  - `lint`
  - `typecheck`
  - 多种测试脚本
  - `release:gate`
- 就“当前前端内容站”而言，脚本齐备。

### Next.js 配置是否存在

- 存在：`next.config.mjs`
- 配置项包含：
  - `output: "standalone"`
  - 安全响应头
  - redirect
  - rewrite
  - CDN image remotePatterns

### TypeScript 配置是否存在

- 存在：`tsconfig.json`
- 当前配置足够支持 Next App Router + strict mode

### App Router 是否完整

- 完整。
- `app/` 目录存在 root layout、localized layout、route groups、dynamic routes、API route、OG route。
- 就当前站点而言，App Router 结构是完整的。

### build blockers

- 当前仓库在本地审计中没有出现 build blocker：
  - `pnpm run typecheck` 通过
  - `pnpm run build` 通过
  - `npm run dev` 可启动
- 构建输出显示：
  - Next.js 16.1.2
  - 461 个静态页面生成成功
  - `postbuild` 成功执行 `next-sitemap`

### runtime blockers

- 当前仓库没有出现“无法启动”的 runtime blocker。
- 但存在 runtime / deploy warnings：
  - 当前审计环境 Node 为 `v24.14.0`，与仓库声明的 `>=20 <21` 不匹配
  - Next 16 对 `middleware.ts` 给出 deprecated warning，建议迁移到 `proxy`
  - `/articles` 列表页为动态路由输出，不是纯静态导出模式

## 6. API Integration Audit

### 是否已对接以下接口

| 接口 | 前端是否真实对接 | 证据结论 |
| --- | --- | --- |
| `/api/v0.5/articles` | 否 | 未发现任何 `fetch` / `apiClient.get()` 调用 |
| `/api/v0.5/articles/{slug}` | 否 | 文章详情来自 `resolveBlogPostBySlug()` 本地内容 |
| `/api/v0.5/articles/{slug}/seo` | 否 | SEO 数据来自本地 metadata helper 和 MDX/frontmatter |
| `/api/v0.5/career` | 否 | 未发现调用 |
| `/api/v0.5/career/{slug}` | 否 | 未发现调用；career 数据来自 Velite |
| `/api/v0.5/personality` | 否 | 未发现调用 |
| `/api/v0.5/personality/{type}` | 否 | 未发现调用 |
| `/api/v0.5/topics` | 否 | 未发现调用 |
| `/api/v0.5/topics/{slug}` | 否 | 未发现调用 |

### 哪些调用在代码中真实存在

- 真实存在的是 v0.3 assessment API 调用：
  - `lib/api/v0_3.ts`
  - `lib/big5/api.ts`
  - `lib/clinical/api.ts`
- `NEXT_PUBLIC_API_URL` 只在测试页中用于调用 `/api/v0.3/scales/lookup`，服务测试页 SEO/rollout，不服务 CMS 内容页。

### 哪些只是规划、未落地

- `/api/v0.5/articles`
- `/api/v0.5/articles/{slug}`
- `/api/v0.5/articles/{slug}/seo`
- `/api/v0.5/career*`
- `/api/v0.5/personality*`
- `/api/v0.5/topics*`

### 交叉校验 `fap-api/docs`

- 后端文档 `fap-api/docs/CMS_LAUNCH_CHECKLIST.md` 明确说明：
  - article v0.5 API 已存在
  - 前端 `articles / career / personality / topics` 当前主要来自本地 Velite/MDX 与代码派生数据
  - topics 后端 CMS 能力未完成
- 这与本次前端实扫结果一致。

## 7. Environment Audit

### 是否使用 `NEXT_PUBLIC_API_BASE`

- 环境文件里声明了 `NEXT_PUBLIC_API_BASE=/api`
- 但当前前端运行时代码没有读取这个变量来决定请求基座
- 实际情况：
  - `lib/api-client.ts` 把 `API_BASE` 写死为 `"/api"`
  - `lib/auth/fmToken.ts` 也把 `API_BASE` 写死为 `"/api"`
- 结论：`NEXT_PUBLIC_API_BASE` 当前更多是文档/部署约定，不是前端真实生效的配置入口

### 是否存在环境变量依赖

- 必需/强依赖：
  - `NEXT_PUBLIC_SITE_URL`
- 条件依赖：
  - `NEXT_PUBLIC_API_URL`，仅测试页 SEO/lookup 使用
  - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
  - `NEXT_PUBLIC_BAIDU_SITE_VERIFICATION`
  - `NEXT_PUBLIC_SUPPORT_EMAIL`
  - `NEXT_PUBLIC_CDN_URL`
  - `COS_*`，仅 postbuild 上传使用
  - `TRACK_INGEST_TOKEN` / `ANALYTICS_ENDPOINT` / `EDM_ENDPOINT`，仅 `app/api/track` 使用

### local / staging / production 需要确认哪些变量

- local
  - Node 20.x
  - `NEXT_PUBLIC_SITE_URL`
  - 如需验证 assessment 页 lookup，再提供 `NEXT_PUBLIC_API_URL`
- staging
  - `NEXT_PUBLIC_SITE_URL` 必须为 staging 域名
  - 必须确认 `/api/*` rewrite 是否仍指向生产 `api.fermatmind.com`
  - 必须确认 `robots.txt` 是否仍错误指向生产 sitemap
- production
  - `NEXT_PUBLIC_SITE_URL` 必须是最终正式域名
  - 如用 CDN，确认 `NEXT_PUBLIC_CDN_URL`
  - 如启用 COS 上传，确认 `COS_*`
  - 如使用站点验证，确认 Google / Baidu verification

### 前端环境变量 blocker

- `next.config.mjs` 将 `/api/:path*` rewrite 到固定值 `https://api.fermatmind.com/api/:path*`，这和 `.env.example` 中的 `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_BASE` 配置语义不一致。
- `public/robots.txt` 是静态文件，并且硬编码生产域名 sitemap 地址，staging 环境会产生错误 robots 输出。
- 当前 CMS 页面并不真正用到 CMS API，因此即使环境变量配置正确，也不会改变 CMS 未接入的事实。

## 8. Frontend Launch Checklist

### staging 前需要确认什么

- 明确 scope：
  - 如果 scope 是“当前本地内容站 staging 验证”，可以继续
  - 如果 scope 是“CMS 内容系统 staging 验证”，当前不通过
- 使用 Node 20.x 重新跑一遍：
  - `typecheck`
  - `build`
  - `dev/start`
- 确认 staging 域名下：
  - `NEXT_PUBLIC_SITE_URL` 正确
  - `/api` rewrite 不会误指向 production API
  - `robots.txt` 不会暴露 production sitemap URL
- 抽检页面：
  - `/en/articles`
  - `/en/articles/<slug>`
  - `/en/career`
  - `/en/personality/intj`
  - `/en/topics/mbti`

### production 前需要确认什么

- 明确最终内容源方案：继续 Velite 本地内容，还是切换到 backend CMS
- 若目标是 CMS launch：
  - articles API 与前端必须打通
  - career/personality/topics 必须补齐 CMS contract 或正式 de-scope
  - canonical / sitemap / robots 规则必须与 backend SEO 规则统一
- 若目标只是当前静态内容站上线：
  - `NEXT_PUBLIC_SITE_URL` 正确
  - `robots.txt` / `sitemap.xml` 与正式域名一致
  - Node/PM2/systemd 环境满足仓库要求

### 页面级验收清单

- `/articles`
  - 首页分组列表可见
  - 分页工作正常
  - `/articles` 到 `/{locale}/articles` redirect 正常
- `/articles/[slug]`
  - 正文、FAQ、引用、相关文章渲染正常
  - 英文未完成翻译的 slug 是否正确 noindex/canonical fallback
- `/career`
  - 热门职业、行业、文章、推荐路径可见
- `/career/[slug]`
  - alias slug 是否正确跳转到 jobs/guides/industries
- `/personality`
  - 16 型列表完整
- `/personality/[type]`
  - 概览、关系、优劣势、职业匹配、相关推荐可见
- `/topics`
  - 3 个 topic cluster 可见
- `/topics/[slug]`
  - cluster overview、featured tests、related content 可见
- `/robots.txt`
  - 内容与当前环境域名一致
- `/sitemap.xml`
  - 可以访问，且目标页面进入 sitemap

### SEO 级验收清单

- 所有目标页面均输出 title / description
- canonical 为最终正式 URL
- hreflang `en / zh-CN / x-default` 正确
- `robots` 规则正确
- `JSON-LD` 可在页面源码中看到且类型正确
- OpenGraph / Twitter Card 存在，至少有默认图
- `robots.txt` 与 `sitemap.xml` 指向一致

### 构建验收清单

- Node 20.x
- 安装依赖成功
- `typecheck` 通过
- `build` 通过
- `dev` 或 `start` 可启动
- `postbuild` 生成 sitemap 成功
- 发布后抽检 sitemap/robots 不被旧静态文件污染

### 推荐的前端补齐顺序

1. 先定 scope：本次到底是“静态内容站上线”还是“CMS 内容系统上线”。
2. 统一内容源策略：不能继续保持“前台读本地 MDX，后台 CMS 写数据库，但两者无同步”。
3. 优先打通 `articles`：
   - `/api/v0.5/articles`
   - `/api/v0.5/articles/{slug}`
   - `/api/v0.5/articles/{slug}/seo`
4. 决定 `career / personality / topics` 是继续本地内容、扩展 CMS，还是正式 de-scope。
5. 把 `robots` / `sitemap` 改成环境可控、内容源可控的生成方式，避免继续依赖静态 `public/robots.txt` 和本地内容专用 sitemap 逻辑。
6. 统一 API env contract：
   - 去掉固定生产 rewrite
   - 让 staging/local/prod 的 API 目标可配置且可验证
7. 最后再做 staging smoke + production smoke。

## 9. Frontend Blockers

### blocker

- 当前前端 `articles / career / personality / topics` 页面真实存在，但内容源不是后端 CMS，而是本地 Velite/MDX 与代码派生数据。
- 未发现任何 `/api/v0.5/articles`、`/api/v0.5/articles/{slug}`、`/api/v0.5/articles/{slug}/seo` 的真实前端调用。
- 未发现任何 `/api/v0.5/career*`、`/api/v0.5/personality*`、`/api/v0.5/topics*` 的真实前端调用。
- `topics` 当前由 `lib/topics.ts` 硬编码定义，不具备 CMS 驱动条件。
- `career` 与 `personality` 当前是本地内容展示体系，不具备 CMS 驱动条件。
- 当前 sitemap 内容源来自本地内容生成，不会因为 backend CMS 发布而自动变化。
- 当前前端内容栈与后端 CMS 内容栈是两套系统；在没有同步/切换方案之前，不能把它判定为 CMS frontend ready。

### warning

- `/career/[slug]` 是 alias redirect，不是最终内容页；验收时容易误判。
- `public/robots.txt` 静态硬编码 `https://fermatmind.com/sitemap.xml`，staging 环境容易输出错误 robots。
- `next.config.mjs` 的 `/api` rewrite 写死到生产 API host，和环境变量约定不一致。
- 当前审计环境 Node `v24.14.0` 与仓库声明 `>=20 <21` 不一致。
- Next 16 对 `middleware.ts` 发出 deprecated warning，建议迁移到 `proxy`。
- 目标 CMS 页面虽然已有 OG/Twitter，但大多仍是默认共享图片，不是内容页定制图。
- 当前没有 `app/robots.ts` / `app/sitemap.ts` 这类 env-aware SEO route。

### info

- 当前仓库可成功 `typecheck`、`build`，且 `npm run dev` 可启动。
- 当前前端已有较完整的本地内容资产：
  - 18 组 articles
  - 30 组 career jobs
  - 12 组 industries
  - 20 组 guides
  - 16 组 personality pages
  - 3 组 topic pages
- 当前 route、layout、breadcrumb、navigation、Related Content、metadata 能力对“本地内容站上线”已经比较完整。

## 10. Final Verdict

### READY FOR STAGING

NO，前提是这里的目标是“CMS Frontend Launch”或“CMS 内容系统前后台打通上线”。  
YES，仅当 scope 明确降级为“当前基于本地 Velite/MDX 的内容站 staging 验证”，且不把 backend CMS 发布结果视作前台内容来源。

### READY FOR PRODUCTION

NO。  
当前前端可以作为“本地内容站”构建和运行，但不能被判定为“CMS 驱动前端已具备生产上线条件”。

### REQUIRED NEXT ACTIONS

1. 先明确 scope：静态内容站上线，还是 CMS 内容系统上线。
2. 若是 CMS 上线，先打通 `articles` v0.5 list/detail/seo 三条读取链路。
3. 决定 `career / personality / topics` 的内容源归属：补齐 CMS 或正式 de-scope。
4. 统一 canonical / sitemap / robots 规则，不再依赖当前静态 robots 与本地内容 sitemap 方案。
5. 统一 API env contract，移除固定生产 rewrite。
6. 在 Node 20.x 环境下重跑 staging smoke，并逐页核验页面与 SEO。

## Appendix

### 可复制执行的前端检查命令

```bash
cd /Users/rainie/Desktop/GitHub/fap-web

pwd
find app -maxdepth 6 -type f | sort
ls
ls -la
cat package.json
cat tsconfig.json
npm run build
npm run dev
```

### 本次审计实际执行记录

- 已执行：`pnpm run typecheck`
- 已执行：`pnpm run build`
- 已执行：`npm run dev` 启动冒烟，确认可拉起
- 说明：仓库 `packageManager` 声明为 `pnpm@10.28.1`，因此构建审计优先使用 `pnpm`
