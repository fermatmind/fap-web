# FermatMind SEO Operations Plan — 2026-06-02

## 1. 一句话结论

从 2026-06-02 开始，FermatMind SEO 应先围绕中文核心测试页做小规模运营：每天看索引、搜索展现、文章到测试页点击和 GA4 Key Events，不启动博客系统、不批量发文、不投放大预算；先用 5-8 篇高意图文章验证 MBTI / Holland / Big Five 哪条线能带来 `start_test` 和 `complete_test`。

## 2. 当前 SEO 基线

扫描方式：只读访问 `https://fermatmind.com`、生产 `robots.txt`、生产 `sitemap.xml`、核心公开页和 synthetic private/noindex 路由。不访问真实 result/order/share id，不创建订单，不触发支付。

### 技术基线

| 项目 | 当前状态 | 运营判断 |
| --- | --- | --- |
| robots | `User-Agent: *` / `Allow: /` / `Sitemap: https://fermatmind.com/sitemap.xml` | 可运营 |
| sitemap | 生产 sitemap 可访问，解析到 2270 个 `<loc>` | 可运营，但需确认部分核心入口是否应精确入 sitemap |
| private URL 排除 | sitemap 精确检查未发现 `/result`、`/orders`、`/share`、`/pay`、`/payment`、`/history`、`orderNo`、`resultId`、`token` | 通过 |
| public analytics bootstrap | 公开页 HTML 有 `fm-analytics-bootstrap` / `data-analytics-bootstrap` | 公开页正常 |
| private analytics bootstrap | synthetic private HTML 仍看到 `fm-analytics-bootstrap` / `data-analytics-bootstrap` | 当前生产仍有风险；等待 P0-12 / PR #992 merge + deploy 后复查 |
| private metadata | synthetic private route 返回 `noindex, nofollow, noarchive, nocache` | 索引治理方向正确 |

### sitemap 精确检查

| URL | sitemap |
| --- | --- |
| `/` | Yes |
| `/zh` | No，生产访问会落到 canonical root |
| `/zh/tests` | Yes |
| `/zh/tests/mbti-personality-test-16-personality-types` | Yes |
| `/zh/tests/holland-career-interest-test-riasec` | Yes |
| `/zh/tests/big-five-personality-test-ocean-model` | Yes |
| `/zh/personality` | Yes |
| `/zh/career/jobs` | No，页面可访问但未作为精确 loc 出现 |
| `/zh/articles` | Yes |

### 核心页面扫描

| 页面 | indexability | title | description | canonical | sitemap | CTA | SEO 落地页判断 | 当前最大问题 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | index, follow | FermatMind / 费马测试 | 费马测试提供清晰、可继续使用的测评结果，帮助你看清人格、能力与职业方向。 | `https://fermatmind.com` | Yes | 有开始测试 | 品牌首页 | 更适合作品牌入口，不适合承接非品牌高意图词 |
| `/zh` | 200 后 canonical 到 root | FermatMind / 费马测试 | 同首页 | `https://fermatmind.com` | No | 有开始测试 | 品牌入口 | 需要确认中文首页是否应该有独立 canonical/locale URL |
| `/zh/tests` | index, follow | 测评入口中心 | 按问题或分类进入 FermatMind 测评入口，更快判断从哪一个测试开始。 | `/zh/tests` | Yes | 有测试入口 | 测试导航页 | H1 偏泛，关键词承接不如单测页直接 |
| `/zh/tests/mbti-personality-test-16-personality-types` | index, follow | MBTI 性格测试（16型人格测试） | 通过结构化测评了解你的 MBTI 类型、偏好强度与沟通协作方式。 | 当前 URL | Yes | 有开始测试 | P0 核心测试页 | 可运营；内容深度还要靠 CMS landing surface 或文章内链补强 |
| `/zh/tests/holland-career-interest-test-riasec` | index, follow | 霍兰德职业兴趣测试（RIASEC） | 通过结构化测评了解你的现实型、研究型、艺术型、社会型、企业型与常规型兴趣排序。 | 当前 URL | Yes | 有开始测试 | P0 核心测试页 | 可运营；职业决策文章应优先导向此页 |
| `/zh/tests/big-five-personality-test-ocean-model` | index, follow | 大五人格测试（OCEAN 模型） | 用一次测评了解开放性、尽责性、外倾性、宜人性与神经质。 | 当前 URL | Yes | 有开始测试 | P1 测试页 | 可作为对比文章和人格科学主题承接页 |
| `/zh/personality` | index, follow | 人格类型 | 先做 MBTI 测试，或直接浏览 16 型人格内容。 | `/zh/personality` | Yes | 有测试入口 | 人格实体入口 | 缺少 FAQ schema，适合作 MBTI 类型长尾中转 |
| `/zh/career/jobs` | index, follow | 全部职业库 | 浏览 FermatMind 职业数据库，按行业筛选职业，并进入已开放的职业详情页。 | `/zh/career/jobs` | No | 有测试入口 | 职业实体入口 | 页面可访问但不在 sitemap；需确认是否应纳入职业 SEO 主入口 |
| `/zh/articles` | index, follow | 文章 | 按测评主题整理的工具说明、成长引导与叙事画像。 | `/zh/articles` | Yes | 有测试入口 | 文章入口 | 已有文章，但需要控制质量和内链，不扩成完整博客系统 |

