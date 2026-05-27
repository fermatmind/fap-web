# FermatMind P0 Site Map and IA Proposal

日期：2026-05-27
文件角色：本文件是 FermatMind SEO P0 执行准则文件。其他 SEO backlog、页面扩展表和内容集群规划如与本文件冲突，以本文件为准。
范围：仅作为 SEO 运营、产品、内容和开发协作规划文件。不得把本文件中的页面正文、标题解释或模块说明直接硬编码进前端；所有可发布正文必须由 CMS/backend authority 提供。

## 0. P0 Execution Guardrails

P0 只处理基础可发现性、404、全站链接安全、sitemap 一致性和高风险页面索引决策。P0 不做内容集群建设，不上线新的正文页面，不补写 CMS 正文，不扩展商业页面，不新增未验证的作者、审稿人、评分、价格、顾问或引用文献。

P0 允许处理：

1. 已存在页面的 footer 链接，且链接目标必须是 200、indexable、canonical 正确，或是产品批准的确定性 redirect。
2. 已存在且 indexable 页面进入 sitemap。
3. `/help`、`/privacy`、`/terms` 等 root path 404。
4. help/support canonical 决策。
5. results/lookup 路由决策。
6. clinical/depression indexability 决策。
7. career/jobs indexability 决策。
8. 英文 trust-layer 404 清理：创建 CMS ticket、隐藏链接、移除 sitemap/hreflang/global link，或等待 CMS 内容；不得用前端正文补洞。
9. 未有 CMS/backend authority 的页面不得全站链接。

P0 明确不处理：

- `/science`、`/methodology`、`/reliability-validity`、`/results`、`/results/*`、`/refund-policy` 的正文上线；这些是 P1，除非只是 route reservation、holdlist、CMS ticket 或不链接决策。
- `/business/api`、`/business/team-assessment`、`/business/coaches`、`/business/research` 的正文上线；这些是 P2，且必须 `business_confirmation`。
- sitemap `lastmod`、sitemap `xhtml:link`、Core Web Vitals baseline、作者/审稿人/编辑政策建设；这些是 P2。
- 繁体中文、日语、韩语、西班牙语扩展；这些是 P3。
- Review 或 AggregateRating schema；没有真实公开评价、评分、价格和授权前不得新增。

P0 acceptance baseline：

- 不新增业务代码。
- 不新增前端硬编码正文。
- 不新增 CMS 正文内容。
- 不新增虚构作者、审稿人、评价、评分、价格、顾问、引用文献。
- 所有新增 footer/header/global nav 链接必须来自 allowlist，或在 release gate 中证明 URL 已 200、indexable、canonical 正确且有 CMS/backend authority。
- Sitemap 不使用前端正文作为 authority；除 P0 holdlist/noindex/redirect/private gate 外，保留既有 backend/CMS authority 枚举的动态详情页，例如 CMS 文章、topic、career guide、career job detail、personality detail。
- noindex 页面不得进入 sitemap。
- clinical/IQ 页面如果 indexable，必须 `review_completed=true` 才能进 sitemap。
- clinical/IQ 页面如果 noindex 或 pending decision，不得进 sitemap，也不得进 footer/global nav。

## 1. P0 URL Allowlist / Holdlist

### 1.1 P0 URL Allowlist

P0 只允许把以下“已存在且 200/indexable”的页面作为 footer/global nav 候选和 sitemap seed 候选。实际发布前仍需逐 URL 验证 status、canonical、robots 和 sitemap 状态。该表不是完整 sitemap inventory；backend/CMS 已授权且非 holdlist 的动态详情页继续由 sitemap authority adapters 枚举。

