# FOOTER-V2-ARTICLES-RESEARCH-COLUMNS-SPECIALIZED-SCAN

Scanned at: 2026-06-02

Mode: read-only specialized footer IA scan. No application code, CMS, route, sitemap, robots, llms, schema, metadata, header, Company footer group, Terms & Policies footer group, social icon, or legal bar changes were made.

## 1. Current footer inventory

Production pages inspected:

- `https://fermatmind.com/`
- `https://fermatmind.com/en`
- `https://fermatmind.com/zh/tests`
- `https://fermatmind.com/en/tests`

Repository evidence:

- `components/layout/SiteFooter.tsx`
- `components/layout/SiteHeader.tsx`
- `lib/navigation/headerDropdownMenus.ts`
- `lib/i18n/locales/zh.ts`
- `lib/i18n/locales/en.ts`
- `lib/cms/articles.ts`
- `lib/cms/topics.ts`
- `lib/cms/career-guides.ts`
- `app/(localized)/[locale]/articles/page.tsx`
- `app/(localized)/[locale]/blog/page.tsx`
- `app/(localized)/[locale]/topics/page.tsx`
- `app/(localized)/[locale]/career/guides/page.tsx`
- `app/(localized)/[locale]/datasets/occupations/method/page.tsx`
- `app/(localized)/[locale]/method-boundaries/page.tsx`

Current production footer groups and links:

- Tests / 热门测评:
  - `/tests`
  - `/tests/mbti-personality-test-16-personality-types`
  - `/tests/big-five-personality-test-ocean-model`
  - `/tests/enneagram-personality-test-nine-types`
  - `/tests/holland-career-interest-test-riasec`
  - `/tests/iq-test-intelligence-quotient-assessment`
  - `/tests/eq-test-emotional-intelligence-assessment`
- Articles / 内容与指南:
  - `/articles`
  - `/personality`
  - `/career`
- Company / 公司:
  - `/about`
  - `/brand`
  - `/charter`
  - `/foundation`
  - `/careers`
- Terms & Policies / 条款与政策:
  - `/support`
  - `/privacy`
  - `/terms`
  - `/policies`
  - `/method-boundaries`

Frozen groups for this scan:

- Company / 公司 is frozen. Do not move, rename, add, or delete links in that group.
- Terms & Policies / 条款与政策 is frozen. Do not move, rename, add, or delete links in that group.

Context observations:

- Header already exposes primary product navigation: Tests, Articles, Personality, Career, Help, Business.
- Header dropdown already includes `/articles`, `/personality`, `/career/jobs`, `/career/industries`, `/career/recommendations`, `/career/guides`, and `/career/tests`.
- Footer should not become a second header. Its useful role is content operations, SEO/GEO cluster discovery, and trust boundary reinforcement.
- Current Articles footer group duplicates high-level header destinations and is too thin for public content operations.

## 2. Articles candidate route table

