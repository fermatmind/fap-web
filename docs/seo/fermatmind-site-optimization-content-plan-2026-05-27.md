# FermatMind 网站优化与内容补充方案

审计日期：2026-05-27
目标：把 FermatMind 从“测试页面集合”升级为“可信的测评机构型产品站”，支撑长期 SEO 运营、自然流量增长、内容集群、品牌可信度、测试页转化和多语言扩展。
工作边界：本文件是研究、审计和规划交付，不修改业务代码，不新增前端静态内容，不替代 CMS/后端内容权威。

## 0A. P0 执行准则修正（2026-05-27）

`docs/seo/fermatmind-site-map-proposal.md` 现在是 P0 执行准则文件。本文早期表格中把若干新增内容页标为 P0 的地方，按以下规则统一修正：

- P0 只处理：已存在页面的 footer 链接、已存在且 indexable 页面进入 sitemap、`/help`/`/privacy`/`/terms` root path 404、help/support canonical、results/lookup 路由决策、clinical/depression indexability 决策、career/jobs indexability 决策、英文 trust-layer 404 清理、未有 CMS/backend authority 的页面不得全站链接。
- `/science`、`/methodology`、`/reliability-validity`、`/results`、`/results/*`、`/refund-policy` 降为 P1，除非只是 route reservation、holdlist 或 CMS ticket。
- `/business/api`、`/business/team-assessment`、`/business/coaches`、`/business/research` 降为 P2，并必须标记 `business_confirmation`。
- sitemap `lastmod`、sitemap `xhtml:link`、Core Web Vitals baseline、作者/审稿人/编辑政策建设为 P2。
- 繁体中文、日语、韩语、西班牙语扩展为 P3。
- 不允许新增前端硬编码正文，不允许新增虚构作者、审稿人、评价、评分、价格、顾问、引用文献，不允许新增 Review 或 AggregateRating schema。

## 0. 证据来源与未验证边界

### 0.1 实际访问过的 FermatMind 页面

- 线上页面：首页 `https://fermatmind.com/`、`/en`、`/zh`，测试中心 `/zh/tests`、`/en/tests`，文章中心 `/zh/articles`、`/en/articles`，人格 `/zh/personality`、`/en/personality`，职业 `/zh/career`、`/en/career`，关于 `/zh/about`、`/en/about`，支持 `/zh/support`、`/en/support`，企业 `/zh/business`、`/en/business`。
- 核心测试页：MBTI、Big Five、九型人格、霍兰德 RIASEC、IQ、EQ、抑郁焦虑综合评估、抑郁筛查的中英文 API 和页面均做过抽样。
- 可信与政策页：`/zh/privacy`、`/en/privacy`、`/zh/terms`、`/en/terms`、`/zh/policies`、`/zh/charter`、`/zh/foundation`、`/zh/brand`、`/zh/careers`、`/zh/method-boundaries`、`/en/method-boundaries`。
- 技术入口：`/robots.txt`、`/sitemap.xml`、`/llms.txt`、重定向样本、404 样本。
- API 抽样：`https://api.fermatmind.com/api/v0.3/scales/catalog`、`/api/v0.3/scales/lookup`、`/api/v0.5/articles`、`/api/v0.5/topics`、`/api/v0.5/content-pages/about`、`/api/v0.5/landing-surfaces/tests`。

### 0.2 实际访问过的竞品与参考页

- 123test：主页、`/all-tests/`、`/iq-tests/`、`/iq-test/`、`/personality-test/`、`/career-test/`、`/statistics/`、`/business/` 重定向后的 FAQ 商业/研究使用页、`/about_123test/`、FAQ。
- Truity：主页、TypeFinder、Big Five、Enneagram、Career Aptitude、Business/Truity@Work、API 表单；并通过搜索结果确认正确的测试目录页是 `/page/personality-tests-and-career-quizzes`，不是我最初抽样的 `/page/personality-tests`。
- OpenAI：通过 Chrome 实际查看主页和研究页；普通 `fetch/curl` 对 openai.com 返回 403，因此 OpenAI 结构结论来自 Chrome 可见 DOM 和公开搜索结果，非批量抓取。
- 可选参考：16personalities 主页、人格类型页、文章页；Open Psychometrics 主页、测试目录、Big Five 测试页。

### 0.3 检查过的本地文件

- 路由与框架：`app/(localized)/[locale]/**/page.tsx`、`app/robots.ts`、`next.config.mjs`、`next-sitemap.config.js`。
- SEO/Schema/i18n：`lib/seo/metadata.ts`、`lib/seo/generateSchema.ts`、`lib/seo/i18nPassport.ts`、`lib/seo/indexingPolicy.ts`、`lib/seo/sitemapAuthorityAdapters.cjs`、`lib/i18n/locales.ts`。
- 内容与测试：`lib/content.ts`、`lib/assessmentSlugMap.ts`、`lib/marketing/testsHubContent.ts`、`lib/tests/publicTestEntryVisibility.ts`、`app/(localized)/[locale]/tests/[slug]/page.tsx`、`app/(localized)/[locale]/articles/[slug]/page.tsx`。
- 导航与页脚：`components/layout/SiteHeader.tsx`、`components/layout/SiteFooter.tsx`、`lib/navigation/headerDropdownMenus.ts`、`components/i18n/LocaleSwitcher.tsx`。
- CMS 适配：`lib/cms/articles.ts`、`lib/cms/landing-surfaces.ts`、`lib/cms/content-pages.ts`、`lib/cms/supportTrust.ts`。

### 0.4 需要人工确认

- GSC/GA4 的真实自然流量、关键词、转化率、页面排名、索引覆盖和 Core Web Vitals 未接入，本文不编造。
- 付费深度报告价格、退款执行 SLA、企业销售漏斗、真实用户评价授权状态未验证。
- 心理测量顾问、医学/临床审稿人、编辑委员会、引用文献库目前未从公开页面验证到，需要人工补齐。
- 多语言扩展到繁中、日语、韩语、西语的市场优先级需要结合实际业务收入、投放和用户来源确认。

---

## 第一部分：FermatMind 当前网站审计

### 1.1 当前信息架构总结

| 层级 | 已验证现状 | 评价 |
|---|---|---|
| 首页 | `/` 为中文 canonical；`/zh` 308 到 `/`；`/en` 英文首页。首页有 WebPage、ItemList、Organization JSON-LD。 | 中文默认合理，但 `/zh` 和 `/` 并存需要在文档中定义清楚；主页已经有机构叙事，但“方法/研究/可信度”入口不够强。 |
| 测试中心 | `/zh/tests`、`/en/tests` 均可索引，含 8 个测试卡片；API catalog 中中英文各 8 个测试。 | 是当前最强 SEO 资产之一，但公开目录与 sitemap 不完全一致。 |
| 测试详情 | 8 个核心测试页均有 title、description、canonical、hreflang。MBTI/Big Five/Enneagram/RIASEC 有 SoftwareApplication；IQ/EQ/临床页未加 SoftwareApplication。 | 技术边界较谨慎；内容模块偏薄，缺结果示例、方法详述、相关测试矩阵、结果解读中心。 |
| 文章中心 | API 返回中文 19 篇、英文 9 篇；线上文章列表中英均可索引。文章页有 Article/Breadcrumb/FAQ 条件化 JSON-LD。 | 已具备 CMS 运营基础，但英文内容覆盖弱，集群不完整，文章详情代码中 related articles/career/types 当前初始化为空。 |
| 主题中心 | API 返回中英文各 3 个主题：MBTI、Big Five、IQ & EQ。 | 主题中心方向正确，但缺 RIASEC、九型、情绪/关系、职业选择、AI 与人格等核心集群。 |
| 人格类型 | `/personality` 中英文均有 16 型人格目录，ItemList JSON-LD。 | 对 MBTI 集群有价值，但路径与内容仍偏 MBTI，Big Five/九型人格 hub 需独立建设。 |
| 职业 | `/career`、`/career/guides`、`/career/jobs` 已存在；职业库页面 index follow，但当前 sitemap 不收录 `/career/jobs`。 | 职业内容资产已起步，需与 RIASEC、职业推荐、职业指南形成闭环。 |
| 支持/帮助 | `/zh/help`、`/en/help` 308 到 `/support`；裸 `/help` 404；`/support` 页面无 JSON-LD。 | 支持中心可用，但 help/support 命名和 SEO canonical 需统一。 |
| 机构可信层 | `/zh/about`、`/en/about`、`/zh/privacy`、`/en/privacy`、`/zh/terms`、`/en/terms`、`/zh/method-boundaries`、`/en/method-boundaries` 存在；`/zh/charter`、`/zh/brand`、`/zh/foundation`、`/zh/careers`、`/zh/policies` 存在，英文对应 404。 | 中文可信层明显强于英文；页脚没有把隐私/条款/方法边界纳入全站链接。 |
| 商业合作 | `/business` 中英文存在，内容较薄，无 schema。 | 需要拆出 team assessment、coaches、research、API、contact。 |
| Sitemap/robots | robots 允许全站并指向 sitemap；sitemap 96 条 URL，无 `xhtml:link`、无 `lastmod`，不含隐私/条款/支持/方法边界/临床两页/职业库。 | 最大技术 SEO 缺口之一：多个 indexable 核心页不在 sitemap。 |

### 1.2 当前 SEO 资产列表

| 资产 | 已验证证据 | SEO 价值 | 当前风险 |
|---|---|---|---|
| 8 个核心测试 | API catalog 中英文各 8 项；测试页都有 canonical/hreflang/metadata。 | 覆盖 MBTI、Big Five、九型、RIASEC、IQ、EQ、情绪筛查等高意图入口。 | 临床/抑郁页可索引但不在 sitemap；测试详情内容深度不足。 |
| CMS 文章 | API：中文 19 篇、英文 9 篇。 | 可形成内容集群和长尾 SEO。 | 英文缺口大；相关文章内链未充分渲染。 |
| 主题页 | API：中英文各 3 个主题。 | 支撑 hub -> article -> test 的闭环。 | 主题数量太少，职业/RIASEC/九型/情绪缺失。 |
| 人格目录 | `/personality` 有 16 型分组与 ItemList。 | MBTI 类型长尾与结果解读可扩展。 | `/types` 路由存在但 indexingPolicy 排除，命名可能分散。 |
| 职业指南与职业库 | `/career/guides` 入 sitemap；职业库页面存在。 | 支撑 RIASEC 与职业选择流量。 | `/career/jobs` index follow 但 sitemap 不收录，状态需决策。 |
| 可信内容页 | About、Privacy、Terms、Method Boundaries 等存在。 | E-E-A-T、信任、合规转化基础。 | 多数不在 sitemap/footer；英文公司层缺失。 |
| Schema 基础 | WebPage、BreadcrumbList、FAQPage、Article、Organization、ItemList、CollectionPage、Dataset、SoftwareApplication 等组件存在。 | 技术基础优于很多早期站点。 | 支持/企业页缺 schema；sitemap 无 lastmod/hreflang。 |
| i18n 结构 | `SUPPORTED_LOCALES = ["en","zh"]`；多数核心页有 alternates。 | 支撑中英文扩展。 | 英文可信层和文章数量不一致；`x-default` 多处偏 `/` 或英文，需策略统一。 |