| URL | Locale | 类型 | P0 允许动作 | 备注 |
|---|---|---|---|---|
| `/zh/tests` | zh | tests hub | footer/nav/sitemap | 已存在测试中心。 |
| `/en/tests` | en | tests hub | footer/nav/sitemap | 已存在测试中心。 |
| `/zh/personality` | zh | hub | footer/nav/sitemap | 已存在人格入口。 |
| `/en/personality` | en | hub | footer/nav/sitemap | 已存在人格入口。 |
| `/zh/career` | zh | hub | footer/nav/sitemap | 已存在职业入口。 |
| `/en/career` | en | hub | footer/nav/sitemap | 已存在职业入口。 |
| `/zh/articles` | zh | articles hub | footer/nav/sitemap | 已存在文章中心。 |
| `/en/articles` | en | articles hub | footer/nav/sitemap | 已存在文章中心。 |
| `/zh/about` | zh | trust page | footer/sitemap | 已存在。 |
| `/en/about` | en | trust page | footer/sitemap | 已存在。 |
| `/zh/support` | zh | support page | footer/sitemap | P0 help canonical 推荐目标。 |
| `/en/support` | en | support page | footer/sitemap | P0 help canonical 推荐目标。 |
| `/zh/privacy` | zh | policy page | footer/sitemap | 已存在，应进入 footer 和 sitemap。 |
| `/en/privacy` | en | policy page | footer/sitemap | 已存在，应进入 footer 和 sitemap。 |
| `/zh/terms` | zh | policy page | footer/sitemap | 已存在，应进入 footer 和 sitemap。 |
| `/en/terms` | en | policy page | footer/sitemap | 已存在，应进入 footer 和 sitemap。 |
| `/zh/method-boundaries` | zh | method boundary | footer/sitemap | 已存在，应作为 P0 方法边界入口。 |
| `/en/method-boundaries` | en | method boundary | footer/sitemap | 已存在，应作为 P0 方法边界入口。 |
| MBTI test zh/en | zh,en | core test | footer/sitemap | 已存在且非高风险待审。 |
| Big Five test zh/en | zh,en | core test | footer/sitemap | 已存在且非高风险待审。 |
| Enneagram test zh/en | zh,en | core test | footer/sitemap | 已存在且非高风险待审。 |
| RIASEC test zh/en | zh,en | core test | footer/sitemap | 已存在且非高风险待审。 |
| IQ test zh/en | zh,en | core test | footer/sitemap only if current page remains approved | IQ 属高风险能力结果页；P0 不新增强 claims。若后续扩展内容，必须 review。 |
| EQ test zh/en | zh,en | core test | footer/sitemap | 已存在且非 clinical 待审。 |

Sitemap contract note:

- P0 不把 clinical/depression、results/lookup、redirect source、English trust 404、science/refund/business holdlist 放入 sitemap。
- P0 不强行移除已有 backend-authoritative dynamic detail URLs；career job detail、personality detail、article detail、topic detail 等仍需经过 backend/CMS authority、robots/indexability 和 denylist gate。
- `/zh/career/jobs`、`/en/career/jobs` index hub 是否进入 sitemap 仍是 pending decision；这不等同于禁止 backend-authoritative job detail URLs。

### 1.2 P0 Holdlist

以下 URL 或 URL pattern 在 P0 不得进入 footer/global nav/sitemap，也不得从核心测试页稳定内链，除非满足解锁条件。