| Candidate | zh route | en route | Status | Indexable? | CMS/backend authority? | Header duplicate? | Recommendation | Notes |
|---|---|---|---|---|---|---|---|---|
| 全部文章 / All articles | `/zh/articles` | `/en/articles` | 200 / 200 | Yes / Yes | Yes. `getCmsArticlesWithLastKnownGood()` reads backend `/v0.5/articles`. | Yes, but already current footer link and core content index. | add_now | Keep. This is the safest content-ops root and sitemap includes both localized URLs. |
| 博客 / Blog | `/zh/blog` | `/en/blog` | 308 -> `/zh/articles` / 308 -> `/en/articles` | No direct indexable page | No separate blog authority; route is a permanent redirect. | Not useful. | do_not_add | Do not link redirect-only footer destinations. Use Articles until a real blog index exists. |
| 人格文章 / Personality articles | No dedicated route found. Tested proxy candidate `/zh/personality`. | No dedicated route found. Tested proxy candidate `/en/personality`. | `/personality` is 200 / 200 | `/personality` indexable, but not article-category-specific. | Personality hub is product/content code surface, not article category authority. Article CMS has personality categories, but no public category route. | Yes. `/personality` is header nav. | hold_until_route_exists | Do not label `/personality` as Personality articles. Add only after a CMS-backed article category route exists, for example `/articles/category/personality-psychology`. |
| 职业文章 / Career articles | No dedicated route found. Tested proxy candidate `/zh/career`. | No dedicated route found. Tested proxy candidate `/en/career`. | `/career` is 200 / 200 | `/career` indexable, but not article-category-specific. | Career hub is public career product surface; career guide CMS exists separately. Article CMS has career categories but no public category route. | Yes. `/career` is header nav. | hold_until_route_exists | Do not relabel `/career` as Career articles. Prefer `/career/guides` if the desired footer meaning is career content library. |
| 职业发展指南 / Career guides | `/zh/career/guides` | `/en/career/guides` | 200 / 200 | Yes / Yes | Yes. `listCareerGuidesFromCms()` reads backend career guide authority. | Partial: header career dropdown includes Career guides. | add_now | Acceptable footer-specific SEO reason: this is a CMS-backed guide library, not the generic Career hub. Use label as Guides, not Career center. Sitemap includes both localized URLs. |
| 测评指南 / Assessment guides | No dedicated route found. | No dedicated route found. | Not applicable | No | No dedicated CMS/public route confirmed. | Would likely duplicate Tests or Articles. | hold_until_route_exists | Do not map this to `/tests` or `/articles` without a real guide/category route. |
| 主题 / Topics | `/zh/topics` | `/en/topics` | 200 / 200 | Yes / Yes | Yes. `listTopics()` reads backend topic CMS authority. | Not a top-level header item; only topic detail appears in personality dropdown. | add_now | Strong SEO/GEO cluster root. Sitemap includes both localized URLs. |
| 成长与关系 / Growth & relationships | Tested `/zh/relationships/mbti`. | Tested `/en/relationships/mbti`. | 200 / 200 | No. Both noindex/nofollow/noarchive. | App route exists, but it is not public indexable content. | Not a safe footer target. | do_not_add | Do not link noindex relationship routes. Add only after CMS-backed article/category landing exists and is indexable. |
| 研究型文章 / Research articles | `/zh/research` | `/en/research` | 404 / 404 | No | Detail route exists at `/research/[slug]`, but no public research index route exists. | No | hold_until_route_exists | Do not add until a bilingual indexable research landing exists. |

Additional article CMS observation:

- Public `/api/v0.5/articles` currently returns article categories such as Personality Psychology, Career Development, Relationships and Love, and Chinese equivalents.
- No inspected public route consumes those categories as indexable category landing pages.
- Footer should not invent article category URLs or use query strings such as `/articles?category=...`; tested query variants canonicalize to `/articles`.

## 3. Research candidate route table

