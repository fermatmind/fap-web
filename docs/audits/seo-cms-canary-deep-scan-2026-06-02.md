# FermatMind SEO CMS Canary Deep Scan — 2026-06-02

## 1. 一句话结论

`NO-GO: fix platform gap before preflight`.

公开测试页、文章公开渲染基础、sitemap/llms 排除、私有路由 analytics 抑制大体可承接；但中英文 canary 在进入 `SEO-CMS-CANARY-PREFLIGHT` 前仍有平台级阻塞：未验证 CMS UI 权限和 preview、draft 默认 noindex 不成立、不同 slug 的 zh/en hreflang 不能由当前后端生成、文章 detail 默认 CTA/answer surface 仍硬编码 MBTI、CMS package 中的 CTA/FAQ slots 未投射到公开 article surface、没有独立 `article_to_test_click` 事件。

## 2. 扫描范围与限制

本轮执行的是 `SEO-CMS-CANARY-DEEP-SCAN`，未执行 `SEO-CMS-CANARY-PREFLIGHT`。未创建 CMS draft，未 publish，未改代码、测试、runtime、sitemap、analytics、Search Channel、GA4、百度、GSC 或生产配置。未读取 cookie/env/token，未访问任何真实 result/order/share/order id，未安装依赖。

实际动作：

- 只读扫描 `fap-web`、`fap-api`、worktrees、docs、tests、CMS/admin/Filament 代码。
- 只读访问生产公开页面、公开 sitemap、`llms.txt`、`llms-full.txt`、公开 API。
- 仅新增本报告文件。

CMS UI not verified; code scan only.

## 3. 仓库与系统边界

| 项 | 结论 |
|---|---|
| 当前工作目录 | `/Users/rainie/Desktop/GitHub/fap-web` |
| 前端 source of truth | `fap-web`，Next.js public runtime，承载 article/test routes、metadata、sitemap、llms、tracking |
| 后端/API/CMS/admin | `fap-api/backend`，Laravel API、CMS Article 模型、Filament Ops admin、SEO/sitemap source |
| SEO/sitemap/metadata | 前端生成 metadata/sitemap/llms；后端提供 article public API、SEO payload、backend sitemap source |
| 可见 sibling repo | `/Users/rainie/Desktop/GitHub/fap-api` |
| 历史 worktrees | 多个 `fap-web-*`、`fap-api-*` worktree 存在，应只当历史任务上下文，不作为 source of truth |
| 当前 dirty 状态 | `fap-web` 已有 unrelated dirty/untracked 文件；本报告限定在 `docs/audits/seo-cms-canary-deep-scan-2026-06-02.md` |
| 后端 dirty 状态 | `fap-api` 在 `main...origin/main`，扫描时 clean |

## 4. fap-web 前端承接能力

文章路由存在：`app/(localized)/[locale]/articles/page.tsx` 与 `app/(localized)/[locale]/articles/[slug]/page.tsx` 覆盖 `/zh/articles/[slug]`、`/en/articles/[slug]`。

文章内容来源：公开 article detail 通过 `lib/cms/articles.ts` 读取后端 `/v0.5/articles/{slug}` 和 `/v0.5/articles/{slug}/seo`，并通过 `getCmsArticleWithLastKnownGood` / `getCmsArticleSeoWithLastKnownGood` 兜住最后已知好缓存。未发现 article detail 以本地 MD/MDX 或前端 fixture 作为 runtime 内容权威。

前端能力矩阵：