| URL / Pattern | Hold 原因 | 解锁条件 | 默认优先级 |
|---|---|---|---|
| `/science` | 新 hub，未确认 CMS/backend authority | CMS 200、metadata、review、sitemap 决策 | P1 |
| `/methodology` | 新方法页 | CMS 200、review、证据边界明确 | P1 |
| `/reliability-validity` | 新证据页 | CMS 200、review、不得夸大证据 | P1 |
| `/refund-policy` | 退款规则需业务确认 | `business_confirmation`、legal/content review、CMS 200 | P1 |
| `/results` | 当前与 lookup 冲突，public hub 未上线 | route reservation P0；正文 hub P1 | P1 |
| `/results/*` | result guide 内容未建立 authority | CMS/result-guide authority 200，review 完成 | P1 |
| `/science/clinical-boundaries` | 高风险心理健康边界页 | clinical review completed，CMS 200 | P1 |
| `/science/iq-test-quality` | 高风险 IQ 边界页 | IQ/method review completed，CMS 200 | P1 |
| clinical/depression test pages | indexability 和 review 未完成 | indexability decision plus review_completed=true if indexable | P0 decision only |
| `/business/api` | API 能力、销售流程未确认 | `business_confirmation`，产品/销售/法务确认 | P2 |
| `/business/team-assessment` | 企业方案和交付未确认 | `business_confirmation`，报告/价格/SLA 确认 | P2 |
| `/business/coaches` | 教练合作模式未确认 | `business_confirmation` | P2 |
| `/business/research` | 数据和研究合作边界未确认 | `business_confirmation`，privacy/legal review | P2 |
| `/en/charter` | 当前 404 trust page | CMS 200 or keep unlinked | P0 cleanup, P1 content |
| `/en/brand` | 当前 404 trust page | CMS 200 or keep unlinked | P0 cleanup, P1 content |
| `/en/foundation` | 当前 404，且业务真实性需确认 | `business_confirmation` and CMS 200 or keep unlinked | P0 cleanup, P1/P2 content |
| `/en/careers` | 当前 404 trust/company page | CMS 200 or keep unlinked; no fake roles | P0 cleanup, P1 content |
| `/en/policies` | 当前 404 policy hub | CMS 200 or keep unlinked | P0 cleanup, P1 content |

## 2. Recommended Top Navigation

P0 阶段顶部导航不追求“栏目最多”，而是先保证没有 404、没有空 hub、没有高风险页面缺审稿就被放大。

| 导航项 | P0 状态 | 推荐入口 | 上线条件 | 说明 |
|---|---|---|---|---|
| 测评 / Tests | 立即保留 | `/zh/tests`, `/en/tests` | allowlist | 当前最强产品入口。下拉只展示 allowlist 中已存在核心测试。 |
| 人格 / Personality | 立即保留 | `/zh/personality`, `/en/personality` | allowlist | 不链接未上线的 MBTI/Big Five/九型 hub。 |
| 职业 / Career | 立即保留 | `/zh/career`, `/en/career` | allowlist；`/career/jobs` 单独决策 | 职业是 RIASEC 增长入口，但 career/jobs sitemap/indexability 需 P0 决策。 |
| 文章 / Articles | 立即保留 | `/zh/articles`, `/en/articles` | allowlist | 继续作为 CMS 文章入口。 |
| 方法与研究 / Science | P0 不进顶部 | 不链接 `/science` | P1 CMS hub 完成后再考虑 | P0 只允许链接已存在的 `/method-boundaries`。 |
| 企业 / Business | 保持现状，不展开子页 | `/zh/business`, `/en/business` 如已验证可保留现状 | 子页需 business_confirmation | P0 不链接 API、team assessment、coaches、research。 |
| 关于 / About | 放 footer 或 More | `/zh/about`, `/en/about` | allowlist | 英文 trust 子页 404 先清理，不从 About 放大。 |
| 支持 / Support | footer 或 utility link | `/zh/support`, `/en/support` | allowlist | `/help` 采用确定性 redirect。 |

P0 导航原则：

- 只从 allowlist 取链接。
- 不链接 holdlist 页面。
- 不把 `/results` 放入顶部导航；P0 只做 route reservation/lookup 决策。
- 不把 clinical/depression 页面作为营销型入口放大，直到 indexability decision 和 review 完成。

## 3. Recommended Footer Structure

Footer 是 P0 可信度和内部链接基础。P0 footer 只链接 allowlist 页面；holdlist 页面必须等待解锁。