| Candidate | zh route | en route | Status | Indexable? | CMS/backend authority? | Review required? | Policy duplicate? | Recommendation | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 研究报告 / Research reports | `/zh/research` | `/en/research` | 404 / 404 | No | `lib/research/reports.ts` supports detail fetches, but no index route exists. | Yes | No | hold_until_route_exists | Requires bilingual research index and CMS/backend authority before footer exposure. |
| 测评方法 / Assessment methods | No dedicated route found. Candidate `/method-boundaries`. | No dedicated route found. Candidate `/method-boundaries`. | `/method-boundaries` is 200 / 200 | Yes / Yes | Yes, content page route uses backend `content_pages`. | Product/legal review already implied by policy surface. | Yes | duplicate_with_policy_requires_user_decision | Method Boundaries already lives in frozen Terms & Policies. Do not move or duplicate in this scan. |
| 维度机制 / Dimension mechanics | No route found. | No route found. | Not applicable | No | No public CMS/backend route confirmed. | Yes | No | hold_until_route_exists | Needs dedicated model/dimension content and psychometric review before footer exposure. |
| 常模与评分 / Norms & scoring | No route found. | No route found. | Not applicable | No | No public CMS/backend route confirmed. | Yes | No | hold_until_review | High claim-risk area. Do not add until reviewed content exists. |
| 方法边界 / Method boundaries | `/zh/method-boundaries` | `/en/method-boundaries` | 200 / 200 | Yes / Yes | Yes, backend content page authority. | Product/legal boundary. | Yes | duplicate_with_policy_requires_user_decision | Keep only under frozen Terms & Policies unless Product/SEO explicitly accepts duplicate footer placement. |
| 模型边界 / Model boundaries | No route found. | No route found. | Not applicable | No | No public CMS/backend route confirmed. | Yes | No | hold_until_route_exists | Needs actual model-boundary content and review. |
| Big Five 方法 / Big Five method | `/zh/tests/big-five-personality-test-ocean-model/technical-note` | `/en/tests/big-five-personality-test-ocean-model/technical-note` | 404 / 404 | No | No public technical note response confirmed. | Yes | No | do_not_add | Do not link 404 technical-note routes. |
| RIASEC 方法 / RIASEC method | `/zh/tests/holland-career-interest-test-riasec/technical-note` | `/en/tests/holland-career-interest-test-riasec/technical-note` | 200 / 200 | Appears indexable by response, but not in sitemap. | Backend technical note authority likely exists for RIASEC. | Yes | No | hold_until_sitemap_or_review_ready | Do not add one test-specific technical note as the Research column while MBTI/Big Five equivalents are missing. Also not currently in sitemap. |
| MBTI 使用边界 / MBTI boundaries | `/zh/tests/mbti-personality-test-16-personality-types/technical-note` | `/en/tests/mbti-personality-test-16-personality-types/technical-note` | 404 / 404 | No | No public technical note response confirmed. | Yes | No | do_not_add | Do not link 404 technical-note routes. |
| 学术边界声明 / Academic boundary statement | No route found. | No route found. | Not applicable | No | No public CMS/backend route confirmed. | Yes | No | hold_until_review | High claim-risk. Requires legal/product/psychometric review and bilingual content authority. |
| 职业库方法 / Occupations dataset method | `/zh/datasets/occupations/method` | `/en/datasets/occupations/method` | 200 / 200 | Yes / Yes | Yes. Page fetches backend career dataset method API. | Product/data-method review advisable. | No | hold_until_discoverability_aligned | Strong future Research candidate, but currently absent from sitemap. Do not expose through footer until sitemap/llms/discoverability authority is intentionally aligned. |
| 企业与研究使用 / Business and research use | `/zh/help/for-business-and-research` | `/en/help/for-business-and-research` | 200 / 200 | Yes / Yes | Yes, content/help page authority. | Legal/product review advisable for business/research language. | No | hold_until_discoverability_aligned | Useful help/trust page, but not a methodology/research index. Also absent from sitemap. Consider later under Help, not Research, unless IA is explicitly approved. |

Research column conclusion:

- A Research / 研究方法 footer column is not implementation-ready today.
- The only stable broad method surface is `/method-boundaries`, but it already belongs to the frozen Terms & Policies group.
- RIASEC technical note and occupations dataset method are promising, but they do not yet form a balanced bilingual Research column and have discoverability alignment gaps.
- Do not create a Research column by mixing one test-specific technical note, one career dataset method page, and a policy boundary page. That would look mature visually but would misrepresent the authority structure.

## 4. Recommended current-safe footer columns

Only links that can be safely added now:

Articles / 文章指南:

- 全部文章 / All articles -> `/articles`
- 主题 / Topics -> `/topics`
- 职业发展指南 / Career guides -> `/career/guides`

Research / 研究方法:

- No new link recommended now.

Recommended IA interpretation:

- Implement an expanded Articles / 文章指南 column now if desired.
- Do not implement a Research / 研究方法 column until a real bilingual research/methodology index exists or Product/SEO explicitly approves duplicate placement of Method Boundaries.

## 5. Future footer expansion backlog

Wait for route creation:

- Research reports / 研究报告: create bilingual `/research` index before footer exposure.
- Personality articles / 人格文章: create CMS-backed article category landing.
- Career articles / 职业文章: create CMS-backed article category landing or make `/career/guides` the approved label.
- Assessment guides / 测评指南: create CMS-backed guide/category landing.
- Growth & relationships / 成长与关系: create indexable article/topic landing; do not use noindex relationship app route.
- Dimension mechanics / 维度机制: create reviewed method/model content route.
- Norms & scoring / 常模与评分: create reviewed content route.
- Model boundaries / 模型边界: create reviewed content route.
- Academic boundary statement / 学术边界声明: create reviewed content route.