| 能力 | 状态 | 证据 |
|---|---|---|
| zh/en article route | GO | `app/(localized)/[locale]/articles/[slug]/page.tsx` |
| zh/en 不同 slug | Partial | 路由支持；后端 API 按 locale+slug 查；但 hreflang 由后端 alternates 决定 |
| `translation_group_id` | Partial | 后端 payload 可含该字段；前端 `CmsArticle` 当前未把它作为核心渲染/metadata authority 使用 |
| Article schema | GO | article page 渲染 Article JSON-LD，优先使用后端 `seo.jsonld` |
| BreadcrumbList schema | GO | article page 渲染 Breadcrumb JSON-LD |
| FAQPage schema | Partial | 只从 `answerSurface.faqBlocks` 渲染；依赖可见 FAQ blocks，符合“可见内容”原则，但 CMS canary FAQ 是否进入该 surface 未证明 |
| canonical | Partial | 前端可消费后端 SEO canonical；但 route-consistent 规则仍以前端 localized path 兜底 |
| hreflang | NO-GO for canary | 前端可输出 alternates，但后端当前按 same slug 找 siblings；canary zh/en slug 不同 |
| draft/noindex control | Partial | public API 会隐藏 draft；preview/noindex 未验证 |
| published article sitemap | GO with caveat | sitemap/llms 从 CMS/public API 和 backend source 枚举；后端 sitemap generator 不显式要求 `published_revision_id` |
| unpublished/draft sitemap exclusion | Mostly GO | draft `status=draft/is_public=false` 不进后端 sitemap/public API；但 draft preview 不存在/未验证 |
| CTA rendering | Partial | `SeoTrackedCtaLink` 存在；body/answer links 可加 attribution；正式 article detail surface 仍受后端默认 CTA 控制 |
| article primary CTA to RIASEC | NO-GO | 后端 article detail `landing_surface_v1.start_test_target` 仍默认 MBTI |
| analytics on public article route | Partial | public route 未在 suppress set；是否加载受生产 env/host/consent/config 控制 |
| private/noindex analytics suppression | GO | `AnalyticsScripts` 和 `browserAnalyticsSuppression` 抑制 result/orders/share/pay/payment/history 与敏感 query |

重要前端阻塞：

- `article_to_test_click` 不存在。当前 article CTA 组件发送 `start_attempt` click event，并把 article source 通过 query/context 传给测试页；这不等价于独立的 article-to-test click event。
- `buildSeoCtaTrackingPayload` 当前 click payload 不包含 `source_slug`、`cta_id`、`target_test_slug`，虽然 URL context 和 downstream start metadata 可携带这些字段。
- article FAQ schema 只认 `answer_surface_v1.faqBlocks`。如果 canary FAQ 只在正文或 import metadata 中，当前公开 article page 不会把它作为 FAQPage schema 来源。

## 5. fap-api / CMS 内容模型能力

后端 Article/CMS 基础存在：

- `Article`、`ArticleSeoMeta`、`ArticleTranslationRevision`、`ArticleTestEdge`、category/tag/media metadata、`translation_group_id` 字段存在。
- Public API：`GET /api/v0.5/articles`、`GET /api/v0.5/articles/{slug}`、`GET /api/v0.5/articles/{slug}/seo`。
- CMS write/release API：`POST /api/v0.5/cms/articles`、`PUT /api/v0.5/cms/articles/{id}`、`POST /api/v0.5/cms/articles/{id}/publish`、`unpublish`。
- Filament ArticleResource 存在，包含 slug、locale、SEO title/description/canonical、category/tags、author/reviewer、`related_test_slug`、`is_indexable`、release action 等。

后端能力矩阵：

| 必答项 | 结论 |
|---|---|
| 支持创建 Article draft | Yes |
| draft 默认状态 | `status=draft`、`is_public=false`、`published_revision_id=null` |
| draft 默认 `is_public=false` | Yes |
| draft 默认 `is_indexable=false` | No. ArticleService/UI create 默认 true；editorial package importer 取 package `indexability` |
| 公开是否要求 published revision | Public article list/detail/SEO API 要求 `publiclyReadable()` 和 published revision |
| draft 是否进 public list/detail API | No |
| draft 是否进 sitemap source API | No under normal draft state |
| draft 是否进 llms | No through public article API path |
| preview URL | Not found / not verified |
| preview token | Not found / not verified |
| preview noindex | Not verified |
| preview 显示未发布内容 | Not verified |
| publish approval | Filament release requires editorial approval; controlled CLI requires approved revision/import gate; raw service itself is looser but route is release-protected |
| reviewer/release gate | Yes in code |
| rollback/unpublish | Unpublish exists; full previous-revision rollback not proven |
| zh-CN/en two records | Yes |
| same `translation_group_id` | DB/model supports; UI direct editing not exposed; canary exact group not verified |
| zh/en different slug | Yes at DB/API level |
| zh/en different SEO title/description | Yes |
| zh/en different CTA label | Not proven in public article surface |
| `related_test_slug` per locale | Yes |
| primary/secondary/tertiary CTA slots | Stored in editorial package metadata/import gate, but not projected into current public article landing surface |
| FAQ blocks | Controlled publish checks import metadata FAQ; public article answer surface does not appear to consume per-article package FAQ |
| internal links | Body content supports links; hydration adds safe attribution for public test detail links |
| category/tags | Yes |
| author/reviewer/updatedAt | Yes |
| canonical | Yes |
| robots/noindex | Yes at model/SEO meta level, but draft default is not fail-closed unless importer/package sets false |
| sitemap API | Yes: `/api/v0.5/seo/sitemap-source` |
| article detail API | Yes |
| UI direct field editing | Partial; translation group, CTA slots, FAQ slots, robots field not fully exposed in observed ArticleResource form |