| Section | P0 链接 | 后续可加入 | SEO 价值 | 用户价值 |
|---|---|---|---|---|
| 热门测评 | MBTI, Big Five, Enneagram, RIASEC, IQ, EQ | clinical/depression 仅在 review_completed=true 且 indexable 决策完成后加入 | 把全站内链稳定传给核心测试页 | 用户从任何页面都能回到主测试入口 |
| 内容与指南 | Tests, Articles, Personality, Career | Results, MBTI Guide, Big Five Guide, Holland Code Guide | 连接现有 hub、文章和测试 | 用户可以继续阅读或换测试 |
| 研究与方法 | Method Boundaries | Science, Methodology, Reliability and Validity, Clinical Boundaries, IQ Test Quality | P0 只建立已存在方法边界入口 | 用户知道测试有边界 |
| 支持与信任 | Support, Privacy, Terms | Refund Policy, Data and Privacy, Help articles, Contact Support | 政策页和帮助页获得全站发现路径 | 降低购买、保存结果、隐私相关焦虑 |
| 公司 | About | Charter, Brand, Foundation, Careers, Policies | P0 只放已存在 About | 合作方、媒体、用户验证主体信息 |
| 更新 | Latest Articles | Product Updates, Research Notes, Changelog | P0 可链接 Articles；更新类页面 P2 | 用户了解最新内容 |

Footer P0 验收：

- 每个 footer URL 返回 200 或本文定义的确定性 redirect。
- 不链接无 CMS 内容的英文可信页。
- 不链接 `/refund-policy`、`/science`、`/methodology`、`/reliability-validity`、`/results`、`/results/*`。
- Privacy、Terms、Support、Method Boundaries 必须全站可达。
- 高风险 clinical/IQ 新边界页只有在 review 完成后加入 footer；clinical/depression 测试页在 pending decision 状态下不得进入 footer/global nav。

## 4. Recommended URL Architecture

| URL 类型 | 推荐规则 | P0 决策 |
|---|---|---|
| 首页 | `/` 为中文默认首页，`/zh` 继续 redirect 到 `/`；`/en` 为英文首页 | 保持当前模式，但写入规则，避免误判重复。 |
| 中文内页 | `/zh/...` | 保持 locale prefix。 |
| 英文内页 | `/en/...` | 保持 locale prefix。 |
| 裸政策路径 | `/privacy`, `/terms` | 使用确定性 redirect：`/privacy` -> `/zh/privacy`，`/terms` -> `/zh/terms`。 |
| 帮助路径 | `/help`, `/zh/help`, `/en/help`, `/{locale}/support` | P0 确定性 redirect：`/help` -> `/zh/support`，`/zh/help` -> `/zh/support`，`/en/help` -> `/en/support`。 |
| 结果路径 | `/{locale}/results` 和 `/{locale}/results/lookup` | P0 只做决策和 route reservation；正文 hub 为 P1；lookup 保持 noindex 且不进 sitemap。 |
| 方法路径 | `/{locale}/method-boundaries` | 已存在 allowlist；可入 footer/sitemap。 |
| 新方法路径 | `/{locale}/science`, `/{locale}/methodology`, `/{locale}/reliability-validity` | P1；CMS authority 和 review 前不得全站链接。 |
| 高风险边界路径 | `/{locale}/science/clinical-boundaries`, `/{locale}/science/iq-test-quality` | P1；review_completed=true 且 CMS 200 后才可链接或进 sitemap。 |
| 未来语言 | `/zh-hant`, `/ja`, `/ko`, `/es` | P3，不进入 P0。 |

## 5. Help/Support Canonical Decision

P0 采用确定性 redirect，不使用 Accept-Language 作为 SEO 关键路径。

Canonical choice:

- `/zh/support`：中文帮助/支持 canonical。
- `/en/support`：英文帮助/支持 canonical。

Required redirects:

- `/help` -> `/zh/support`
- `/zh/help` -> `/zh/support`
- `/en/help` -> `/en/support`

验收：

- 上述路径均不返回 404。
- redirect 链路不超过一跳。
- sitemap 只收录 `/zh/support` 和 `/en/support`，不收录 redirect source。
- footer 链接使用 `/zh/support` 和 `/en/support`。

长期可选项：如果产品确认 Help Center 是长期命名，可在 P1/P2 迁移到 `/{locale}/help` canonical，但必须有 CMS/help article authority、完整 redirect 方案和 sitemap 更新。

## 6. Results/Lookup Routing Decision

P0 决策：