Wait for CMS/backend authority:

- Article category landing pages for personality, career, relationships, assessment guides, and research voice.
- Research report index backed by backend/CMS enumeration.
- Methodology hub backed by backend content pages or CMS research/report resources.

Wait for review:

- Norms, scoring, model boundaries, academic boundary, and technical note pages.
- Any page implying validation, accuracy, science, research, expert review, or methodology claims.

Wait for bilingual parity:

- Big Five method / technical note.
- MBTI method / technical note.
- Any future `/research` index and research detail cluster.

Wait for indexability/discoverability alignment:

- `/datasets/occupations/method`
- `/tests/holland-career-interest-test-riasec/technical-note`
- `/help/for-business-and-research`

## 6. Explicit no-go list

- No Company column changes.
- No Terms & Policies column changes.
- No Tests group changes in this scan.
- No social icon changes.
- No legal bar changes.
- No header navigation changes.
- No clinical/depression/anxiety links.
- No private result/order/payment/report/share links.
- No `/results/lookup` link.
- No links to 404, noindex, redirect-only, private, or thin pages.
- No unverified user count, rating, expert review, media claim, Product schema, AggregateRating, Review schema, or scientific validation claim.
- No frontend editorial fallback copy.
- No route, sitemap, robots, llms, schema, or metadata change in this scan.

## 7. Implementation plan for a later PR

Future PR title:

- `FOOTER-V2-ARTICLES-COLUMN-SEO-CONTENT-OPS-01`

Scope:

- Implement Articles / 文章指南 column refinement only.
- Leave Company / 公司 and Terms & Policies / 条款与政策 untouched.
- Leave header, social icons, legal bar, sitemap, llms, schema, metadata, and CMS untouched.
- Do not implement a Research / 研究方法 column until the Research authority backlog is resolved or explicitly approved.

Allowed files:

- `components/layout/SiteFooter.tsx`
- `lib/i18n/locales/zh.ts`
- `lib/i18n/locales/en.ts`
- Optional minimal CSS only if layout requires it: `app/globals.css`

Disallowed files:

- CMS/content source files
- sitemap/llms/robots/schema/metadata files
- header navigation files
- Company and Terms & Policies footer link definitions if split locally
- backend code or data
- tests or routes unrelated to footer link rendering

Implementation shape:

- Rename current Articles group from 内容与指南 / Reading & guides only if copy approval is included.
- Replace the current generic `/personality` and `/career` links with content-ops links:
  - `/articles`
  - `/topics`
  - `/career/guides`
- Keep labels clear:
  - zh: `全部文章`, `主题`, `职业发展指南`
  - en: `All articles`, `Topics`, `Career guides`
- Do not add `/blog`, `/research`, article category query URLs, noindex relationship routes, technical-note routes, or dataset method route in this PR.

Validation:

- `git diff --check -- components/layout/SiteFooter.tsx lib/i18n/locales/zh.ts lib/i18n/locales/en.ts app/globals.css`
- Public/local route smoke after implementation:
  - `/zh/articles`
  - `/en/articles`
  - `/zh/topics`
  - `/en/topics`
  - `/zh/career/guides`
  - `/en/career/guides`
- Verify Company footer links unchanged.
- Verify Terms & Policies footer links unchanged.
- Verify no private/result/order/payment/report/share links are introduced.
- Verify no clinical/depression/anxiety test links are introduced.

Acceptance criteria:

- Footer Articles group no longer duplicates generic Personality and Career header destinations.
- New links are 200, indexable, canonical, bilingual, and backed by CMS/backend authority.
- Company and Terms & Policies groups remain byte-for-byte semantically unchanged.
- No new claim, schema, sitemap, llms, route, or CMS behavior is introduced.

Rollback plan:

- Revert only the footer/i18n/CSS changes from the implementation PR.
- No CMS, backend, sitemap, llms, or route rollback should be needed because the PR must not touch those surfaces.

Final decision:

`footer_articles_research_scan_completed_ready_for_user_review`