Critical backend blockers:

1. `ArticleSeoService::buildAlternates()` finds alternates by same slug, not `translation_group_id`. The canary requires zh slug `mbti-vs-holland-career-choice` and en slug `mbti-vs-holland-code-career-choice`, so backend will not emit reciprocal hreflang for this pair.
2. `ArticleController::buildDetailLandingSurface()` and `buildDetailAnswerSurface()` hardcode MBTI `start_test_target` / next step. This can silently route a RIASEC canary article to MBTI unless the public surface is changed or bypassed.
3. Editorial package import persists `cta_slots` and `answer_surface_v1` metadata, and controlled publish checks them, but current public article detail payload does not project those slots into `landing_surface_v1` / `answer_surface_v1`.
4. Draft hidden-from-public is strong, but draft noindex/preview is not yet safe-by-default and not verifiable from public code alone.

## 6. CMS 后台 UI 能力

CMS UI not verified; code scan only.

Code scan indicates:

- Article management resource exists in Filament Ops.
- Create/edit forms include title, slug, locale, excerpt/body markdown, author/reviewer fields, category/tags, media metadata, `related_test_slug`, `is_indexable`, SEO title/description/canonical/OG fields.
- `status` and `is_public` are disabled in create/edit forms and handled by release flow.
- Release action is gated by `ContentAccess::canRelease()` and editorial approval state.
- `translation_group_id` appears as table/placeholder field, not as a direct editable field.
- `robots`, CTA slots, and FAQ slots are not observed as first-class ArticleResource form fields.
- A public URL preview placeholder exists, but no unpublished preview URL/token route was found.

Unknown / needs human UI confirmation:

- Current operator permission and visible Article entry.
- Whether a safe preview button exists in the actual logged-in admin.
- Whether exact `translation_group_id` can be set without importer/direct backend support.
- Whether CTA/FAQ slot configuration is available through a different CMS UI not found in ArticleResource.
- Whether rollback is only unpublish or can restore a previous published revision.

## 7. 中英文 Canary 承接能力

Canary fields checked without copying or rewriting the content body.

| Item | 中文 | 英文 | Result |
|---|---|---|---|
| Target article URL | `/zh/articles/mbti-vs-holland-career-choice` | `/en/articles/mbti-vs-holland-code-career-choice` | Public frontend returns 404/noindex for both |
| Public API collision | same slugs via `/api/v0.5/articles/{slug}` | same | Public API returns 404 for both |
| Published slug conflict | Not found publicly | Not found publicly | No published conflict observed |
| Draft/admin slug conflict | Unknown | Unknown | Requires CMS/admin or DB read by authorized operator |
| Different language slugs | Supported by DB/API | Supported | GO at storage level |
| Same `translation_group_id` | `article_mbti_vs_holland_career_choice_v1` | same | Not UI-verified; backend exact setting path unclear |
| zh/en canonical | Supported after publish | Supported after publish | Needs actual SEO payload |
| reciprocal hreflang | Required | Required | NO-GO because backend alternates use same slug |
| independent FAQ | Required | Required | NO-GO for schema/surface unless per-article FAQ projection is fixed |
| independent CTA label/slot | Required | Required | NO-GO for public article surface |
| primary CTA RIASEC | `/tests/holland-career-interest-test-riasec` | same localized | NO-GO in current article landing surface due MBTI default |
| secondary/tertiary CTA | MBTI / Big Five | MBTI / Big Five | No first-class public article slot support |
| draft noindex | Required | Required | Not default / not preview-verifiable |
| draft public API exclusion | Required | Required | GO under normal draft state |
| draft sitemap exclusion | Required | Required | GO under normal draft state |
| preview CTA/schema check | Required | Required | NO-GO; preview not found |