### 1.3 当前缺失页面列表

| 类型 | 缺失或不完整页面 | 证据 | 建议 |
|---|---|---|---|
| 英文机构可信层 | `/en/charter`、`/en/brand`、`/en/foundation`、`/en/careers`、`/en/policies` | 线上返回 404；API content-pages 英文同样 404。 | P0/P1 补齐英文版本，或从 footer/sitemap 完全隐藏中文独有页的英文 alternate。 |
| 退款/联系 | `/refund`、`/zh/refund`、`/en/refund` 均重定向到 support；无独立 `/refund-policy`；裸 `/privacy`、`/terms` 404。 | 重定向抽样确认。 | 建议做独立 refund-policy/contact/support pages，根路径做明确 locale redirect。 |
| Science/Methodology 集群 | `/science`、`/methodology`、`/reliability-validity`、`/science/*` 不存在。 | 路由扫描未见。 | 建议 CMS/content_pages 或 backend authority 创建。 |
| 结果解读中心 | `/results` 当前 308 到 noindex `/results/lookup`。 | 线上抽样确认。 | 公开 SEO hub 应从私有查找工具中拆出来。 |
| 内容 hub | `/ability`、`/emotions`、`/relationships`、`/personality/big-five`、`/personality/enneagram` 等不存在。 | 路由扫描未见。 | P1/P2 建 hub，避免所有内容只围绕 `/articles`。 |
| Business 子页 | `/business/team-assessment`、`/business/coaches`、`/business/research`、`/business/api`、`/business/contact` 不存在。 | 路由扫描未见。 | 根据 Truity/123test 对标拆分。 |
| Help 子页 | `/help/start-a-test` 等不存在；`/help` 裸路径 404。 | 线上抽样。 | 统一 `/help` 或 `/support` canonical。 |

### 1.4 当前重复、薄弱、孤立或不清晰的页面

| 页面/模式 | 类型 | 证据 | 处理建议 |
|---|---|---|---|
| `/help` vs `/support` | 命名不清 | `/zh/help`、`/en/help` 重定向到 `/support`，但裸 `/help` 404。 | 选择一个 canonical。建议用户心智用 `/help`，机构信任用 `/support`，但需要产品决策；短期至少让裸 `/help` redirect。 |
| `/results` | 私有工具占用了公开 hub URL | `/zh/results` 和 `/en/results` 308 到 noindex lookup。 | 公开结果解读中心使用 `/results`，查找工具迁移为 `/results/lookup`。 |
| `/refund` | 政策页缺失 | `/refund`、`/en/refund`、`/zh/refund` redirect support；API refund page 404。 | 独立 `/refund-policy`，并从页脚、订单、支付页链接。 |
| 英文公司可信页 | 中英文不一致 | 英文 `/charter`、`/brand`、`/foundation` 等 404。 | 要么补齐，要么中文页暂不输出英文 alternate。 |
| 文章详情 related modules | 内链弱 | `app/(localized)/[locale]/articles/[slug]/page.tsx` 中 relatedArticles、relatedCareerGuides、relatedTypes 初始化为空。 | 从 CMS edges/test_edges/topic_edges 渲染。 |
| 测试页模板 | 内容薄 | 多数测试详情 h2 只有“何时使用/FAQ”，个别有版本选择。 | 增加方法依据、结果示例、边界、相关文章、相关测试、结果解读。 |
| 页脚政策组 | 孤立 | `SiteFooter.tsx` 中 `policyLinks: []`。线上 footer 未见 privacy/terms/support/method。 | P0 修复。 |

### 1.5 当前中英文结构是否一致

结论：核心测试、首页、测试中心、文章中心、人格、职业、支持、业务、隐私、条款、方法边界基本有中英文；可信公司层和内容规模不一致。

| 维度 | 中文 | 英文 | 影响 |
|---|---|---|---|
| 测试 catalog | 8/8 | 8/8 | 一致。 |
| 文章 | 19 篇 | 9 篇 | 英文 long-tail 集群明显弱。 |
| 主题 | 3 个 | 3 个 | 一致但数量不足。 |
| 公司可信层 | about/charter/foundation/brand/careers/policies/privacy/terms/method | about/privacy/terms/method，其余多个 404 | 英文 E-E-A-T 和 footer 厚度弱。 |
| 页脚 | 中文公司链接 5 个，测试 4 个，政策 0 | 英文公司仅 About，测试 4 个，政策 0 | 英文可信度更弱。 |
| Sitemap | 收录部分中英文核心页面 | 收录部分中英文核心页面 | 多个可索引页缺席。 |

### 1.6 当前页脚是否足够支撑 SEO 和机构可信度

不足。页脚目前更像最小导航，不像成熟机构站。已验证问题：

- 热门测试只链接 MBTI、Big Five、IQ、EQ；九型、RIASEC、临床/抑郁未进入 footer。
- `policyLinks` 为空，隐私、条款、其他政策、方法边界、支持中心都没有全站稳定内链。
- 中文公司组有 about/charter/foundation/careers/brand，英文只有 About。
- 社交链接很多，但对 SEO/可信度不如政策、方法、帮助、研究页稳定。

### 1.7 当前是否具备长期内容运营扩展能力

具备基础，但还不是成熟运营系统。

已具备：

- CMS/API 权威内容通道：articles、topics、content_pages、landing_surfaces、support/trust。
- SEO metadata、canonical authority、schema helpers、sitemap 适配器。
- 测试页、文章页、主题页、人格页和职业页的基础模板。

缺口：

- 内容集群 taxonomy 不完整，现有主题仅 3 个。
- 公开结果解读中心缺失。
- 文章页内部的相关内容区没有实际数据输出。
- 方法论、信度效度、测试开发、临床边界等 E-E-A-T 集群缺失。
- sitemap 与 footer 没有把可信页面纳入稳定发现路径。

### 1.8 当前最影响 SEO 增长的 10 个问题

| 排名 | 问题 | 证据 | 优先级 |
|---:|---|---|---|
| 1 | Sitemap 漏掉多个 indexable 核心页 | live sitemap 96 条；不含 privacy、terms、support、method-boundaries、clinical、depression、career/jobs。 | P0 |
| 2 | 页脚政策/支持/方法链接缺失 | `SiteFooter.tsx` 中 `policyLinks = []`；线上 footer 无 privacy/terms。 | P0 |
| 3 | 英文可信层 404 | `/en/charter`、`/en/brand`、`/en/foundation`、`/en/careers`、`/en/policies` 404。 | P0/P1 |
| 4 | `/results` 被 noindex lookup 占用 | `/results` 308 到 `/results/lookup`，后者 noindex。 | P0/P1 |
| 5 | 测试详情内容深度不足 | 多数核心测试页 h2 主要是“何时使用/FAQ”；缺结果示例/方法/边界/相关测试。 | P1 |
| 6 | 主题集群太少 | API topics 仅 MBTI、Big Five、IQ/EQ。 | P1 |
| 7 | 文章中英文规模不一致 | API articles 中文 19、英文 9。 | P1 |
| 8 | 文章详情相关内容未渲染 | 代码中 relatedArticles/relatedCareerGuides/relatedTypes 为空。 | P1 |
| 9 | 支持/企业页 schema 和转化路径薄 | `/support`、`/business` 无 JSON-LD；business 内容很短。 | P1/P2 |
| 10 | 多语言 URL/根路径策略需要更清楚 | `/zh` -> `/`，`/privacy` 404，x-default 多处为 `/`。 | P2 |

---

## 第二部分：竞品和参考网站研究

### 2.1 123test 可借鉴点