- `/{locale}/results/lookup` 保持私有工具流，noindex/noarchive/nofollow，不进 sitemap，不进 footer/global nav。
- `/{locale}/results` 预留为 public result interpretation hub，但正文 hub 建设是 P1。
- P0 不把 `/results` 放入 footer、top nav、test page stable links。

验收：

- lookup noindex 状态清晰。
- sitemap 不包含 lookup。
- 若 `/results` 仍未上线 public hub，则不从 global nav/footer 链接。
- 若需要实现 route reservation，只允许空壳/redirect/hold 状态，不写前端正文。

## 7. Multilingual URL Rules

- 只有真实存在、可索引、CMS/backend-authoritative 的 locale 页面才输出 hreflang alternate。
- 英文 404 页面不得进入 footer、sitemap、hreflang。
- 中文首页 `x-default` 可继续指向 `/`；英文作为国际默认的策略需另行产品确认。
- 非首页中文路径统一使用 `/zh/...`，英文统一使用 `/en/...`。
- P0 不扩展到繁中、日语、韩语、西语；这些是 P3。
- 高风险 clinical/IQ、退款、隐私、企业/API 页面必须本地化审阅后才能发布。

## 8. Sitemap Inclusion Rules

P0 sitemap inclusion gate：

1. URL 必须在 allowlist 中，或有明确 P0 决策允许纳入。
2. URL 返回 200。
3. noindex 页面不得进入 sitemap。
4. 页面 canonical 指向自身或批准的 canonical。
5. 页面不依赖前端硬编码正文作为发布内容权威。
6. CMS/backend authority 存在，或页面是纯产品工具/目录且产品代码拥有权威。
7. 对应语言页面真实存在时才输出 alternate；英文 404 不得作为 alternate。
8. clinical/IQ 页面如果 indexable，必须 `review_completed=true` 才能进 sitemap。
9. clinical/IQ 页面如果 noindex 或 pending decision，不得进 sitemap，也不得进 footer/global nav。
10. Footer/global nav 链接与 sitemap 状态一致，不出现 sitemap 404、footer 404 或 indexable orphan。

P0 应纳入或决策的 URL 类型：

- 已存在且 indexable 的 Privacy、Terms、Support、Method Boundaries。
- 已存在且非高风险待审的核心测试页。
- Clinical/depression 测试页：P0 只做 indexable versus noindex 决策。pending 时不得进 sitemap/footer/global nav。
- Career jobs：P0 只做 sitemap inclusion versus noindex 决策。

P0 不纳入：

- 未上线的 `/science`、`/methodology`、`/reliability-validity`。
- 未业务确认的 `/refund-policy`、`/business/api`、`/business/team-assessment`、`/business/coaches`、`/business/research`。
- 未审阅的 `/science/clinical-boundaries`、`/science/iq-test-quality`。
- `/results` 和 `/results/*`，除非 P1 public hub 完成。
- `/results/lookup`，永久不纳入 sitemap。
- 英文 404 trust pages。

## 9. Pages That Should Not Be Linked Until Content Exists

此表与 holdlist 一致，是 release gate 的执行版本。