Recommendation on staged publishing:

- Do not publish either locale now.
- Do not enter `SEO-CMS-CANARY-PREFLIGHT` yet.
- Do not create the canary CMS draft yet unless the user explicitly accepts a draft-only, no-preview/no-publish risk audit. The better sequence is to fix platform gaps first, then create zh/en drafts together.
- Publishing Chinese first and English 24-48h later is not recommended until translation group + reciprocal hreflang can be generated for different slugs. If the team still wants staggered publish later, first ensure unpublished sibling is excluded from alternates and the published page does not fake missing locale alternates.

## 8. CTA Tracking 深度扫描

| Question | Status |
|---|---|
| Existing `article_to_test_click` event | No |
| Carries locale | Yes in current SEO CTA tracking payload/context |
| Carries article slug | In URL/downstream context yes; click event payload no |
| Carries `translation_group_id` | No |
| Carries `cta_id` | In URL/downstream context yes; click event payload no |
| Carries target test | In URL/downstream context yes; click event has `slug/test_slug` but not `target_test_slug` |
| primary/secondary/tertiary CTA distinction | Only if caller supplies distinct `ctaId/targetAction`; no CMS slot projection |
| zh/en tracking | Yes for locale/path context |
| article source to test page | Yes via `appendSeoCtaContextParamsToHref` and take-page attribution |
| `start_attempt` inherits article source | Partial/covered for SEO attribution context |
| `complete_test` / `view_result` inherit article source | Not fully proven for this canary; whitelists exist, but needs targeted smoke |
| duplicate event risk | Possible ambiguity because article CTA click is named `start_attempt`, same taxonomy as attempt start |
| payment/order/checkout trigger | No evidence; CTA/hydration excludes private/pay/order/share child routes |
| private URL risk | No public evidence; private route suppression exists |

CTA tracking result: `NO-GO`.

Minimal platform补齐项:

- Add a first-class `article_to_test_click` event or explicitly document/contract that article CTA click remains `start_attempt` with unambiguous `target_action`.
- Include `source_slug`, `cta_id`, `target_test_slug`, and ideally `translation_group_id` in the click payload.
- Add contract tests for zh/en primary/secondary/tertiary article CTA slots and downstream start/complete/view attribution.
- Ensure CMS article public surface can project RIASEC, MBTI, Big Five CTA targets without the MBTI default.

## 9. 自动化 Tests / Contract Coverage

Existing useful coverage:

- `tests/contracts/article-publishing-runtime-truth.contract.test.ts`: article public API, metadata/schema, sitemap/llms authority.
- `tests/contracts/article-metadata-consumption-gate.contract.test.ts`: CMS SEO title/description/canonical/hreflang/OG consumption.
- `tests/contracts/seo-ops-02-article-cta-attribution.contract.test.ts`: article CTA URL context and RIASEC take handoff.
- `tests/contracts/seo-ops-02d-article-rich-content-cta-attribution.contract.test.tsx`: CMS HTML/answer links safe attribution.
- `tests/contracts/private-noindex.contract.test.ts` and shared exposure contracts: private/noindex route exclusion.
- `tests/contracts/riasec-standard-funnel-events.contract.test.tsx`: RIASEC form/event attribution coverage.
- `backend/tests/Feature/V0_5/ArticlePublicApiTest.php`: public article list/detail/SEO, draft/human-review exclusion, same-slug alternates.
- `backend/tests/Feature/Cms/ArticleMultiTestGraphEdgesTest.php`: multiple test edges/import metadata.
- `backend/tests/Feature/Console/ArticleImportEditorialPackageCommandTest.php`: dry-run and non-public draft import.
- `backend/tests/Feature/Console/ArticlePublishControlledCommandTest.php`: controlled publish dry-run and release gates.
- `backend/tests/Feature/Ops/ArticleTranslationContractTest.php`: translation group model behavior.

Coverage gaps:

- No contract for different-slug zh/en article hreflang by `translation_group_id`.
- No preview URL/token/noindex contract.
- No first-class `article_to_test_click` contract.
- No public article landing surface contract proving CMS `cta_slots` render as primary/secondary/tertiary CTAs.
- No public article answer surface contract proving CMS `answer_surface_v1.faq_items` render as visible FAQ + FAQPage schema.
- Backend sitemap generator article path does not visibly share `publiclyReadable()` / `published_revision_id` guard with public article API.