实际访问：[123test 主页](https://www.123test.com/)、[All tests](https://www.123test.com/all-tests/)、[IQ tests](https://www.123test.com/iq-tests/)、[IQ test](https://www.123test.com/iq-test/)、[Big Five personality test](https://www.123test.com/personality-test/)、[Career test](https://www.123test.com/career-test/)、[Statistics](https://www.123test.com/statistics/)、[About 123test](https://www.123test.com/about_123test/)、[FAQ](https://www.123test.com/frequently-asked-questions/)。

重点发现：

- 首页不是只卖一个测试，而是把 IQ、career、personality、assessment training、articles、company trust、statistics 串起来。
- “All tests / IQ tests / assessment training”形成非常厚的测试目录，测试页和目录页互相导流。
- 测试页模板包含 instructions、FAQ、related articles、相关测试、Product/FAQPage JSON-LD。
- 多语言在 footer 明确列出，覆盖 English、Español、Français、Nederlands、Deutsch、Italiano、Português 等。
- About 页面明确解释隐私、商业模式、认知科学基础。
- Footer 厚度很强：测试、理论内容、语言、评价、Contact。

不应照搬：

- 123test 的导航和 footer 信息密度很高，FermatMind 需要更克制，避免中文站显得像“测试超市”。
- Product schema 和评价/星级只有在真实可验证评价、价格、购买路径稳定时才能使用。

### 2.2 Truity 可借鉴点

实际访问：[Truity 主页](https://www.truity.com/)、[Personality Tests and Career Quizzes](https://www.truity.com/page/personality-tests-and-career-quizzes)、[TypeFinder](https://www.truity.com/test/type-finder-personality-test-new)、[Big Five](https://www.truity.com/test/big-five-personality-test)、[Enneagram](https://www.truity.com/test/enneagram-personality-test)、[Career Aptitude](https://www.truity.com/test/career-personality-profiler-test)、[Business](https://www.truity.com/truity-at-work/info/personality-testing-for-business)、[API form](https://www.truity.com/form/personality-test-api)。

重点发现：

- 顶层结构围绕 personality tests、career tests、business/team testing、blog/newsletter、API/affiliate/customer service。
- 测试页不仅有“开始测试”，还有大量 explanatory SEO 内容：理论是什么、测什么、为什么要测、FAQ。
- 商业页明确面向 managers、teams、organizations，解释平台、定价、团队测评、资源和 FAQ。
- E-E-A-T 表达强：测试页出现 reviewed by 心理学背景审稿人、媒体引用、用户评价、测试次数、研究/验证声明。
- Upsell 路径清楚：Free basic report -> full report / Truity@Work / group pricing。

不应照搬：

- Truity 的“reviewed by / validated / accurate”表达需要真实审稿人和验证报告支撑；FermatMind 不能在未建立证据前直接使用类似承诺。
- 强商业化测试入口对心理健康筛查不适合，临床相关页应优先安全和边界。

### 2.3 OpenAI 结构参考

实际访问：通过 Chrome 查看 [OpenAI 主页](https://openai.com/) 和 [Research](https://openai.com/research/)；普通 fetch 返回 403，因此不使用批量抓取结论。公开结构可见：Research、Business、Developers、Company、Foundation；footer 覆盖 Research Index、Safety、Security & Privacy、Trust & Transparency、Products、API、Business、Company、Careers、Brand、Help、News、Stories、Policies 等。

对 FermatMind 的启示：

- 成熟机构站不是把所有入口放在“产品”下，而是同时建立使命、方法、研究、安全、公司、支持、政策、新闻/更新体系。
- Footer 是机构可信度的承载层，不只是补充导航。
- “Research / Safety / Trust / Policies / Help”让高风险产品有解释与责任边界。FermatMind 的情绪筛查、IQ、职业建议同样需要这种结构。

不应照搬：

- FermatMind 不需要 OpenAI 级别的复杂产品/开发者生态导航；应保留测评产品站的直接 CTA。
- “Foundation/Charter/Research”只有在有内容承载时才放大，不应空设栏目。

### 2.4 可选参考补充

- [16personalities](https://www.16personalities.com/)：强视觉、人格类型库、团队测评、报告专业版、FAQ、语言切换。可借鉴人格类型库和产品化路径，不应照搬其娱乐化叙事和过度确定性的类型标签。
- [Open Psychometrics](https://openpsychometrics.org/)：结构朴素，但开放测试和说明给人方法透明感。可借鉴“数据/方法透明”，不应照搬低转化体验。

---

## 第三部分：竞品对标表

| 网站 | 核心定位 | 顶层导航 | 测试目录结构 | 内容中心结构 | 研究/方法/科学可信度 | 帮助中心 | 商业合作 | 多语言 | 付费/upsell 路径 | 页脚厚度 | SEO 内容集群 | E-E-A-T 表达 | FermatMind 可借鉴点 | 不应照搬 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 123test | 免费/专业在线测试集合，覆盖 IQ、职业、人格、能力训练。 | Home、Tests、All tests、IQ tests、Assessment training、Career test、Big Five、Articles、Career、Help、Business、Account、Language。 | All tests、IQ tests、assessment training，测试分类多且可从 nav/footer 进入。 | Articles 下有 assessment、work values、DISC、IQ、career choice、personality 等。 | About 中说明 privacy、money model、cognitive science；Statistics 页面展示使用规模。 | FAQ 独立；business/research usage 也落在 FAQ 体系。 | `business` 重定向到“Using our tests for company or research”，包含 tickets、research、linking。 | Footer 明确列出 10+ 语言。 | 免费测试 -> professional version、spring offer、cart、tickets。 | 厚：测试、理论、语言、评价、联系。 | IQ、career、personality、assessment training、theory articles。 | LocalBusiness/WebSite，测试页 Product/FAQPage；隐私和科学基础说明。 | 建 all tests、按测试族目录、统计/使用规模、测试页 related articles。 | 不照搬高密 footer 和 Product/rating，除非有真实评价和价格。 |
| Truity | 科学人格测评和职业评估，兼顾个人与团队。 | Personality tests、Career tests、Tests for workplace、Business、Blog、About/Customer Service/API/Affiliate。 | 目录页按 Enneagram、16 Types、Big Five、Career、DISC、Love、EQ、Workplace 分组。 | Blog 更新频繁；人格库、职业测试、工作场景内容互链。 | 测试页写理论、测量内容、FAQ；出现 reviewed by、validated/researched 声明和技术文档/样例报告。 | Customer Service、FAQ、newsletter。 | Truity@Work、team testing、coaches、API interest form、affiliate。 | 主要英文，未观察到大规模多语言 URL。 | Free basic report -> premium report；business group pricing；sample reports。 | 中等偏厚：blog、about、support、API、affiliate、charities、legal。 | MBTI/TypeFinder、Big Five、Enneagram、DISC、career、workplace。 | 媒体引用、用户评价、reviewed by、测试次数、研究验证。 | 建审稿人体系、样例报告、Business/API/Coach 子页、free->premium 说明。 | 不复制“validated/accurate”措辞，除非有验证报告和审稿人。 |
| OpenAI | 研究、产品、商业、开发者、公司、基金会一体化机构站。 | Research、Business、Developers、Company、Foundation、ChatGPT CTA。 | 不适用。 | News、Stories、Research Index、Safety、customer stories。 | Research、Safety、Security & Privacy、Trust & Transparency、Policies。 | Help Center 外链，政策中心完整。 | Business、Solutions、Contact Sales。 | Chrome 访问显示中文本地化路径；多语言站点策略存在。 | 产品 CTA、Business、API、Developers。 | 很厚：研究、产品、开发者、商业、公司、帮助、新闻、政策、社交。 | Research/news/stories/policies 构成机构内容分发层。 | 使命、研究、安全、隐私、政策、品牌、基金会、职业。 | FermatMind 应建立“方法与研究/信任/政策/更新”体系。 | 不照搬复杂企业导航，FermatMind 首屏仍要测试转化。 |
| 16personalities | 强品牌人格测试、人格类型库、关系/职业建议。 | Personality Test、Types、Articles、Premium、Team Assessments、Reports。 | 单核心测试 + 类型库 + team/product paths。 | Knowledge Base、类型文章、关系/职业内容。 | Our Framework、FAQ、报告专业版。 | FAQ、orders、report issue。 | Team assessments、reports for professionals。 | 声称 45+ 语言，footer 有 change language。 | 免费测试 -> Premium Career Suite / reports。 | 中等：产品、类型、文章、framework、support、legal。 | 16 型人格和关系/职业内容强。 | 大规模使用次数、框架说明、用户评价。 | 借鉴人格类型库和报告产品化。 | 不照搬过强娱乐化 persona 语气。 |

---

## 第四部分：FermatMind 推荐信息架构

### 4.1 顶部导航建议

P0 执行时不得完整启用下表中的未来导航扩展。P0 顶部导航只允许链接 `site-map-proposal.md` allowlist 中的既有 200/indexable 页面；Science、Results、Refund、Business 子页、clinical/depression 入口和英文 404 trust pages 均按 holdlist 处理。

推荐桌面主导航：

| 一级导航 | 是否进顶部 | 下拉入口 | SEO/产品理由 |
|---|---:|---|---|
| 测评 | 是 | 全部测评、人格测评、职业测评、能力测评、情绪与关系、MBTI、Big Five、九型、RIASEC、IQ、EQ | 最高转化入口，保留当前优势。 |
| 人格 | 是 | 人格中心、16 型人格、MBTI 指南、Big Five 指南、九型人格、结果解读 | 建人格内容集群，而不只是测试入口。 |
| 职业 | 是 | 职业中心、RIASEC、职业选择、岗位适配、职业库、职业指南 | 与 RIASEC 和职业推荐形成增长面。 |
| 能力 | 是 | IQ、推理能力、学习/认知能力、能力边界 | IQ/EQ 不能只放 tests；要有解释型 hub。 |
| 情绪与关系 | 是，但可二级 | EQ、关系沟通、抑郁筛查、焦虑边界、临床边界 | 高风险内容需要单独语境和安全边界。 |
| 文章 | 是 | 全部文章、人格、职业、能力、情绪关系、AI 与人格 | 承接长尾搜索。 |
| 方法与研究 | 是或“更多” | 测评科学、方法论、信度效度、题目设计、临床边界、数据说明 | E-E-A-T 核心。初期可作为顶部“方法”。 |
| 企业/合作 | 是 | 企业测评、教练、研究合作、API、联系 | 商业转化入口。 |
| 关于 FermatMind | 不建议占主导航首屏 | 关于、宪章、品牌、媒体、工作机会、基金会 | 放 footer 和 Company 下拉；等机构内容成熟后再提升。 |

### 4.2 页脚结构建议

P0 页脚只允许链接既有 allowlist 页面：tests、personality、career、articles、about、support、privacy、terms、method-boundaries 和已存在且非高风险待审的核心测试。下表中的 refund、results、science、公司子页和更新类页面是 P1/P2 扩展，未有 CMS/backend authority 前不得全站链接。

| Footer section | 推荐链接 | SEO 价值 | 用户价值 |
|---|---|---|---|
| 热门测评 | MBTI、Big Five、九型人格、霍兰德 RIASEC、IQ、EQ、抑郁筛查、抑郁焦虑综合评估 | 稳定传递内部链接权重给核心 money pages；补齐当前只链接 4 个测试的问题。 | 用户从任何页面都能回到核心测试入口。 |
| 内容与指南 | 全部文章、人格指南、职业指南、结果解读、关系与沟通、成长指南 | 建立 hub 与文章集群入口，减少文章孤岛。 | 用户能按问题继续阅读。 |
| 研究与方法 | 测评科学、方法边界、题目设计说明、信度与效度、数据说明、常见误区 | 强化 E-E-A-T，支持 MBTI/IQ/临床等敏感页。 | 用户知道结果怎么来、怎么用、不能怎么用。 |
| 支持与信任 | 帮助中心、订单查询、结果找回、退款政策、隐私政策、服务条款、联系支持 | 政策页必须有全站内链；支持页面更易被发现。 | 降低购买和保存结果后的焦虑。 |
| 公司 | 关于 FermatMind、测评宪章、品牌资料、媒体资料、工作机会、合作联系 | 形成机构型站点，而非匿名测试工具。 | 用户/媒体/合作方能快速验证主体与边界。 |
| 更新 | 产品更新、最新文章、研究笔记、更新日志、RSS/订阅 | 支撑新鲜度和爬虫发现；可承接品牌搜索。 | 用户了解产品和内容变化。 |

---

## 第五部分：建议新增/补强页面清单

说明：FermatMind 当前为 locale-prefix 架构。表中 URL 用 `/{locale}` 表示应同时规划 `/zh` 和 `/en`；中文默认首页仍可保持 `/`，但内页建议保留显式 locale。所有 publishable 内容应由 CMS/content_pages、landing_surfaces 或后端 public API 管理，前端只做渲染。

优先级修正：本节为战略页面清单，不是 P0 执行清单。新增正文页若早期标为 P0，以 `site-map-proposal.md` 为准降级：`/science`、`/methodology`、`/reliability-validity`、`/results`、`/results/*`、`/refund-policy` 为 P1；business API/team/coaches/research 为 P2 且需 `business_confirmation`；P0 只保留既有页面链接、sitemap、root redirect、results/lookup 路由决策、clinical/depression 与 career/jobs indexability 决策、英文 404 清理。

| URL | 页面类型 | 搜索意图/目标用户 | 主/辅关键词 | Title / Meta / H1 建议 | 模块结构 | 内链建议 | Schema | P | 影响 | 成本 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/{locale}/about` | 机构可信 | 验证 FermatMind 是谁 | 关于 FermatMind；测评平台 | About FermatMind / 说明使命、团队、边界 / 关于 FermatMind | 使命、适用人群、产品体系、边界、联系方式 | from footer/header; to charter/science/privacy | WebPage+Organization | P0 | High | Low | 已有，需强化中英文一致。 |
| `/{locale}/charter` | 宪章 | 了解原则与承诺 | 测评宪章；assessment charter | FermatMind Assessment Charter / 测评原则与边界 / 测评宪章 | 原则、不可承诺、隐私、临床边界、更新机制 | from footer/test pages; to science/method | WebPage | P1 | High | Medium | P0 只清理英文 404 链接；英文正文补齐为 P1。 |
| `/{locale}/science` | Science hub | 找科学依据 | 测评科学；psychometrics | Assessment Science / FermatMind 如何理解测评科学 / 测评科学 | 测评能做什么、模型来源、边界、文章入口 | from footer/test pages; to methodology/reliability | CollectionPage+Breadcrumb | P1 | High | Medium | 新增 hub，P0 只做 holdlist/CMS ticket。 |
| `/{locale}/methodology` | 方法论 | 了解题目/评分 | 测评方法；题目设计 | Methodology / 题目设计、评分与解释流程 / 测评方法论 | 题库、评分、常模、版本、质量控制 | from science/test pages; to reliability | WebPage | P1 | High | Medium | CMS 页面，P0 不全站链接。 |
| `/{locale}/reliability-validity` | 可信证据 | 查信度效度 | 信度效度；reliability validity | Reliability and Validity / 说明测评证据等级 / 信度与效度 | 概念、各测试证据、限制、待补数据 | from test pages/science | WebPage | P1 | High | High | 数据未具备时标“证据等级”。 |
| `/{locale}/data-privacy` | 隐私解释 | 数据如何保存/删除 | 数据隐私；结果删除 | Data and Privacy / 结果保存、删除、导出说明 / 数据与隐私 | 数据类型、保存、删除、导出、联系 | from footer/result pages; to privacy | WebPage+FAQPage | P1 | High | Medium | 与 privacy policy 区分：用户说明页。 |
| `/{locale}/terms` | 法务 | 使用条款 | 服务条款 | Terms of Use / 使用服务的规则 / 使用条款 | 权利责任、付费、限制、争议 | from footer/checkout | WebPage | P0 | High | Low | 已有但不在 footer/sitemap。 |
| `/{locale}/privacy` | 法务 | 隐私政策 | 隐私政策 | Privacy Policy / 数据处理与用户权利 / 隐私政策 | 数据、用途、保存、权利、联系 | from footer/signup/checkout | WebPage | P0 | High | Low | 已有但不在 footer/sitemap。 |
| `/{locale}/refund-policy` | 交易信任 | 退款规则 | 退款政策 | Refund Policy / 数字报告退款与异常处理 / 退款政策 | 适用范围、不可退、异常、SLA | from footer/orders/business | WebPage+FAQPage | P1 | High | Medium | 当前 refund 只跳 support；需 business_confirmation。 |
| `/{locale}/contact` | 支持/合作 | 联系方式 | 联系 FermatMind | Contact FermatMind / 支持、商务、媒体联系 / 联系我们 | 支持、商务、媒体、研究、响应时效 | from footer/business/support | ContactPage | P1 | Medium | Medium | 可 CMS + form。 |
| `/{locale}/help` | 帮助中心 | 解决使用问题 | 帮助中心 | Help Center / 测试、结果、订单和隐私帮助 / 帮助中心 | 分类、搜索、热门问题、自助工具 | from header/footer; to support articles | CollectionPage+FAQPage | P0 | High | Medium | 需与 `/support` canonical 决策。 |
| `/{locale}/science/what-psychological-tests-can-and-cannot-do` | 方法边界 | 用户质疑测评价值 | 心理测试能做什么 | What Psychological Tests Can and Cannot Do / 解释用途和边界 / 心理测评能做什么，不能做什么 | 定义、适用、不能替代、例子、FAQ | from all tests; to science | Article/WebPage+FAQ | P1 | High | Medium | 高风险总边界页，P0 只做 gate。 |
| `/{locale}/science/mbti-limitations` | 方法边界 | 搜 MBTI 是否科学 | MBTI 局限 | MBTI Limitations / 如何负责任使用 MBTI / MBTI 的局限与用法 | 类型模型、风险、正确使用、替代模型 | from MBTI page; to Big Five vs MBTI | Article+FAQ | P1 | High | Medium | 避免过度承诺。 |
| `/{locale}/science/big-five-vs-mbti` | 对比页 | 比较 Big Five 和 MBTI | Big Five vs MBTI | Big Five vs MBTI / 两种模型适用场景 / Big Five 与 MBTI 怎么选 | 对比表、使用场景、链接测试 | from both tests; to results hubs | Article+FAQ | P1 | High | Medium | 已有文章，可提升为 pillar。 |
| `/{locale}/science/iq-test-quality` | 质量边界 | 判断 IQ 在线测试可信度 | IQ 测试质量 | What Makes an IQ Test Useful / 在线 IQ 的质量边界 / IQ 测试质量说明 | 题型、常模、误差、专业测评区别 | from IQ page; to clinical-boundaries | Article+FAQ | P1 | High | Medium | 敏感页必需。 |
| `/{locale}/science/how-we-design-tests` | 方法论 | 了解题目设计 | 题目设计 | How We Design Tests / 题目、版本与评分流程 / 我们如何设计测评 | 流程、版本、审查、上线、迭代 | from footer/test pages | WebPage | P1 | High | Medium | E-E-A-T 核心。 |
| `/{locale}/science/how-to-interpret-results` | 结果解释 | 读懂报告 | 结果解读 | How to Interpret Results / 正确读懂测评结果 / 如何解读测评结果 | 分数、类型、置信、行动、误区 | from result pages; to results hub | WebPage+FAQ | P1 | High | Medium | 支撑转化和保存结果。 |
| `/{locale}/science/clinical-boundaries` | 临床边界 | 抑郁焦虑安全 | 抑郁测试不是诊断 | Clinical Boundaries / 情绪筛查不是医疗诊断 / 临床与安全边界 | 危机提示、何时求助、免责声明、资源 | from clinical pages; to help/privacy | MedicalWebPage?谨慎 | P1 | High | High | 需专业/法律审阅；P0 只做 indexability/review gate。 |
| `/{locale}/results` | 结果 hub | 结果怎么读 | 测试结果解读 | Results Guide / 各类测评结果解读入口 / 结果解读中心 | 按测试分组、保存/找回、FAQ、相关文章 | from tests/articles/footer; to result subpages | CollectionPage | P1 | High | Medium | 当前被 lookup 占用；P0 只做路由决策。 |
| `/{locale}/results/mbti` | 结果解读 | 查 MBTI 类型结果 | MBTI 结果解读 | MBTI Results Guide / 16 型结果如何解读 / MBTI 结果解读 | 类型、维度、A/T、职业/关系入口 | from MBTI result/test/type pages | WebPage+FAQ | P1 | High | Medium | 连接 16 型人格页。 |
| `/{locale}/results/big-five` | 结果解读 | 查 OCEAN 分数 | Big Five 结果 | Big Five Results Guide / 五大特质分数说明 / 大五结果解读 | 五维、刻面、高低分、行动 | from Big Five test/articles | WebPage+FAQ | P1 | High | Medium | 可转化深度报告。 |
| `/{locale}/results/enneagram` | 结果解读 | 查九型结果 | 九型人格结果 | Enneagram Results Guide / 九型排序和侧翼说明 / 九型人格结果解读 | 主型、副型、侧翼、压力成长 | from Enneagram page | WebPage+FAQ | P1 | Medium | Medium | |
| `/{locale}/results/holland-code` | 结果解读 | 查 RIASEC code | Holland Code result | Holland Code Results Guide / RIASEC 代码怎么用 / 霍兰德结果解读 | 六维、组合码、职业筛选 | from RIASEC/career | WebPage+FAQ | P1 | High | Medium | 职业转化关键。 |
| `/{locale}/results/iq` | 结果解读 | 查 IQ 分数 | IQ score interpretation | IQ Results Guide / 在线 IQ 分数边界 / IQ 结果解读 | 分数、误差、题型、专业测评区别 | from IQ page | WebPage+FAQ | P1 | High | Medium | 避免诊断式表达。 |
| `/{locale}/results/eq` | 结果解读 | 查 EQ 维度 | EQ results | EQ Results Guide / 情商维度与行动建议 / EQ 结果解读 | 维度、沟通、关系、训练 | from EQ page | WebPage+FAQ | P1 | Medium | Medium | |
| `/{locale}/results/depression-anxiety` | 结果解读/安全 | 查筛查结果 | 抑郁焦虑结果 | Depression and Anxiety Screening Results / 结果仅供筛查参考 / 抑郁焦虑结果说明 | 严重度、危机提示、求助、隐私 | from clinical pages/support | WebPage+FAQ | P1 | High | High | 必须专业审阅。 |
| `/{locale}/personality` | Hub | 浏览人格 | personality types | Personality Hub / 人格测评、类型和特质入口 / 人格中心 | MBTI/BigFive/九型、类型库、文章 | from nav/footer; to tests/articles | CollectionPage+ItemList | P0 | High | Low | 已有，需扩 Big Five/九型入口。 |
| `/{locale}/personality/types` | 目录 | 查人格类型 | 16 personality types | Personality Types / 16 型人格目录 / 人格类型目录 | 16 型、筛选、结果解读 | from personality/MBTI | ItemList | P1 | Medium | Medium | 可 canonical 到现有 `/personality`。 |
| `/{locale}/personality/mbti` | Pillar | MBTI 学习 | MBTI 指南 | MBTI Guide / MBTI 测试、类型与局限 / MBTI 指南 | 测试、类型、局限、文章、结果 | from nav/articles/test | CollectionPage | P1 | High | Medium | |
| `/{locale}/personality/big-five` | Pillar | Big Five 学习 | 大五人格 | Big Five Guide / OCEAN 五维完整指南 / 大五人格指南 | 五维、刻面、测试、文章 | from nav/test | CollectionPage | P1 | High | Medium | |
| `/{locale}/personality/enneagram` | Pillar | 九型学习 | 九型人格 | Enneagram Guide / 九型人格类型和边界 / 九型人格指南 | 九型、动机、侧翼、测试 | from nav/test | CollectionPage | P1 | Medium | Medium | |
| `/{locale}/career` | Hub | 职业选择 | career guidance | Career Hub / 职业测试、职业库与指南 / 职业中心 | RIASEC、职业库、指南、推荐 | from nav/footer | CollectionPage | P0 | High | Low | 已有但可加厚。 |
| `/{locale}/career/holland-code` | Pillar | 霍兰德职业兴趣 | Holland Code | Holland Code Guide / RIASEC 职业兴趣怎么用 / 霍兰德代码指南 | 六维、组合码、职业路径 | from RIASEC/career | WebPage+FAQ | P1 | High | Medium | |
| `/{locale}/career/career-choice` | Pillar | 如何选职业 | 职业选择 | How to Choose a Career / 用测评和现实验证职业方向 / 职业选择指南 | 自我、市场、实验、决策 | from career/articles | WebPage | P1 | High | Medium | |
| `/{locale}/career/job-fit` | Pillar | 岗位匹配 | job fit | Job Fit Guide / 兴趣、能力、人格与岗位适配 / 岗位适配指南 | fit 模型、误区、测试入口 | from career/business | WebPage | P1 | High | Medium | |
| `/{locale}/ability` | Hub | 能力测评 | ability tests | Ability Hub / IQ、推理和能力测评入口 / 能力中心 | IQ、推理、学习、边界 | from nav/footer | CollectionPage | P1 | High | Medium | |
| `/{locale}/ability/iq` | Pillar | IQ 测试 | IQ test | IQ Guide / IQ 测试和分数边界 / IQ 指南 | 题型、结果、质量、测试 | from IQ page | WebPage+FAQ | P1 | High | Medium | |
| `/{locale}/ability/reasoning` | Pillar | 推理能力 | reasoning ability | Reasoning Ability Guide / 矩阵推理和模式识别 / 推理能力指南 | 类型、练习、误差、测试 | from IQ/articles | WebPage | P2 | Medium | Medium | |
| `/{locale}/emotions` | Hub | 情绪状态 | emotional wellbeing | Emotions Hub / 情绪、压力与筛查边界 / 情绪状态中心 | EQ、抑郁焦虑、边界、支持 | from nav/footer | CollectionPage | P1 | High | Medium | |
| `/{locale}/relationships` | Hub | 关系沟通 | relationships communication | Relationships Hub / 关系、沟通和人格差异 / 关系与沟通 | EQ、MBTI、爱情脚本、文章 | from nav/articles | CollectionPage | P2 | Medium | Medium | |
| `/{locale}/articles` | 内容中心 | 找文章 | personality articles | Articles / 测评主题文章 / 文章 | 分类、主题、测试 CTA | from nav/footer | CollectionPage | P0 | High | Low | 已有，需分类/filter。 |
| `/{locale}/business` | 商业 hub | 企业测评 | team assessment | Business / 团队测评与合作 / 企业与合作 | 价值主张、场景、方案、联系 | from nav/footer | Organization/Service | P1 | High | Medium | 已有但薄。 |
| `/{locale}/business/team-assessment` | 商业 | 团队测评 | team personality assessment | Team Assessment / 团队人格与协作测评 / 团队测评 | 管理者、流程、样例、FAQ | from business/test pages | Service+FAQ | P2 | High | Medium | 需 business_confirmation。 |
| `/{locale}/business/coaches` | 商业 | 教练使用 | coaches assessments | Assessments for Coaches / 教练如何使用测评 / 教练合作 | 教练场景、报告、授权、联系 | from business/results | Service | P2 | Medium | Medium | 需 business_confirmation。 |
| `/{locale}/business/research` | 商业/研究 | 研究合作 | research collaboration | Research Collaboration / 数据与研究合作边界 / 研究合作 | 数据边界、伦理、流程、联系 | from science/business | WebPage | P2 | Medium | High | 需 business_confirmation 和法律/隐私。 |
| `/{locale}/business/api` | 商业/API | API 接入 | personality test API | Assessment API / 测评 API 意向申请 / 测评 API | 可用测试、限制、申请表 | from footer/business | WebPage | P2 | Medium | High | 需 business_confirmation；未验证是否计划开放。 |
| `/{locale}/business/contact` | 商业联系 | 销售咨询 | contact sales | Contact Business / 企业合作联系 / 商务联系 | 表单、场景、SLA、隐私 | from business/nav | ContactPage | P1 | Medium | Medium | |
| `/{locale}/help/start-a-test` | 帮助 | 如何开始 | start test | How to Start a Test / 选择并开始测评 / 如何开始测试 | 选测试、版本、设备、FAQ | from help/tests | FAQPage | P1 | Medium | Low | |
| `/{locale}/help/understand-results` | 帮助 | 读懂结果 | understand results | Understand Results / 分数、类型和报告说明 / 读懂结果 | 免费/付费、维度、误差 | from help/results | FAQPage | P1 | High | Low | |
| `/{locale}/help/save-results` | 帮助 | 保存结果 | save results | Save Results / 如何保存和找回结果 / 保存结果 | 邮箱、找回、隐私 | from result pages | FAQPage | P1 | Medium | Low | |
| `/{locale}/help/premium-report` | 帮助/转化 | 付费报告 | premium report | Premium Report Help / 深度报告包含什么 / 深度报告说明 | 包含内容、交付、退款 | from pay/result | FAQPage | P1 | High | Medium | 需确认付费产品。 |
| `/{locale}/help/refund` | 帮助 | 退款问题 | refund help | Refund Help / 退款条件与处理时间 / 退款帮助 | 条件、流程、联系 | from refund/orders | FAQPage | P1 | High | Low | 需 business_confirmation。 |
| `/{locale}/help/privacy` | 帮助 | 隐私问题 | privacy help | Privacy Help / 数据、删除和导出 / 隐私帮助 | 数据、删除、导出、联系 | from privacy/results | FAQPage | P1 | High | Low | |
| `/{locale}/help/contact-support` | 帮助 | 联系客服 | contact support | Contact Support / 获取订单、结果和隐私支持 / 联系支持 | 表单、分类、SLA | from support/footer | ContactPage | P1 | Medium | Medium | |

---

## 第六部分：核心测试页标准模板优化方案

优先级修正：本部分的测试页模板加厚、结果示例、方法说明、相关文章和相关测试推荐属于 P1/P2 内容与模板优化。P0 只处理已存在测试页的 sitemap/footer 允许范围、clinical/depression indexability 决策，以及高风险页面 review gate；不得在 P0 新增前端硬编码正文。

### 6.1 标准测试页模板

| 模块 | 内容要求 | SEO/转化作用 |
|---|---|---|
| 1. 首屏价值主张 | 测什么、适合谁、结果可用于什么，不夸大。 | 提升首屏相关性和 CTA 点击。 |
| 2. 基本信息 | 时长、题量、版本、结果类型、是否免费、隐私说明。 | 回答用户开始前的阻力。 |
| 3. 开始测试 CTA | 主 CTA + 版本选择；支持 attribution。 | 转化核心。 |
| 4. 适合谁测 | 学生、职场、关系、职业探索等具体场景。 | 扩长尾语义。 |
| 5. 能得到什么结果 | 维度/类型/报告模块/行动建议。 | 连接结果页和付费报告。 |
| 6. 结果示例 | 不展示真实个人数据，展示示例报告截图或结构。 | 降低完成前不确定性。 |
| 7. 方法依据 | 模型来源、量表结构、题目类型、评分逻辑概述。 | E-E-A-T。 |
| 8. 科学边界 | 不能诊断、不能决定职业/雇佣、不能定义人格。 | 高风险控制。 |
| 9. FAQ | 时长、题量、重复测试、隐私、结果如何保存、是否付费。 | FAQPage + 转化。 |
| 10. 用户评价/使用场景 | 仅使用真实授权评价；或先用“使用场景”替代。 | 信任。 |
| 11. 相关文章 | 3-6 篇 CMS 文章，按 topic/test edges。 | 内链闭环。 |
| 12. 相关测试推荐 | MBTI <-> Big Five <-> 九型；RIASEC <-> 职业；IQ <-> 推理；EQ <-> 关系。 | 增加 session depth。 |
| 13. 结果解读中心链接 | 指向 `/results/{test}`。 | 承接结果相关搜索。 |
| 14. 方法论链接 | 指向 `/science/*`。 | 信任和边界。 |
| 15. Schema | WebPage、BreadcrumbList、FAQPage；人格/职业类可 SoftwareApplication；IQ/临床类避免 Product/Rating。 | 结构化数据。 |

### 6.2 当前测试页与模板差距

| 测试页 | 当前已具备 | 缺口 | 优先级 |
|---|---|---|---|
| MBTI | title/description/canonical/hreflang；SoftwareApplication；FAQ；版本 CTA；MBTI 场景入口。 | 方法依据薄、结果示例不足、与 16 型结果页/科学边界链接不足、相关文章和相关测试推荐弱。 | P1 |
| Big Five | 双版本 CTA；SoftwareApplication；FAQ。 | 缺五维结果示例、信度效度、Big Five vs MBTI pillar 链接、职业/关系应用。 | P1 |
| 九型人格 | 双版本 CTA；SoftwareApplication；FAQ。 | 缺九型理论来源/争议/边界、结果排序/侧翼解释、相关文章集群。 | P1 |
| RIASEC | 60/140 双版本 CTA；SoftwareApplication；FAQ。 | 缺 Holland Code 结果示例、职业库/职业指南强内链、职业不能被测试决定的边界。 | P1 |
| IQ | WebPage/Breadcrumb/FAQ；无 SoftwareApplication，边界谨慎。 | 缺 IQ 测试质量页、分数误差、专业测评区别、结果示例。 | P1 |
| EQ | WebPage/Breadcrumb/FAQ；无 SoftwareApplication。 | 缺 EQ 模型解释、关系/沟通应用、相关关系内容、结果行动建议示例。 | P1 |
| 抑郁筛查 | 非医疗诊断说明；FAQ； no SoftwareApplication。 | 缺独立 clinical-boundaries 强链接、危机资源、结果解释中心、安全转化策略。 | P0 decision / P1 content |
| 抑郁焦虑综合评估 | 非医疗诊断说明；版本选择；FAQ。 | 同上；还需说明维度和专业帮助边界。 | P0 decision / P1 content |

---

## 第七部分：文章与内容集群策略

每个集群必须形成：`hub -> pillar -> article -> test page -> result interpretation -> method/science`。下面的文章标题是选题建议，不代表已存在页面；落地时应由 CMS 管理。

优先级修正：内容集群建设不是 P0。下表早期标为 P0 的集群，统一降为 P1 内容运营；P0 只保留相关测试页、footer、sitemap、route/indexability 的执行准则。

### 7.1 内容集群地图

| 集群 | Hub / Pillar / FAQ / Results / Test | 内链结构 | 商业转化机会 | P |
|---|---|---|---|---|
| MBTI | Hub `/personality/mbti`；Pillar `MBTI 完整指南`、`MBTI 局限`；FAQ `/help/mbti`；Results `/results/mbti`；Test `/tests/mbti-personality-test-16-personality-types` | hub -> 16 型 -> articles -> MBTI test -> results -> science | 深度报告、关系/职业扩展、保存结果 | P1 |
| Big Five | Hub `/personality/big-five`；Pillar `Big Five vs MBTI`、`OCEAN 五维指南`；Results `/results/big-five`；Test Big Five | hub -> 五维 pages -> articles -> test -> results -> reliability | 深度特质报告、职业/团队报告 | P1 |
| 九型人格 | Hub `/personality/enneagram`；Pillar `九型人格指南`；Results `/results/enneagram`；Test Enneagram | hub -> 9 types -> articles -> test -> results | 个人成长报告、团队沟通 | P1 |
| RIASEC | Hub `/career/holland-code`；Pillar `霍兰德职业兴趣指南`；Results `/results/holland-code`；Test RIASEC | career hub -> holland pillar -> articles -> test -> career jobs | 职业报告、职业推荐、职业库 | P1 |
| IQ/认知能力 | Hub `/ability/iq`；Pillar `IQ 测试质量`；Results `/results/iq`; Test IQ | ability -> IQ quality -> articles -> IQ test -> result guide | 能力报告、学习建议 | P1 |
| EQ/情绪能力 | Hub `/emotions` 或 `/relationships`；Pillar `EQ 指南`；Results `/results/eq`; Test EQ | emotions -> EQ articles -> EQ test -> relationships | 沟通/关系报告、订阅内容 | P1 |
| 职业选择与岗位适配 | Hub `/career`；Pillar `/career/career-choice`、`/career/job-fit`; Test RIASEC/Big Five/MBTI | career -> pillar -> guides -> tests -> jobs | 职业报告、咨询/企业合作 | P1 |
| 抑郁/焦虑/心理状态边界 | Hub `/emotions`；Pillar `/science/clinical-boundaries`; Results `/results/depression-anxiety`; Tests clinical/SDS | emotions -> clinical boundaries -> screening -> support | 不强转化；转向支持/保存/专业求助 | P1 |
| 亲密关系与沟通 | Hub `/relationships`；Pillar `人格与沟通`；Tests EQ/MBTI | relationships -> articles -> EQ/MBTI -> results | 关系报告、内容订阅 | P2 |
| AI 与人格/AI 教练/数字自我认知 | Hub `/topics/ai-personality`；Pillar `AI 教练与自我认知边界`；Tests MBTI/Big Five/EQ | topic -> articles -> tests -> results -> science | 订阅、AI coach 产品探索（未验证） | P2 |

### 7.2 每个集群 10 个推荐文章标题

| 集群 | 文章标题（用户问题；应链接测试页） |
|---|---|
| MBTI | 1. MBTI 四个字母到底代表什么（理解类型语言；MBTI）<br>2. MBTI 结果会变化吗（复测和情境差异；MBTI）<br>3. INFP/INFJ 为什么容易混淆（区分相似类型；MBTI）<br>4. MBTI 在职业选择中能用到哪一步（避免过度决定；MBTI/RIASEC）<br>5. MBTI 与亲密关系：哪些差异真正影响沟通（关系问题；MBTI/EQ）<br>6. MBTI 不是诊断：类型测试的正确用法（边界；MBTI/Science）<br>7. 16 型人格的压力反应怎么看（自我管理；MBTI）<br>8. 如何把 MBTI 结果写进个人成长计划（行动；MBTI Results）<br>9. MBTI 快速版和完整版怎么选（版本选择；MBTI）<br>10. 为什么你测出来像两种类型（置信度；MBTI Results） |
| Big Five | 1. OCEAN 五维分别说明什么（入门；Big Five）<br>2. Big Five 为什么常被认为更稳定（科学性；Big Five）<br>3. 高神经质是不是坏事（去污名；Big Five）<br>4. 尽责性如何影响学习和职业（应用；Big Five/RIASEC）<br>5. 外倾和社交能力不是一回事（误区；Big Five）<br>6. Big Five 与 MBTI 怎么选（比较；Big Five/MBTI）<br>7. 五大人格结果如何影响团队协作（团队；Big Five/Business）<br>8. 开放性高的人适合什么职业环境（职业；Big Five/RIASEC）<br>9. Big Five 分数会变吗（复测；Big Five Results）<br>10. 如何根据五维结果制定成长计划（转化；Big Five Results） |
| 九型人格 | 1. 九型人格九种核心动机是什么（入门；Enneagram）<br>2. 九型人格和 MBTI 的区别（比较；Enneagram/MBTI）<br>3. 侧翼、压力线和成长线怎么理解（结果；Enneagram Results）<br>4. 为什么九型结果会出现相邻类型（置信；Enneagram）<br>5. 九型人格适合做职业选择吗（边界；Enneagram/RIASEC）<br>6. 1 号到 9 号的沟通雷区（关系；Enneagram/EQ）<br>7. 九型人格的科学争议与正确用法（E-E-A-T；Science）<br>8. 105 题和 144 题怎么选（版本；Enneagram）<br>9. 如何用九型做自我复盘（成长；Enneagram Results）<br>10. 九型人格能不能用于招聘（高风险边界；Business/Science） |
| RIASEC | 1. RIASEC 六个字母分别代表什么（入门；RIASEC）<br>2. Holland Code 如何和职业库结合（路径；RIASEC/Career Jobs）<br>3. RIASEC 结果能不能直接决定职业（边界；RIASEC）<br>4. 60 题和 140 题怎么选（版本；RIASEC）<br>5. 社会型高的人适合什么工作环境（职业；RIASEC）<br>6. 研究型和现实型怎么区分（结果；RIASEC Results）<br>7. 职业兴趣和能力不一致怎么办（决策；RIASEC/IQ）<br>8. 高中/大学生如何用 RIASEC 做专业选择（学生；RIASEC）<br>9. 转行时如何用 RIASEC 缩小方向（转型；RIASEC）<br>10. RIASEC 与 Big Five 如何一起看（综合；RIASEC/Big Five） |
| IQ/认知能力 | 1. 在线 IQ 测试能说明什么，不能说明什么（边界；IQ）<br>2. 矩阵推理题测的是什么（题型；IQ）<br>3. IQ 分数的误差范围怎么理解（结果；IQ Results）<br>4. IQ 测试和学习能力是什么关系（应用；IQ）<br>5. IQ 测试为什么不能代表人的全部能力（边界；IQ）<br>6. 推理能力可以训练吗（成长；IQ/Reasoning）<br>7. IQ 与职业选择：能用到哪一步（职业；IQ/RIASEC）<br>8. 如何判断一个 IQ 测试质量是否可靠（E-E-A-T；IQ Quality）<br>9. 做 IQ 测试前需要准备吗（转化；IQ）<br>10. 低分或高分之后应该怎么做（结果；IQ Results） |
| EQ/情绪能力 | 1. EQ 情商到底测什么（入门；EQ）<br>2. 情绪觉察和情绪控制有什么区别（维度；EQ）<br>3. 共情能力高就一定适合服务型工作吗（边界；EQ/RIASEC）<br>4. EQ 结果如何用于沟通复盘（结果；EQ Results）<br>5. 情商测试和人格测试有什么区别（比较；EQ/Big Five）<br>6. 低 EQ 标签为什么不准确（去标签；EQ）<br>7. 关系冲突中如何使用 EQ 结果（关系；EQ/Relationships）<br>8. EQ 是否能训练（成长；EQ）<br>9. 团队协作中的情绪能力（商业；EQ/Business）<br>10. EQ 测试不适合作为什么决定（边界；EQ/Science） |
| 职业选择与岗位适配 | 1. 如何把兴趣、能力和人格放在同一张职业地图里（决策；RIASEC/Big Five）<br>2. 职业测试结果和现实岗位不一致怎么办（行动；RIASEC）<br>3. 第一份工作应该看兴趣还是能力（学生；RIASEC/IQ）<br>4. 转行前做哪几类测评（转型；RIASEC/MBTI/Big Five）<br>5. 岗位适配不是“唯一最佳职业”预测（边界；Career）<br>6. 如何用职业库做 30 天验证（行动；Career Jobs）<br>7. MBTI 职业推荐为什么只能作为线索（边界；MBTI/Career）<br>8. Big Five 如何影响工作环境偏好（应用；Big Five）<br>9. RIASEC 结果如何生成职业 shortlist（转化；RIASEC）<br>10. 职业选择中的常见误区（FAQ；Career） |
| 抑郁/焦虑/心理状态边界 | 1. 抑郁筛查和诊断有什么区别（安全；SDS）<br>2. 焦虑和压力如何区分（教育；Clinical）<br>3. 测评结果提示高风险时应该怎么办（安全；Clinical Results）<br>4. 情绪筛查结果如何保护隐私（信任；Data Privacy）<br>5. 为什么一次测试不能代表全部状态（边界；SDS）<br>6. 什么时候应该寻求专业帮助（安全；Clinical Boundaries）<br>7. 抑郁焦虑综合评估覆盖哪些维度（转化；Clinical）<br>8. 低落、倦怠和抑郁的区别（教育；SDS）<br>9. 如何和咨询师讨论自评结果（行动；Clinical Results）<br>10. 不要把筛查结果发给雇主做判断（高风险；Science） |
| 亲密关系与沟通 | 1. 为什么相爱的人也会沟通失败（关系；EQ）<br>2. MBTI 差异如何影响冲突方式（关系；MBTI/EQ）<br>3. 七种爱情脚本如何用于自我觉察（关系；EQ）<br>4. 回避、讨好和控制在沟通中的表现（成长；EQ）<br>5. 高敏感不是脆弱：关系中的情绪信号（教育；EQ）<br>6. 如何用人格结果做伴侣沟通复盘（行动；MBTI/EQ）<br>7. 关系测试不能预测谁一定合适（边界；Science）<br>8. 情绪调节能力如何影响亲密关系（应用；EQ）<br>9. 不同人格如何接受反馈（沟通；MBTI/Big Five）<br>10. 关系内容如何避免标签化伤害（边界；Science） |
| AI 与人格/数字自我认知 | 1. AI 教练适合帮你做什么，不适合做什么（边界；Science/MBTI）<br>2. 不同人格类型如何使用 AI 做复盘（兴趣；MBTI）<br>3. AI 反馈为什么可能顺着你说（安全；Big Five/MBTI）<br>4. 用 AI 解读人格结果有哪些风险（边界；Science）<br>5. 数字自我认知和真实行动如何连接（产品；Results）<br>6. 高焦虑用户使用 AI 建议时要注意什么（安全；Clinical）<br>7. AI 能不能帮你选职业（边界；RIASEC/Career）<br>8. 如何把测评结果作为 AI coach 的上下文（转化；MBTI/Big Five）<br>9. 算法信任与人格差异（研究；Big Five）<br>10. AI 与心理测评的数据隐私问题（信任；Data Privacy） |

---

## 第八部分：多语言 SEO 方案

### 8.1 当前多语言问题

| 问题 | 证据 | 建议 |
|---|---|---|
| 核心产品中英文基本对应，但公司可信层不对应 | 英文 `/charter`、`/brand`、`/foundation`、`/careers`、`/policies` 404。 | P0/P1 补齐英文，或移除无内容的英文链接/alternate。 |
| 文章规模不对等 | API 中文 19、英文 9。 | 英文先补 P0 集群，不要求所有中文文章机械翻译。 |
| sitemap 无 hreflang alternate | live sitemap `xhtml:link` 数为 0。 | 页面 head 已有 hreflang，sitemap 可作为 P2 增强。 |
| sitemap 漏掉政策/支持/方法 | privacy/terms/support/method 不在 sitemap。 | P0 修复。 |
| URL 命名有 mixed policy | 中文首页 canonical `/`，其他中文多为 `/zh/*`；`/zh` redirect `/`。 | 保持也可，但要写入规则；根隐私/条款应 redirect locale。 |
| help/support 语言切换心智不清 | `/help` 裸路径 404，localized help -> support。 | 统一 canonical。 |

### 8.2 推荐 URL 结构

- 中文默认首页：保留 `https://fermatmind.com/`，`/zh` 继续 308 到 `/`。
- 中文内页：统一 `https://fermatmind.com/zh/...`。
- 英文：统一 `https://fermatmind.com/en/...`。
- 未来语言：`/zh-hant/...`、`/ja/...`、`/ko/...`、`/es/...`。
- 裸 `/privacy`、`/terms`、`/help`、`/contact`：根据 Accept-Language 或默认英文/中文策略 redirect 到 locale 版本，不要 404。

### 8.3 hreflang 策略

- 页面 head：继续输出 `en`、`zh-CN`、`x-default`。
- `x-default`：建议对首页用 `/`；对非首页国际入口可用英文 canonical 或语言选择页。当前多处 `xDefault: "/"` 可接受，但英文国际 SEO 更强时应改为对应英文 URL。
- 只有当对应语言页面真实存在且可索引时才输出 alternate。英文 404 页面不得作为 alternate。
- Sitemap 可 P2 增加 `xhtml:link`，但优先级低于补漏收录和内容一致性。

### 8.4 语言优先级

| 阶段 | 语言 | 策略 |
|---|---|---|
| P0 | 中文简体 + 英文既有核心页 | 只修复既有中英文页面的 404、sitemap、footer、canonical 和 indexability 决策。 |
| P1 | 中文简体 + 英文新增可信/结果/方法页 | `/science`、`/methodology`、`/reliability-validity`、`/results`、`/results/*`、`/refund-policy` 等新增正文页。 |
| P3 | 繁体中文 | 适合人格/职业/情绪内容；需本地化词汇，不只转换字形。 |
| P3 | 日语/韩语 | 先测 MBTI/Big Five/RIASEC/结果解读，不先翻整站。 |
| P3 | 西班牙语 | 参考 123test 多语言策略，先测测试页和 evergreen articles。 |

### 8.5 前 30 个最应该双语化的页面

1. `/tests`
2. `/tests/mbti-personality-test-16-personality-types`
3. `/tests/big-five-personality-test-ocean-model`
4. `/tests/enneagram-personality-test-nine-types`
5. `/tests/holland-career-interest-test-riasec`
6. `/tests/iq-test-intelligence-quotient-assessment`
7. `/tests/eq-test-emotional-intelligence-assessment`
8. `/tests/depression-screening-test-standard-edition`
9. `/tests/clinical-depression-anxiety-assessment-professional-edition`
10. `/about`
11. `/charter`
12. `/science`
13. `/methodology`
14. `/reliability-validity`
15. `/science/clinical-boundaries`
16. `/privacy`
17. `/terms`
18. `/refund-policy`
19. `/help`
20. `/contact`
21. `/results`
22. `/results/mbti`
23. `/results/big-five`
24. `/results/holland-code`
25. `/personality`
26. `/personality/mbti`
27. `/personality/big-five`
28. `/career`
29. `/career/holland-code`
30. `/business`

### 8.6 多语言内容生产 SOP

1. 先定义页面的搜索意图和文化语境，不直接翻译标题。
2. 同步维护 canonical、hreflang、OG、schema、FAQ。
3. 高风险页面（临床、IQ、职业建议）先做本地化审阅，再上线。
4. CMS 中记录源语言、译者/审阅人、更新时间、证据等级。
5. 页面上线前检查：200 状态、非 fallback 文案、无 404 alternate、sitemap inclusion、footer/header 内链。

---

## 第九部分：技术 SEO backlog

| 问题 | 证据 | 影响 | 修复建议 | 涉及页面 | P | 技术难度 | 工作量 | 需开发 | 需内容 | 验收标准 |
|---|---|---|---|---|---|---|---|---|---|---|
| Sitemap 漏掉 indexable 政策/支持/方法页 | live sitemap 不含 privacy/terms/support/method。 | 重要信任页发现弱。 | 更新 sitemap authority inclusion。 | privacy/terms/support/method | P0 | Medium | 0.5-1d | 是 | 否 | sitemap 包含且页面 200/index。 |
| 临床/抑郁页 indexable 但不在 sitemap | sitemap 不含 clinical/depression；页面 robots index follow。 | 搜索发现和策略不一致。 | 决策：若允许收录，移出 hidden sitemap；若不允许，noindex。 | 两个临床页中英文 | P0 | Medium | 0.5d | 是 | 是 | sitemap/indexability 一致。 |
| Footer policyLinks 为空 | 代码 `policyLinks: []`，线上 footer 无政策链接。 | 全站信任内链弱。 | P0 只增加 allowlist 中已存在的 support/privacy/terms/method-boundaries 等；refund/science/results 不进 P0 footer。 | 全站 | P0 | Low | 0.5d | 是 | 否 | footer 可见稳定链接且无 holdlist URL。 |
| 英文可信页 404 | `/en/charter` 等 404。 | hreflang/信任/英文转化弱。 | 补 CMS 英文 content_pages 或隐藏。 | en company pages | P0/P1 | Low | 1-3d | 可能 | 是 | 200 + metadata + footer。 |
| `/help` 裸路径 404 | 抽样 `/help` 404。 | 用户和爬虫发现断层。 | P0 确定性 redirect：`/help` -> `/zh/support`，`/zh/help` -> `/zh/support`，`/en/help` -> `/en/support`。 | `/help` | P0 | Low | 0.5d | 是 | 否 | `/help` 非 404，且不使用 Accept-Language 作为 SEO 关键路径。 |
| `/results` 被 noindex lookup 占用 | `/results` -> `/results/lookup` noindex。 | 结果解读 SEO 无法建设。 | P0 只做 route decision/reservation；public `/results` hub 正文建设为 P1。 | results | P0 decision / P1 content | Medium | 1-2d | 是 | 是 | lookup 保持 noindex 且不进 sitemap；`/results` 未有 CMS authority 前不进 footer/global nav。 |
| Sitemap 无 `lastmod` | live sitemap `lastmod=0`。 | 新鲜度信号弱。 | 从 CMS published/updated authority 输出 lastmod。 | sitemap | P2 | Medium | 1d | 是 | 否 | 核心 CMS 页有 lastmod。 |
| Sitemap 无 hreflang | `xhtml:link=0`。 | 多语言发现辅助弱。 | P2 增加 alternate links。 | sitemap | P2 | Medium | 1d | 是 | 否 | sitemap 中 alternate 正确。 |
| Support/Business 无 JSON-LD | 抽样 jsonLdTypes 为空。 | 结构化理解弱。 | Support 用 WebPage/FAQ/Breadcrumb；Business 用 Service/Organization。 | support/business | P1 | Low | 1d | 是 | 是 | JSON-LD 可解析。 |
| Article related modules 为空 | 代码 related arrays 初始化为空。 | 内容集群闭环弱。 | 从 CMS edges 渲染相关文章/职业/类型。 | articles detail | P1 | Medium | 1-2d | 是 | 是 | 文章页可见 3 类 related。 |
| Career jobs index follow 但不在 sitemap | `/career/jobs` index follow；sitemap 不含。 | 策略不一致。 | P0 决策：若性能/API readiness 未过，应 noindex；否则入 sitemap。 | career jobs | P0 decision | Medium | 1d | 是 | 否 | index/sitemap 策略一致。 |
| Root privacy/terms 404 | `/privacy`、`/terms` 404。 | 品牌搜索和政策查找差。 | P0 确定性 redirect：`/privacy` -> `/zh/privacy`，`/terms` -> `/zh/terms`。 | root policies | P0 | Low | 0.5d | 是 | 否 | root 非 404，且不使用 Accept-Language 作为 SEO 关键路径。 |
| 大小写 URL 404 | `/ZH/tests` 404；slug 大写有 redirect。 | 小风险。 | 可保持；或统一 lowercase redirect。 | all routes | P3 | Medium | 1d | 是 | 否 | 决策文档。 |
| 404 只有 meta noindex，无 header | 404 HTML meta noindex，header 无 X-Robots。 | 可接受，增强项。 | 可加 header noindex。 | 404 | P3 | Low | 0.5d | 是 | 否 | header+meta 双保险。 |
| OpenGraph/Twitter 基础有，但测试页 OG image authority 未全部确认 | 页面有 Twitter card；API og_image 抽样未展开。 | 社交预览质量可能不均。 | CMS media variants 检查。 | tests/articles | P2 | Medium | 1-2d | 是 | 是 | OG image 非空且尺寸合规。 |
| 高风险页面免责声明需更强 | 临床页有非医疗诊断说明，但结果中心/帮助未补。 | 法务和用户安全。 | P0 只做 clinical/depression indexability 决策和 review gate；clinical-boundaries/results 正文页为 P1。 | clinical/SDS/results | P0 decision / P1 content | Medium | 2-4d | 是 | 是 | noindex 或 pending decision 不进 sitemap/footer；indexable 必须 review_completed=true。 |
| Core Web Vitals 未验证 | 未运行 Lighthouse/GSC。 | 性能未知。 | 接入 CrUX/GSC/Lighthouse CI；先关注 career/jobs 大页面。 | 全站 | P2 | Medium | 2-3d | 是 | 否 | 有 CWV baseline。 |
| JS 渲染风险较低但需持续抽样 | SSR HTML 中可见 h1/title/body/schema。 | 当前可索引内容基本可见。 | 建 SEO smoke。 | core pages | P2 | Low | 1d | 是 | 否 | SSR content check 通过。 |
| Review/AggregateRating 不适合上 | 无真实公开评价授权/评分证据。 | 滥用 schema 风险。 | 不新增 Review 或 AggregateRating schema。 | tests | P0 guardrail | Low | 0d | 否 | 是 | 文档约束。 |

---

## 第十部分：E-E-A-T 与可信度建设

### 10.1 E-E-A-T 缺口

- 缺少公开作者页/审稿人页；文章目前展示 `Fermat Institute`，但没有可点击作者机构说明。
- 缺少编辑政策：如何选题、如何引用、如何更新、如何处理心理健康边界。
- 缺少心理测量顾问/临床顾问说明；如未有顾问，必须标注“需要人工确认”，不能虚构。
- 缺少信度效度/题目设计/测试开发文档。
- 抑郁/焦虑页已有非医疗诊断提示，但缺完整 clinical boundary hub 和危机资源说明。
- IQ 页缺“娱乐/筛查/专业测评”边界。
- MBTI/九型需更明确“不是科学诊断/不定义人”的边界。
- 数据保存、删除、导出、找回结果说明需要从 privacy policy 抽象成用户可读页。

### 10.2 推荐新增可信度页面

| 页面 | 目的 | P |
|---|---|---|
| `/science` | 方法与科学总入口 | P1 |
| `/methodology` | 题目设计、评分、版本说明 | P1 |
| `/reliability-validity` | 各测评证据等级 | P1 |
| `/science/clinical-boundaries` | 情绪筛查安全边界 | P1 |
| `/science/iq-test-quality` | IQ 在线测试质量边界 | P1 |
| `/editorial-policy` | 作者、审稿、引用、更新政策 | P2 |
| `/authors/fermat-institute` | 机构作者页 | P2 |
| `/data-privacy` | 用户可读数据说明 | P1 |

### 10.3 作者/审稿人/编辑政策模板

| 元素 | 模板 |
|---|---|
| 作者 | 姓名/机构、角色、专业范围、利益冲突说明、联系方式。 |
| 审稿人 | 姓名、资格、审稿范围、最近审稿日期。无审稿人时不要显示 reviewed by。 |
| 编辑政策 | 选题来源、引用标准、更新频率、纠错流程、高风险内容升级流程。 |
| 引用格式 | 推荐 APA/DOI/官方来源；正文显示“参考资料”模块。 |
| 更新时间 | publishedAt + updatedAt + reviewedAt 分开。 |

### 10.4 测试页可信度模块模板

- “本测评基于什么模型”：模型、维度、题型。
- “结果适合用于”：自我理解、沟通、职业探索的哪一步。
- “结果不适合用于”：医疗诊断、雇佣录用、法律判断、给他人贴标签。
- “版本与题量”：公开版本、增强版本、评分差异。
- “数据与隐私”：保存、删除、找回、匿名化说明。
- “进一步阅读”：science/methodology/reliability links。

### 10.5 文章页可信度模块模板

- 作者/审稿人/更新时间。
- “本文属于”：工具说明、方法边界、成长指南、关系沟通、职业指南。
- “适用边界”：尤其临床/IQ/职业建议。
- 引用资料。
- 相关测试和结果解读链接。

### 10.6 高风险页面免责声明策略

| 页面类型 | 必须说明 | 不应出现 |
|---|---|---|
| 抑郁/焦虑 | 非诊断、危机求助、专业帮助、隐私保护。 | “确诊”“治疗建议”“保证改善”。 |
| IQ | 在线测评误差、不能代表全部能力、专业评估区别。 | “真实 IQ”“权威认证”除非有证据。 |
| 职业推荐 | 结果是探索线索，不能替代市场/能力/经验验证。 | “唯一最佳职业”“精准匹配”“保证成功”。 |
| MBTI/九型 | 类型是讨论框架，不定义人。 | “天生如此”“决定命运”。 |
| 企业测评 | 不用于单独录用/淘汰。 | “招聘筛选准确预测”。 |

---

## 第十一部分：商业转化与 SEO 的连接

### 11.1 页面 CTA 分层

| 页面类型 | 主 CTA | 次 CTA | 不强转化点 |
|---|---|---|---|
| 测试页 | 开始测试/选择版本 | 查看结果示例、方法说明 | 临床页不要强推付费。 |
| 文章页 | 依据主题推荐一个相关测试 | 阅读结果解读/方法边界 | 纯边界/安全文章应以帮助为主。 |
| 结果页 | 保存结果、阅读完整解释 | 购买深度报告、相关测试 | 高风险结果先给安全建议。 |
| 结果解读 hub | 找自己的测试结果类型 | 开始对应测试 | 不承诺诊断/职业决定。 |
| 帮助中心 | 找回结果/订单/联系支持 | 隐私/退款/报告说明 | 不做硬销售。 |
| 商业合作 | 联系商务/预约演示 | 下载样例、查看方案 | 不在个人心理健康页强推企业。 |

### 11.2 测试页转化路径

SEO landing -> 测试详情 -> 版本选择 -> take page -> 完成 -> 免费结果摘要 -> 保存结果 -> 结果解读 -> 深度报告/相关文章/相关测试。

关键优化：

- 首屏显示题量、时长、结果类型。
- 版本选择文案要解释“为什么选短版/长版”。
- 结果示例要在开始前可见。
- 方法与边界链接不要离开转化链，而是在页面下方建立信任。

### 11.3 不同意图 CTA 文案建议

| 用户意图 | CTA 文案 |
|---|---|
| 想快速知道类型 | 开始快速版测试 |
| 想要完整报告 | 开始完整版并查看深度结果 |
| 比较 MBTI/Big Five | 先看 Big Five 与 MBTI 怎么选 |
| 职业探索 | 先做 RIASEC，生成职业兴趣轮廓 |
| 情绪状态 | 先阅读非诊断说明，再开始筛查 |
| 企业团队 | 了解团队测评方案 |
| 隐私担忧 | 先查看数据与隐私说明 |

---

## 第十二部分：实施路线图

| 阶段 | 目标 | 任务 | 负责人 | 产出物 | 验收标准 | 预期影响 | 风险/依赖 |
|---|---|---|---|---|---|---|---|
| 7 天 P0 | 修复发现与信任基础 | P0 allowlist/holdlist；已存在页面 footer；已存在 indexable 页面 sitemap；`/help`、`/privacy`、`/terms` 确定性 redirect；help/support canonical；results/lookup 路由决策；clinical/depression 和 career/jobs indexability 决策；英文 404 trust pages 清理。 | 开发+SEO+内容+产品 | 技术 PR + route matrix + holdlist | sitemap 与 robots 一致；footer 只链接 allowlist；无英文 404 链接；noindex 不进 sitemap。 | 高 | 需确认 clinical/depression 和 career/jobs 收录策略。 |
| 2 周 P1 页面补充 | 上线可信层和结果 hub | `/science`、`/methodology`、`/reliability-validity`、`/data-privacy`、`/refund-policy`、`/results`、`/results/mbti`、`/results/big-five`、`/results/holland-code`。 | 内容+SEO+开发 | CMS 页面 + 模板 | 页面 200/index；schema；内链。 | 高 | 内容需审稿；refund 需 business_confirmation。 |
| 30 天内容集群 | 建 5 个 P1 集群 | MBTI、Big Five、RIASEC、职业选择、临床边界各 1 hub + 3-5 supporting articles。 | 内容+SEO | 20-25 篇/页 | 每个集群闭环到测试和结果页。 | 高 | 不得前端硬编码内容。 |
| 60 天技术/多语言 | 完善多语言和技术 SEO | 英文公司可信层补齐；sitemap lastmod；article related 渲染；support/business schema；CWV baseline。 | 开发+内容+SEO | PR + 监控报表 | 无 404 alternate；核心页 CWV baseline。 | Medium/High | GSC/CrUX 权限。 |
| 90 天规模化运营 | 中台化内容生产 | taxonomy、作者/审稿人、引用库、内容 SOP、内容更新日历、英文优先页、繁中/日/韩/西试点。 | 产品+内容+SEO+设计 | SOP + CMS 字段 + 60-100 内容资产 | 每个核心测试有 hub/pillar/articles/results/method 闭环。 | High | 顾问/审稿资源。 |

---

## 第十三部分：最终优先级建议清单

### P0 必做

1. 修复 footer：只加入 allowlist 中已存在的 privacy、terms、support、method-boundaries、core tests、tests/personality/career/articles/about。
2. 修复 sitemap：加入已存在且 indexable 的 privacy、terms、support、method-boundaries 和核心测试；对 clinical/depression/career/jobs 做收录决策。
3. 补齐或隐藏英文可信层 404：charter、brand、foundation、careers、policies。
4. 决策 `/results` 与 `/results/lookup`：lookup 保持 noindex，不进 sitemap；public `/results` 正文建设留到 P1。
5. 修复 root path 404：`/privacy` -> `/zh/privacy`，`/terms` -> `/zh/terms`，`/help` -> `/zh/support`，`/zh/help` -> `/zh/support`，`/en/help` -> `/en/support`。
6. clinical/depression 页面 pending 或 noindex 时不得进入 sitemap/footer/global nav；若 indexable 必须 `review_completed=true`。
7. 建立 no-link-until-content-exists gate：未有 CMS/backend authority 的页面不得全站链接。

### P1 增长建设

8. 上线 `/science`、`/methodology`、`/reliability-validity`、`/results`、`/results/*`、`/refund-policy` 等 CMS 正文页。
9. 加厚 MBTI、Big Five、RIASEC 测试页：结果示例、方法依据、科学边界、相关文章、相关测试。
10. 建 RIASEC 职业内容闭环：`/career/holland-code` -> RIASEC test -> `/results/holland-code` -> 职业库/职业指南。
11. 建 Big Five 与 MBTI 对比 pillar，并从两个测试页互链。
12. 建英文核心内容补齐计划：优先 30 个页面，不机械翻译。
13. Support/help 拆分 start-test、understand-results、save-results、premium-report、refund、privacy、contact-support。
14. Business 拆分 team assessment、coaches、research、api、contact，作为 P2 且必须 `business_confirmation`。

### P2/P3 增强

15. sitemap 增加 `lastmod` 与 `xhtml:link`。
16. 接入 CWV/GSC/GA4 搜索漏斗报表。
17. 作者/审稿人/编辑政策公开化。
18. 建产品更新/研究笔记/更新日志。
19. 繁中/日/韩/西试点，先测核心测试页和结果页；优先级 P3。

### Repository rule impact

本方案本身只新增规划文档，不改变内容权威。后续实现必须遵守仓库规则：

- 文章、帮助、政策、公司、方法、结果解读、landing 内容应由 CMS/backend authority 管理。
- 前端只能实现渲染组件、路由、metadata/schema、内链组件、fallback minimal shell，不得新增本地 editorial fallback。
- 若新增 content surface，PR 必须说明其权威来源：CMS/backend-authoritative、frontend product-code-only、temporary migration fallback 或 deprecated。