| 页面 | Hold 原因 | 解锁条件 | P |
|---|---|---|---|
| `/en/charter` | 当前 404 | CMS content_page 200，metadata 完成，review 通过 | P0 cleanup / P1 content |
| `/en/brand` | 当前 404 | CMS content_page 200，媒体/品牌信息业务确认 | P0 cleanup / P1 content |
| `/en/foundation` | 当前 404，且组织/项目真实性需确认 | business_confirmation，CMS content_page 200 | P0 cleanup / P1/P2 content |
| `/en/careers` | 当前 404 | CMS content_page 200，不能虚构岗位 | P0 cleanup / P1 content |
| `/en/policies` | 当前 404 | policy hub 链接目标均存在或缺失项隐藏 | P0 cleanup / P1 content |
| `/{locale}/refund-policy` | 当前无独立 policy authority | business_confirmation，legal/content review，CMS 200 | P1 |
| `/{locale}/science` | 新 hub | CMS 200，至少链接到存在的 method/boundary pages | P1 |
| `/{locale}/methodology` | 新方法页 | CMS 200，科学/产品审阅 | P1 |
| `/{locale}/reliability-validity` | 新证据页 | CMS 200，证据等级明确，不夸大 | P1 |
| `/{locale}/science/clinical-boundaries` | 高风险心理健康边界 | clinical review completed，CMS 200 | P1 |
| `/{locale}/science/iq-test-quality` | 高风险 IQ 边界 | IQ/method review completed，CMS 200 | P1 |
| `/{locale}/results` | 当前被 lookup 占用 | P0 route decision；P1 public hub authority | P1 |
| `/{locale}/results/*` | 新结果解读页 | CMS/result-guide authority，review where required | P1 |
| `/{locale}/business/api` | API 商业能力未验证 | business_confirmation，申请路径和限制确认 | P2 |
| `/{locale}/business/team-assessment` | 企业销售方案未确认 | business_confirmation，团队报告/价格/SLA 确认 | P2 |
| `/{locale}/business/coaches` | 教练合作模式未确认 | business_confirmation | P2 |
| `/{locale}/business/research` | 研究合作与数据边界未确认 | business_confirmation，privacy/legal review | P2 |

## 10. Seven-Day P0 Execution Checklist

7 天内最多执行 10 个 P0 任务，避免把内容扩展混入基础修复。

| Day | 任务 | Owner | 产出物 | 验收 |
|---|---|---|---|---|
| Day 1 | 锁定 allowlist/holdlist，并冻结 P0 链接范围 | SEO, Product | P0 URL registry | 任何 footer/nav/sitemap 候选都能映射到 allowlist 或 holdlist。 |
| Day 1 | 确认 help/support canonical 和确定性 redirect | Product, SEO, Dev | Redirect decision | `/help` -> `/zh/support`，`/zh/help` -> `/zh/support`，`/en/help` -> `/en/support`。 |
| Day 2 | 确认 root policy redirects | Product, SEO, Dev | Redirect decision | `/privacy` -> `/zh/privacy`，`/terms` -> `/zh/terms`。 |
| Day 2 | 清理英文 trust-layer 404 的全站链接风险 | SEO, Content | Hold decision or CMS ticket | `/en/charter` 等不进入 footer/sitemap/hreflang，除非 CMS 200。 |
| Day 3 | 修正 footer P0 链接范围 | Dev, SEO | Dev ticket | Footer 只链接 allowlist；无 holdlist 链接。 |
| Day 3 | 修正 sitemap P0 inclusion 范围 | Dev, SEO | Dev ticket | 已存在 indexable trust pages 和核心测试进入 sitemap；noindex 不进入。 |
| Day 4 | 决策 clinical/depression indexability | Product, SEO, Content | Decision record | pending/noindex 时不得进 sitemap/footer；indexable 时必须 review_completed=true。 |
| Day 4 | 决策 career/jobs indexability | Product, SEO, Dev | Decision record | sitemap 与 robots/indexability 一致。 |
| Day 5 | 决策 results/lookup 路由 | Product, SEO, Dev | Route decision | lookup 保持 noindex；public `/results` 正文建设留 P1。 |
| Day 6-7 | 跑 P0 SEO smoke matrix | SEO, Dev | QA report | status、canonical、robots、sitemap、footer links、404、hreflang holdbacks 全部记录。 |

## 11. Still Needs Manual Confirmation

- clinical/depression 页面是否允许 indexable，以及 review owner 是谁。
- IQ 页面是否需要额外 review gate，以及 `review_completed=true` 的判定人。
- `/career/jobs` 是否具备公开收录条件。
- English trust-layer pages 是在 P1 补 CMS 内容，还是长期隐藏。
- Refund policy 的业务规则、退款 SLA、异常处理和 legal owner。
- Business/API/team assessment/coaches/research 是否真实开放，价格、SLA 和销售路径是否确认。
- 是否将长期 Help Center canonical 从 `/support` 迁移到 `/help`。
- `/results` public hub 的 CMS/backend authority 和模板归属。