Recommended pre-draft checks after platform fixes:

- `pnpm exec vitest run tests/contracts/article-publishing-runtime-truth.contract.test.ts tests/contracts/article-metadata-consumption-gate.contract.test.ts tests/contracts/seo-ops-02-article-cta-attribution.contract.test.ts tests/contracts/seo-ops-02d-article-rich-content-cta-attribution.contract.test.tsx tests/contracts/private-noindex.contract.test.ts`
- In `fap-api/backend`: targeted Article public API, editorial package import, controlled publish dry-run, translation contract tests.
- Public smoke: target article draft preview status/noindex, absence from public API, sitemap, `llms.txt`, `llms-full.txt`.

Recommended pre-publish checks:

- Controlled publish dry-run for both article ids.
- Production preview/render smoke for canonical, robots, Article/Breadcrumb/FAQ schema, visible FAQ, CTA hrefs and tracking context.
- Post-publish public smoke for only the published URL(s): 200, index/follow, canonical, reciprocal hreflang, sitemap inclusion, llms inclusion if intended, no private URL leakage.

## 10. 各个测试页承接能力

Public live scan result:

| Route | Exists/status | Indexability | Canonical | Sitemap/llms | CTA | Article source handoff | Canary suitability |
|---|---:|---|---|---|---|---|---|
| `/zh/tests` | 200 | index/follow | `https://fermatmind.com/zh/tests` | public route | has MBTI/RIASEC/Big Five links | n/a | GO |
| `/en/tests` | 200 | index/follow | `https://fermatmind.com/en/tests` | public route | has MBTI/RIASEC/Big Five links | n/a | GO |
| `/zh/tests/holland-career-interest-test-riasec` | 200 | index/follow | self | in sitemap/llms | `riasec_60` and `riasec_140` take links present | supports SEO CTA context | GO |
| `/en/tests/holland-career-interest-test-riasec` | 200 | index/follow | self | in sitemap/llms | `riasec_60` and `riasec_140` take links present | supports SEO CTA context | GO |
| `/zh/tests/mbti-personality-test-16-personality-types` | 200 | index/follow | self | in sitemap/llms | form CTAs present | supports attribution | GO |
| `/en/tests/mbti-personality-test-16-personality-types` | 200 | index/follow | self | in sitemap/llms | form CTAs present | supports attribution | GO |
| `/zh/tests/big-five-personality-test-ocean-model` | 200 | index/follow | self | in sitemap/llms | form CTAs present | supports attribution | GO |
| `/en/tests/big-five-personality-test-ocean-model` | 200 | index/follow | self | in sitemap/llms | form CTAs present | supports attribution | GO |

Additional live checks:

- `https://api.fermatmind.com/api/v0.3/scales/lookup?slug=holland-career-interest-test-riasec` returns `scale_code=RIASEC`, `is_indexable=true`, and forms `riasec_60` / `riasec_140` for both zh-CN and en.
- RIASEC take URLs with `?form=riasec_60` and `?form=riasec_140` are present on the relevant localized test detail page.
- Take/form URLs are not in sitemap/llms, which is correct for private/test-taking flow.

## 11. SEO 中台与运营文档能力

Docs exist and are useful:

- SEO baseline template: `docs/operations/seo-baseline-template-2026-06-02.md`
- CMS readiness checklist: `docs/operations/seo-cms-readiness-checklist-2026-06-02.md`
- Sitemap URL policy decision: `docs/operations/sitemap-url-policy-decision-2026-06-02.md`
- GPT content production contract: `docs/content/gpt-content-production-contract.md`
- Article request cards: `docs/content/article-request-cards/seo-article-requests-2026-06-02.md`
- Analytics CTA attribution docs: `docs/analytics/seo-cta-attribution.md`
- GA4/Baidu checklist: `docs/analytics/conversion-setup-qa-checklist.md`
- Backend SEO/search docs include GSC/Baidu/IndexNow/readiness/canary materials under `fap-api/backend/docs/seo/**`.

Docs strengths:

- Codex must not write public content assets is documented in repo rules and content docs.
- CMS/backend as content authority is documented.
- Draft/publish checklist, 7/14-day review, private URL exclusion, GSC/Baidu/GA4 owner gaps are covered.
- Existing docs already flag several unknowns that this scan confirms: draft sitemap/noindex, UI confirmation, publish approval, rollback.

Docs gaps:

- No canary-specific checklist tying `translation_group_id`, different-slug hreflang, preview noindex, CTA slot projection, FAQ schema grounding, and `article_to_test_click` into one executable gate.
- Some relevant docs are currently untracked in this worktree; this scan did not modify or stage them.

## 12. GO / NO-GO

`NO-GO: fix platform gap before preflight`.

Why not GO:

- CMS UI and preview are not verified.
- Draft noindex is not safe-by-default across create paths.
- Different-slug zh/en hreflang is not supported by current backend alternates logic.
- Article public landing/answer surfaces still default to MBTI and do not project canary CTA/FAQ slots.
- No first-class `article_to_test_click` event.
- Exact `translation_group_id` assignment path for the requested canary group is not UI-verified.

What is GO:

- Public test targets exist, are indexable, and are suitable CTA targets.
- Drafts are normally excluded from public article API/sitemap/llms because status/is_public/published revision gates exist.
- Private route and sensitive query analytics suppression is in place.
- Article route and baseline schema rendering are present for published content.

## 13. 阻塞项

P0 blockers before `SEO-CMS-CANARY-PREFLIGHT`:

1. Backend article hreflang must support `translation_group_id` siblings with different localized slugs.
2. Article public landing/answer surface must stop defaulting canary CTA/next step to MBTI and must project CMS/import CTA + FAQ slots or another explicit CMS-authoritative equivalent.
3. CMS draft preview/noindex must be verifiable, or an approved dry-run alternative must prove unpublished rendered output without public exposure.
4. `article_to_test_click` or an explicitly equivalent contracted click event must exist with locale, article slug, CTA id, target test, source path, and ideally translation group.
5. Exact `article_mbti_vs_holland_career_choice_v1` assignment path must be operator-verifiable.

P1 blockers / risks:

- Backend sitemap article generator should share the same published revision gate as public article API.
- Controlled publish and UI release gate are strong, but raw `ArticlePublishService` is less strict; keep release route permissions audited.
- Full rollback behavior is not proven beyond unpublish.

## 14. 后续任务拆分

These are proposed future PR-train items. They are not currently authorized by this scan. Do not implement until the user explicitly authorizes manifest/state updates.

### Proposed PR 1

- Proposed PR train id: `SEO-CMS-CANARY-BE-01`
- Proposed title: `fix(cms): support canary article hreflang and CMS CTA surfaces`
- Repo: `fap-api`
- Scope/files likely touched:
  - `backend/app/Services/Cms/ArticleSeoService.php`
  - `backend/app/Http/Controllers/API/V0_5/Cms/ArticleController.php`
  - `backend/app/Filament/Ops/Resources/ArticleResource.php`
  - `backend/app/Services/Cms/EditorialPackage/**`
  - `backend/tests/Feature/V0_5/ArticlePublicApiTest.php`
  - targeted CMS/editorial package tests
- Required checks:
  - targeted backend article API tests
  - editorial package import tests
  - controlled publish dry-run tests
  - translation contract tests
- Dependency assumptions: none, but must start from latest `main`.

Manifest entry needing authorization:

```yaml
- id: SEO-CMS-CANARY-BE-01
  repo: fap-api
  repo_path: <workspace>/fap-api
  branch: codex/seo-cms-canary-be-01-hreflang-cta-surfaces
  base: main
  depends_on: []
  mode: execute
  status: planned
  title: "fix(cms): support canary article hreflang and CMS CTA surfaces"
  artifacts:
    - backend/app/Services/Cms/ArticleSeoService.php
    - backend/app/Http/Controllers/API/V0_5/Cms/ArticleController.php
    - backend/app/Filament/Ops/Resources/ArticleResource.php
    - backend/tests/Feature/V0_5/ArticlePublicApiTest.php
```

State entry needing authorization:

```json
{
  "id": "SEO-CMS-CANARY-BE-01",
  "repo": "fap-api",
  "branch": "codex/seo-cms-canary-be-01-hreflang-cta-surfaces",
  "status": "planned",
  "title": "fix(cms): support canary article hreflang and CMS CTA surfaces",
  "checks": {},
  "failure_reason": null,
  "commit_sha": null,
  "pr_url": null,
  "merged_at": null,
  "remote_branch_deleted": false,
  "local_cleanup_executed": false
}
```