### private/noindex synthetic 检查

| 页面 | robots | canonical | 当前观察 |
| --- | --- | --- | --- |
| `/zh/result/SYNTHETIC_DO_NOT_USE` | noindex, nofollow, noarchive, nocache | 无 canonical | HTML 仍有 analytics bootstrap 标记和 synthetic id；需等 P0-12 部署复查 |
| `/zh/orders/lookup?orderNo=SYNTHETIC_DO_NOT_USE` | noindex, nofollow, noarchive, nocache | `/zh/orders/lookup` | canonical 不含 orderNo；HTML 仍有 analytics bootstrap 标记 |
| `/zh/share/SYNTHETIC_DO_NOT_USE` | noindex, nofollow, noarchive, nocache | `/zh/share` | HTML 仍有 analytics bootstrap 标记和 shareId/synthetic id |

## 3. 数据源可用性

| 数据源 | 当前是否完成读取 | 缺失数据 | 需要用户提供 |
| --- | --- | --- | --- |
| GA4 | 未确认。当前扫描没有可用已登录 GA4 数据源。 | 最近 1/7/28 天 active users、new users、sessions、landing pages、events、Key Events、traffic acquisition。 | GA4 只读权限，或截图/导出：Acquisition、Landing pages、Events、Key Events。 |
| 百度统计 | 未确认。当前扫描没有可用已登录百度统计数据源。 | 最近 1/7/30 天 PV、UV、IP、跳出率、平均访问时长、入口页、受访页、来源网站、搜索词。 | 百度统计只读权限，或截图/导出：入口页面、受访页面、来源网站、搜索词。 |
| Google Search Console | 未确认。当前扫描没有可用已登录 GSC 数据源。 | clicks、impressions、CTR、average position、queries、pages、indexing pages、sitemap 读取状态、URL Inspection。 | GSC 只读权限，或导出 Performance/Search results、Indexing/Pages、Sitemaps。 |
| 百度搜索资源平台 | 未确认。当前扫描没有可用已登录后台。 | 站点验证、sitemap 提交、索引量、抓取异常、搜索词/流量、API 推送配额。 | 百度搜索资源平台只读权限，或截图：站点概况、资源提交、抓取异常、流量与关键词。 |

当前不能判断：

- GA4 Key Events 是否已经开始有生产数据。
- 哪些页面带来 `start_test`。
- MBTI / Holland / Big Five 哪条线真实更强。
- Direct / Unassigned 是否仍异常高。
- 百度统计是否仍出现 `orderNo`、`/result`、`/share`、`/orders`、`tongji.baidu.com`。
- Google / 百度是否已有非品牌词展现。

## 4. 页面优先级