### Proposed PR 2

- Proposed PR train id: `SEO-CMS-CANARY-WEB-01`
- Proposed title: `feat(analytics): add article-to-test CTA tracking contract`
- Repo: `fap-web`
- Scope/files likely touched:
  - `lib/tracking/events.ts`
  - `lib/tracking/seoCtaAttribution.ts`
  - `components/cta/SeoTrackedCtaLink.tsx`
  - article CTA contract tests
  - RIASEC attribution contract tests
- Required checks:
  - targeted vitest tracking/article CTA contracts
  - `pnpm typecheck`
  - `pnpm test:contract` if scope warrants
- Dependency assumptions: depends on `SEO-CMS-CANARY-BE-01` if frontend must consume new CTA slots; can be split as pure event taxonomy first if approved.

Manifest entry needing authorization:

```yaml
- id: SEO-CMS-CANARY-WEB-01
  repo: fap-web
  repo_path: <workspace>/fap-web
  branch: codex/seo-cms-canary-web-01-article-to-test-tracking
  base: main
  depends_on: [SEO-CMS-CANARY-BE-01]
  mode: execute
  status: planned
  title: "feat(analytics): add article-to-test CTA tracking contract"
  artifacts:
    - lib/tracking/events.ts
    - lib/tracking/seoCtaAttribution.ts
    - components/cta/SeoTrackedCtaLink.tsx
    - tests/contracts/*article*cta*
```

State entry needing authorization:

```json
{
  "id": "SEO-CMS-CANARY-WEB-01",
  "repo": "fap-web",
  "branch": "codex/seo-cms-canary-web-01-article-to-test-tracking",
  "status": "planned",
  "title": "feat(analytics): add article-to-test CTA tracking contract",
  "checks": {},
  "failure_reason": null,
  "commit_sha": null,
  "pr_url": null,
  "merged_at": null,
  "remote_branch_deleted": false,
  "local_cleanup_executed": false
}
```

### Proposed execution item

- Proposed id: `SEO-CONTENT-P1-08`
- Proposed title: `SEO-CONTENT-P1-08 create bilingual CMS canary draft without publish`
- Scope:
  - CMS draft creation only after blockers are fixed.
  - No frontend content assets.
  - No publish.
  - No sitemap/search submission.
  - Verify draft hidden from public API/sitemap/llms and preview/noindex behavior.
- Required checks:
  - Backend import/preflight dry-run.
  - Public API 404 for draft URLs.
  - Sitemap/llms absence.
  - Preview render verification if preview exists.
- Dependency assumptions:
  - `SEO-CMS-CANARY-BE-01` complete.
  - `SEO-CMS-CANARY-WEB-01` complete or explicitly waived by user.

Follow-up execution prompt:

```text
请授权更新 docs/codex/pr-train.yaml 和 docs/codex/pr-train-state.json，添加 SEO-CMS-CANARY-BE-01、SEO-CMS-CANARY-WEB-01，以及后续 SEO-CONTENT-P1-08 draft-only 执行项；然后先执行 SEO-CMS-CANARY-BE-01，严格按 manifest scope 修复 canary article hreflang、CMS CTA/FAQ surface 和 preview/noindex 可验证性，不创建 CMS draft，不 publish。
```

## 15. 需要用户确认的问题

1. 是否有可用的 CMS/admin 只读登录态或截图，供确认 Article UI、preview、translation group、CTA/FAQ fields、rollback/unpublish？
2. 是否允许把 `SEO-CMS-CANARY-BE-01` / `SEO-CMS-CANARY-WEB-01` 加入 PR train manifest/state？
3. canary draft 创建方式是 UI 手工创建、editorial package importer、还是受控脚本导入？不同方式会影响 `translation_group_id` 和 draft noindex。
4. `article_to_test_click` 是否必须是新事件名，还是允许继续使用 `start_attempt` 但补齐 click payload 和 contract？
5. 是否要求 zh/en 同时 draft，还是允许先创建中文 draft 但不 publish？当前建议是双语同组一起 draft，publish 前再决定节奏。