| 页面 | 当前角色 | 目标关键词 | 搜索意图 | 当前问题 | 今日可做运营动作 | 本周可做动作 | 是否需要 CMS 内容 | 是否暂缓 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/zh/tests/mbti-personality-test-16-personality-types` | 核心测试页 | MBTI性格测试、16型人格测试、免费MBTI测试 | 直接做测试 | 页面可索引，CTA 存在；内容深度仍需 CMS/文章支持 | 记录 title/desc/canonical；确认文章内链目标 | 让 2-3 篇 MBTI 文章链接到此页并带 CTA | 是，landing_surface 后续可补 | No |
| `/zh/tests/holland-career-interest-test-riasec` | 核心测试页 | 霍兰德职业兴趣测试、RIASEC测试、职业兴趣测试 | 职业兴趣测评 | 页面可索引，适合职业决策流量 | 记录基线；作为职业决策文章主 CTA | 写 2 篇职业决策文章导向此页 | 是，landing_surface 后续可补 | No |
| `/zh/tests` | 测试导航页 | 心理测试、人格测试、职业测评 | 不确定做哪个测试 | 关键词泛，容易跳出 | 作为文章次级内链 | 根据点击热区判断是否需要调整排序 | 可能需要 CMS/page block | No |
| `/zh/personality` | 人格实体入口 | 16型人格、人格类型、MBTI类型 | 浏览类型/解释 | FAQ/结构化数据较弱 | 用作 MBTI 类型长尾内链中转 | 建立类型页内链策略 | 是，实体内容以后补 | No |
| `/zh/career/jobs` | 职业实体入口 | 职业库、职业方向、适合的职业 | 职业探索 | 页面不在 sitemap 精确 loc | 先确认是否应进入 sitemap | 职业类文章链接到职业库，但不要过度依赖 | 可能需要 CMS/API | No，但需技术确认 |
| `/zh/tests/big-five-personality-test-ocean-model` | 核心测试页/P1 | 大五人格测试、OCEAN人格测试 | 测试/对比 | 流量可能小于 MBTI，但有科学对比价值 | 用作 MBTI vs Big Five 文章 CTA | 写 1 篇对比文章导向 MBTI + Big Five | 需要后续内容 | No |
| `/zh/tests/enneagram-personality-test-nine-types` | P1 测试页 | 九型人格测试 | 测试 | 当前不是首轮主线 | 只记录 sitemap/可访问状态 | 不主动写文章，等待 MBTI/Holland 数据 | 暂不需要 | Yes |
| `/zh/articles` | 文章入口 | 人格文章、职业测评文章 | 浏览内容 | 不应扩成博客系统 | 盘点已有文章，避免重复 | 只小批量新增/准备高意图文章 | 是，CMS 发布 | No |
| `/` | 品牌首页 | 费马测试、FermatMind | 品牌导航 | 非品牌词承接弱 | 记录品牌页基线 | 看品牌词是否有展现 | 可能不需要 | No |
| `/zh/career` / `/zh/careers` | 职业实体入口 | 职业规划、职业测试 | 职业探索 | IA 有多个 career 入口，需避免分散 | 记录 sitemap 中存在 `/zh/career`、`/zh/careers` | 确定职业文章优先链接到 `/zh/career/jobs` 还是 Holland 页 | 可能需要 | 暂缓大改 |

## 5. 关键词池

优先级标准：能导向 `start_test`、能导向 `complete_test`、接近职业决策、能反哺 MBTI/Holland 主页面、搜索意图明确、适合现阶段小规模运营。

### Brand / Navigational

| keyword | intent | priority | target page | content type | CTA | internal links | metric to watch | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 费马测试 | 品牌导航 | P0 | `/` | 首页 | 开始测试 | `/zh/tests` | branded clicks, start_test | 现在做 |
| FermatMind | 品牌导航 | P0 | `/` | 首页 | Start tests | `/zh/tests` | branded clicks | 现在做 |
| fermatmind | 品牌导航 | P0 | `/` | 首页 | Start tests | `/zh/tests` | branded clicks | 现在做 |
| 费马测试 MBTI | 品牌+测试 | P0 | MBTI 测试页 | 测试页 | 开始 MBTI 测试 | `/zh/personality` | start_test | 现在做 |
| FermatMind 霍兰德 | 品牌+职业 | P0 | Holland 测试页 | 测试页 | 开始职业兴趣测试 | `/zh/career/jobs` | start_test | 现在做 |

### High-intent Test Keywords

| keyword | intent | priority | target page | content type | CTA | internal links | metric to watch | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MBTI性格测试 | 直接测试 | P0 | MBTI 测试页 | 测试页 + 文章 | 开始 MBTI 测试 | `/zh/personality` | impressions, clicks, start_test | 现在做 |
| 16型人格测试 | 直接测试 | P0 | MBTI 测试页 | 测试页 | 开始测试 | `/zh/personality` | start_test, complete_test | 现在做 |
| 免费MBTI测试 | 直接测试/价格敏感 | P0 | MBTI 测试页 | 测试页 | 免费开始 | `/zh/tests` | CTR, start_test | 现在做 |
| 霍兰德职业兴趣测试 | 直接测试 | P0 | Holland 测试页 | 测试页 + 文章 | 开始职业兴趣测试 | `/zh/career/jobs` | start_test | 现在做 |
| RIASEC测试 | 直接测试 | P0 | Holland 测试页 | 测试页 | 开始 RIASEC 测试 | `/zh/career/jobs` | impressions, start_test | 现在做 |
| 职业兴趣测试 | 测试/职业选择 | P0 | Holland 测试页 | 文章 + 测试页 | 做职业兴趣测试 | `/zh/tests` | start_test, complete_test | 现在做 |
| 职业测评 | 泛测试 | P1 | `/zh/tests` 或 Holland | 导航页 + 文章 | 选择适合的测试 | MBTI/Holland/Big Five | test selection click | 后续做 |
| 大五人格测试 | 直接测试 | P1 | Big Five 测试页 | 测试页 + 对比文章 | 开始大五测试 | MBTI 测试页 | start_test | 现在做 |

### Problem / Decision Keywords

| keyword | intent | priority | target page | content type | CTA | internal links | metric to watch | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 不知道自己适合什么职业怎么办 | 职业决策 | P0 | Holland 测试页 | 指南文章 | 先做职业兴趣测试 | MBTI、职业库 | article → test click | 现在做 |
| 大学生职业测评 | 选专业/职业 | P0 | Holland 测试页 | 指南文章 | 开始 RIASEC 测试 | Big Five、职业库 | start_test | 现在做 |
| 转行前做什么测试 | 转行决策 | P0 | Holland 测试页 | 指南文章 | 做职业兴趣测试 | MBTI、Big Five | start_test, complete_test | 现在做 |
| MBTI和霍兰德哪个更适合选职业 | 对比决策 | P0 | Holland + MBTI | 对比文章 | 先做职业兴趣测试 | MBTI、职业库 | article → test click | 现在做 |
| MBTI和大五人格有什么区别 | 对比学习 | P1 | Big Five + MBTI | 对比文章 | 做 Big Five 或 MBTI | 两个测试页 | clicks, start_test | 现在做 |
| MBTI测试准吗 | 质疑/解释 | P1 | MBTI 测试页 | 解释文章 | 开始测试并复盘结果 | Big Five | CTR, start_test | 现在做 |
| MBTI结果为什么会变 | 解释/复测 | P1 | MBTI 测试页 | 解释文章 | 重新测试 | Big Five | return users, start_test | 后续做 |

### Type / Entity Long-tail

| keyword | intent | priority | target page | content type | CTA | internal links | metric to watch | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INFP适合什么职业 | 类型+职业 | P1 | `/zh/personality` + Holland | 类型职业文章 | 做职业兴趣测试 | MBTI、Holland、职业库 | article → test click | 后续做 |
| INFJ适合什么职业 | 类型+职业 | P1 | `/zh/personality` + Holland | 类型职业文章 | 做职业兴趣测试 | MBTI、Holland、职业库 | article → test click | 后续做 |
| INTP适合什么职业 | 类型+职业 | P2 | `/zh/personality` | 类型职业文章 | 先确认 MBTI 类型 | Holland | impressions | 后续做 |
| INTJ适合什么职业 | 类型+职业 | P2 | `/zh/personality` | 类型职业文章 | 先确认 MBTI 类型 | Holland | impressions | 后续做 |
| 霍兰德S型适合什么职业 | RIASEC 实体 | P1 | Holland 测试页 | 类型解释文章 | 开始 RIASEC 测试 | 职业库 | start_test | 后续做 |
| 霍兰德I型适合什么职业 | RIASEC 实体 | P1 | Holland 测试页 | 类型解释文章 | 开始 RIASEC 测试 | 职业库 | start_test | 后续做 |
| 尽责性高是什么意思 | Big Five 实体 | P2 | Big Five 测试页 | 解释文章 | 做大五测试 | MBTI 对比 | start_test | 后续做 |
| 神经质高是什么意思 | Big Five 实体 | P2 | Big Five 测试页 | 解释文章 | 做大五测试 | 心理边界说明 | start_test | 后续做 |

## 6. 14 天执行计划

| Day | 当天目标 | 要检查的数据 | 页面 | 内容动作 | URL 提交/推送 | 指标记录 | 不做什么 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 建立运营基线 | sitemap、robots、core head、GA4/GSC/百度权限状态 | MBTI/Holland/Big Five/tests/personality/career/jobs/articles | 确认 5 篇首发文章清单 | 不自动提交后台，只记录状态 | sitemap 是否含核心页、private 是否排除 | 不改代码、不 publish |
| 2 | 完成文章 1-2 草稿 | 文章目标词、内链、CTA | MBTI、Holland | 写《不知道自己适合什么职业怎么办》《MBTI和霍兰德哪个更适合选职业》 | 不提交 sitemap | 草稿质量、CTA 链接 | 不批量生成 |
| 3 | 完成文章 3 草稿 | title/description 可读性 | Big Five/MBTI | 写《MBTI和大五人格有什么区别》 | 不提交后台 | 内链覆盖 | 不改 landing runtime |
| 4 | 准备发布前 QA | 文章 noindex/draft、canonical、CTA | 3 篇文章 | 人工审稿、事实边界、禁止夸大 | 可建议 GSC URL Inspection，不代操作 | checklist 完成率 | 不一次发 10+ 篇 |
| 5 | 小批量发布/准备 3-5 篇 | CMS draft/publish 状态由人工控制 | 文章页 + 测试页 | 每篇加入测试页 CTA 和内链 | 人工确认后提交 URL | article → test click 基线 | 不改后台配置 |
| 6 | 首次数据观察 | GA4 Realtime/Events、百度入口页、GSC 初始状态 | 已发布文章 | 不急改内容，只看是否采集 | 不推送 API | start_test 是否出现 | 不因无数据立刻重写 |
| 7 | 第一次微调 | CTR、入口页、CTA 点击 | 首批文章 | 改 title/description 或首屏 CTA 仅限必要 | 人工 URL inspection | clicks/start_test | 不继续扩到 20 篇 |
| 8 | 决定第二批方向 | MBTI vs Holland article → test click | MBTI/Holland | 若 Holland 点击更强，写职业决策；否则写 MBTI 问答 | 不自动提交 | page path + event | 不投广告 |
| 9 | 完成第二批 1-2 篇 | 搜索意图和内链 | 职业/MBTI | 写《大学生职业测评应该怎么做》《转行前应该做什么测试》 | 人工确认 | draft readiness | 不写泛心理科普 |
| 10 | 发布/准备第二批 | CMS 状态 | 文章页 | 发布不超过 2 篇 | 人工提交 URL | article views, CTA click | 不发类型长尾大批量 |
| 11 | 检查索引 | GSC Pages、百度收录/抓取 | 已发布 URL | 对未收录页检查 canonical/internal links | 可建议 sitemap/inspection | indexed pages | 不提交 API push 除非人工确认 |
| 12 | 检查漏斗 | GA4 Key Events | 测试页 | 如果 start 有、complete 低，记录 UX 问题 | 不改测试流程 | start_test/complete_test | 不继续加内容掩盖体验问题 |
| 13 | 小修标题和 CTA | 有展现无点击、有点击无 start | 文章 + 测试页 | 只改标题/首段/CTA 文案建议 | 人工执行 | CTR, article→test | 不重构文章系统 |
| 14 | 复盘是否继续 | 7/14 天趋势 | 所有首批页面 | 决定继续 MBTI、转向 Holland、或暂停内容 | 不自动投流 | indexed, impressions, start/complete | 不做 PMax/Display |

## 7. 第一批 SEO 文章

只建议 8 篇以内，避免一开始做成博客平台或批量内容农场。

| 优先级 | 标题 | URL slug 建议 | 目标关键词 | 搜索意图 | H1 | 结构 | 首段直接回答 | CTA | 内链 | 图表/表格 | 风险提示 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 不知道自己适合什么职业怎么办？先分清兴趣、能力和工作环境 | `/zh/articles/what-career-fits-me` | 不知道自己适合什么职业怎么办 | 职业决策 | 不知道自己适合什么职业怎么办？ | 直接回答、三类线索、RIASEC、MBTI/Big Five 边界、行动清单、FAQ | 先不要把职业选择理解成一次测试给答案，而是用测试缩小方向。兴趣、能力、价值观和工作环境需要一起看。 | 开始霍兰德职业兴趣测试 | Holland、MBTI、Big Five、职业库 | 决策清单表 | 不承诺保证找到职业 |
| 2 | MBTI 和霍兰德哪个更适合选职业？ | `/zh/articles/mbti-vs-holland-career-choice` | MBTI和霍兰德哪个更适合选职业 | 对比决策 | MBTI 和霍兰德哪个更适合选职业？ | 结论、MBTI 看什么、Holland 看什么、组合用法、FAQ | 如果目标是选专业、找职业或转行，霍兰德/RIASEC 更直接；MBTI 更适合理解沟通偏好和工作风格。 | 开始职业兴趣测试 | Holland、MBTI、职业库 | 对比表 | 避免说 MBTI 不能用于职业，只说边界 |
| 3 | MBTI 和大五人格有什么区别？ | `/zh/articles/mbti-vs-big-five-personality-test` | MBTI和大五人格有什么区别 | 对比学习 | MBTI 和大五人格有什么区别？ | 直接结论、维度 vs 类型、适合场景、如何一起看、FAQ | MBTI 更像偏好类型语言，大五人格更像连续维度描述。二者都不是诊断，适合回答不同问题。 | 做大五人格测试 / 做 MBTI 测试 | MBTI、Big Five、personality | 对比表 | 不写“谁最科学最准” |
| 4 | 霍兰德职业兴趣测试是什么？RIASEC 六型怎么理解 | `/zh/articles/what-is-holland-riasec-test` | 霍兰德职业兴趣测试、RIASEC测试 | 测试解释 | 霍兰德职业兴趣测试是什么？ | RIASEC 解释、六型表、适合谁、不能说明什么、FAQ | 霍兰德测试用 RIASEC 六型描述职业兴趣和偏好的工作环境，适合作为选专业、转行和职业探索的起点。 | 开始 RIASEC 测试 | Holland、职业库、tests | 六型表 | 不说人格诊断 |
| 5 | 大学生职业测评应该怎么做？ | `/zh/articles/career-test-for-college-students` | 大学生职业测评 | 选专业/实习 | 大学生职业测评应该怎么做？ | 常见困惑、RIASEC、能力/价值观、实习验证、FAQ | 大学生做职业测评，重点不是立刻确定一生职业，而是缩小探索范围并设计下一步验证。 | 开始职业兴趣测试 | Holland、Big Five、职业库 | 流程表 | 避免决定论 |
| 6 | 转行前应该做什么测试？ | `/zh/articles/tests-before-career-change` | 转行前做什么测试 | 转行决策 | 转行前应该做什么测试？ | 转行问题、职业兴趣、人格风格、能力盘点、行动清单 | 转行前可以用职业兴趣测试看方向，用人格测试看工作方式，再用真实岗位信息验证可行性。 | 开始职业兴趣测试 | Holland、MBTI、职业库 | 检查清单 | 不承诺转行成功 |
| 7 | MBTI 性格测试准吗？怎么看结果才不误用 | `/zh/articles/is-mbti-personality-test-accurate` | MBTI测试准吗 | 质疑/解释 | MBTI 性格测试准吗？ | 直接回答、准的部分、不准的部分、如何复测、FAQ | MBTI 可以帮助你整理偏好和沟通方式，但不应被当作医学诊断、能力判断或职业命运预测。 | 开始 MBTI 测试 | MBTI、Big Five、personality | 误区表 | 不写“最准/官方” |
| 8 | MBTI 结果为什么会变？ | `/zh/articles/why-mbti-results-change` | MBTI结果为什么会变 | 解释/复测 | MBTI 结果为什么会变？ | 情境、题目理解、边界类型、成长变化、FAQ | MBTI 结果变化通常来自情境、题目理解、状态和边界偏好，不一定代表测试无效。 | 重新做 MBTI 测试 | MBTI、Big Five | 原因表 | 不暗示频繁刷测 |

暂缓：`INFP适合什么职业`、`INFJ适合什么职业` 这类类型长尾可以做，但应等 `/zh/personality` 与类型页 canonical/内容承接更清楚后再做。

## 8. 文章标准模板

### 标准结构

- Title：包含一个核心词，不堆砌，不写“最准/官方/保证”。
- Description：80-120 字，自然说明问题、边界和下一步。
- H1：与 title 接近，但更口语。
- 首段 100-150 字直接回答：先给结论，再说明测试是辅助理解，不是诊断或决定论。
- 适合谁读：用 3-5 个场景说明。
- 核心解释：解释概念、适用范围、不能说明什么。
- 与测试页的关系：明确“看完可做哪个测试，以及为什么”。
- 表格/清单：至少一个对比表、流程表或行动清单。
- 常见误区：特别写清非医学诊断、非职业保证、非命运预测。
- FAQ：3-5 个问题，围绕准确性、变化、免费/深度版、适合谁。
- 下一步 CTA：1 个主 CTA，最多 1 个 secondary CTA。
- 内链区：链接到 MBTI / Holland / Big Five / `/zh/tests` / `/zh/personality` / `/zh/career/jobs`。
- 作者/更新时间/reviewer 字段建议：作者、更新日期、内容审核人或方法边界 reviewer。
- schema 建议：Article + FAQPage + BreadcrumbList。
- noindex/draft 规则：CMS draft/unpublished 一律 noindex；发布前检查 canonical、title、description、FAQ、CTA。

### 发布前 checklist

- 标题没有“最准、官方、诊断、保证、预测命运”等表达。
- 首段直接回答搜索问题。
- 至少 2 个站内内链，其中 1 个指向核心测试页。
- 主 CTA 明确，并可记录 article → test click。
- canonical 是文章规范 URL。
- draft 未发布前 noindex。
- FAQ 不夸大测试能力。
- 没有真实用户结果、订单号、token、内部数据。

### 发布后 24 小时 checklist

- 文章页 200 可访问。
- title/description/canonical 正确。
- 文章链接在 `/zh/articles` 或相关入口可发现。
- CTA 点击能保留安全 UTM/SEO context。
- GA4 能看到 article page_view 和 CTA click。
- 百度统计入口页不出现 private URL。

### 发布后 7 天 checklist

- GSC 是否 indexed。
- Google impressions 是否出现。
- 百度是否有搜索入口或收录迹象。
- article → test click 是否出现。
- `start_test` 是否来自文章或测试页。
- 如有展现无点击，调整 title/description。

### 发布后 14 天 checklist

- 对比 7 天与 14 天 impressions/clicks/CTR。
- 判断 MBTI / Holland / Big Five 哪条线更有效。
- 有点击无 start 时，改 CTA 和承接页。
- 有 start 无 complete 时，不继续加内容，先检查测试体验。
- 没有收录时，检查 sitemap、internal links、GSC URL Inspection、百度资源平台。

## 9. 每日检查清单

每天 30 分钟：

| 时间 | 检查项 | 记录字段 |
| --- | --- | --- |
| 5 分钟 | GSC / 百度资源平台是否有索引、抓取异常 | indexed pages、not indexed reason、crawl issue |
| 5 分钟 | GA4 acquisition / landing pages | sessions、landing page、source/medium |
| 5 分钟 | GA4 events / Key Events | start_test、complete_test、view_result、click_deep_report、begin_checkout、purchase_success |
| 5 分钟 | 百度统计入口页/受访页 | PV、UV、入口页、搜索词、是否有 private URL |
| 5 分钟 | 文章页到测试页点击 | article → test click、CTA id、target test |
| 5 分钟 | 异常记录 | Direct/Unassigned、tongji.baidu.com、orderNo/result/share 泄露 |

## 10. 每周复盘模板

- 本周新增/准备文章：
- 已收录 URL：
- 未收录 URL 与原因：
- Google impressions / clicks / CTR / average position：
- 百度搜索 PV / 搜索词数量：
- 文章入口页 Top 5：
- 测试页入口 Top 5：
- `start_test` 来源页：
- `complete_test` 来源页：
- `view_result` 数量：
- `click_deep_report` 数量：
- 是否出现 private URL 泄露：
- 下周继续写的主题：
- 下周暂停的主题：
- 需要工程/产品/CMS/后台配置协助：

## 11. KPI 和阈值

| KPI | 目的 | 7 天观察 | 14 天观察 | 30 天观察 |
| --- | --- | --- | --- | --- |
| Google impressions | 判断是否进入搜索曝光 | 有无即可 | 看增长趋势 | 判断主题是否有效 |
| Google clicks | 判断标题和排名效果 | 可能很少 | 看是否有自然点击 | 判断是否继续该主题 |
| CTR | 判断标题/description | 有展现无点击则改 | 低 CTR 优先修标题 | 稳定后再扩内容 |
| average position | 判断竞争难度 | 记录基线 | 看是否进入前 30/50 | 决定是否继续写同主题 |
| indexed pages | 判断索引健康 | 文章是否收录 | 未收录要排查 | 决定是否停更 |
| 百度搜索 PV | 判断百度自然流量 | 有无即可 | 看入口页 | 决定是否做百度提交 |
| 百度搜索词数量 | 判断非品牌词 | 有无非品牌词 | 扩展职业/测试词 | 决定百度方向 |
| 文章页入口数 | 判断文章承接 | 记录 | 低则查收录/标题 | 判断内容节奏 |
| article → test click | 判断运营价值 | 必须开始看 | 无点击则改 CTA | 无改善则暂停该主题 |
| start_test | 业务漏斗第一层 | 文章带来即有效 | 看来源页 | 决定是否继续 SEO |
| complete_test | 测试体验 | start 有但 complete 无要停 | 低完成率先修体验 | 再扩内容 |
| view_result | 结果页可达 | complete 后应出现 | 缺失则查结果页 | 影响商业化判断 |
| click_deep_report | 报告价值 | 观察 | 无点击则查结果页 CTA | 决定报告文案优化 |
| begin_checkout | 商业漏斗 | 早期可低 | 只观察 | 小预算前必须有路径 |
| purchase_success | 付费结果 | 早期不强求 | 只观察 | 广告放量前必须确认 |

判断规则：

- 7 天内没有收录：检查 sitemap、robots、canonical、internal links、GSC URL Inspection、百度资源平台。
- 有收录但没有展现：调整关键词和内容主题，不急着加文章数量。
- 有展现但没有点击：改 title / description。
- 有点击但没有 `start_test`：改首屏 CTA、文章内链、测试页承接。
- 有 `start_test` 但没有 `complete_test`：先查测试流程或体验，不继续加内容。
- 有 `complete_test` 但没有 `view_result`：检查结果页。
- 有 `view_result` 但没有 `click_deep_report`：检查结果页价值表达和深度报告 CTA。
- SEO 30 天没有任何搜索展现：不直接大规模投流；先确认索引和页面质量，可小预算 Search Ads 验证关键词，不做 PMax。

## 12. 什么时候开始投流

当前默认：不投 PMax，不投 Display，不做信息流大投放。

| 状态 | 条件 | 动作 |
| --- | --- | --- |
| 不投 | GA4 Key Events 未确认；private URL 风险未完全复查；文章承接少于 5 篇 | 继续 SEO 基线和内容验证 |
| 小预算验证 | GA4 已有 `start_test` / `complete_test` / `view_result`；MBTI/Holland 页面能承接；没有 private URL 泄露；UTM 来源可区分；已有 5-10 篇文章或核心页承接 | 只做 Search Ads 小预算关键词验证 |
| 加大预算 | Search Ads 能稳定带来 `complete_test`，且 `view_result` 和 `click_deep_report` 有数据 | 增加精确匹配/词组匹配预算 |
| 暂停投流 | 有点击无 `start_test`，或 start 有但 complete 低，或 private URL 再次泄露 | 停止投流，先修承接和隐私风险 |

第一轮只计划验证这些关键词，不创建广告：

- MBTI性格测试
- 16型人格测试
- 霍兰德职业兴趣测试
- RIASEC测试
- 职业测评
- 不知道适合什么职业

## 13. 现在不要做什么

- 不 merge / publish #981 内容 draft。
- 不开发博客系统。
- 不批量生成 50-100 篇文章。
- 不把本地 editorial fallback 写进 frontend runtime。
- 不改 CMS、不 publish CMS。
- 不投 PMax / Display / 信息流大预算。
- 不自动提交 sitemap / API push。
- 不把百度统计当 private funnel conversion source of truth。
- 不在 private/noindex route 上配置百度元素转化。
- 不在 SEO 文案里写“最准、官方MBTI、医学诊断、保证找到职业、预测命运”。

## 14. 需要用户确认的问题

1. GA4 是否已经能看到 `start_test`、`complete_test`、`view_result`、`click_deep_report`、`begin_checkout`、`purchase_success`？需要 1/7/28 天截图或只读权限。
2. 百度统计入口页/受访页是否仍出现 `orderNo`、`/result`、`/orders`、`/share`、`tongji.baidu.com`？需要 1/7/30 天截图或只读权限。
3. GSC 中 `/zh/tests/mbti-personality-test-16-personality-types`、`/zh/tests/holland-career-interest-test-riasec`、`/zh/tests/big-five-personality-test-ocean-model` 是否 indexed？
4. 百度搜索资源平台是否已验证站点、提交 sitemap、具备链接提交/API 推送配额？
5. `/zh` 是否应作为独立中文首页进入 sitemap，还是保持 canonical 到 root？
6. `/zh/career/jobs` 是否应进入 sitemap，作为职业实体入口运营？
7. P0-12 / PR #992 merge + deploy 后，是否可以重新做 private route HTML smoke，确认 analytics bootstrap 已消失？
8. 首批文章由谁在 CMS 创建 draft、谁审稿、谁发布？
