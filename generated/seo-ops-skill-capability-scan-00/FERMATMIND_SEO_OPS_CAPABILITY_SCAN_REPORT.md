# FermatMind SEO Ops Capability Scan Report

## 1. Executive summary

- Current SEO middle-office state: FermatMind already has a backend-authoritative SEO Ops layer. `/ops/seo` is implemented as a native read-only Filament page backed by `seo_intel` summaries and documented Metabase/private access, while `/ops/seo-operations` is a separate CMS SEO repair surface with guarded write actions.
- Completed capabilities: URL Truth and Issue Queue foundations, Search Channel Queue schema/runtime planner, Metabase MVP dashboard spec, private Metabase access runbooks, CMS editorial package import, controlled article publish gate, claim linting, private URL exclusion/noindex policy, fap-web CMS article runtime, sitemap/llms generation, and token-gated content release revalidation route.
- Missing or not live-verified capabilities: live GSC/Baidu collectors, live Baidu/360/Sogou/Shenma submission, scheduler enablement, production Metabase UI state, production row counts, live `/ops/seo` login redirect, and current private dashboard card state require operator access. Marked Access required / Not verified.
- Skill should complement, not replace: daily/weekly SEO review, Metabase/export interpretation, CMS package QA, controlled-publish preflight review, Search Channel Queue read-only audit, post-publish smoke, 7/14-day canary observation, URL Truth/drift summaries, claim/private URL audit reports.
- Skill must not duplicate: URL Truth storage, Issue Queue storage, Search Channel submission, CMS publish, Metabase dashboard storage, collector scheduling, production DB writes, live IndexNow/Baidu/GSC calls, ISR revalidation, or Ops Portal permission changes.

## 2. Current verified capabilities

| Capability | Status | Evidence | Owner system | Skill role |
|---|---|---|---|---|
| `/ops/seo` route/page | Exists; native read-only Filament dashboard, not a mutation surface | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Filament/Ops/Pages/SeoDashboardAccessPage.php` class `SeoDashboardAccessPage`, `slug = 'seo'`; `/Users/rainie/Desktop/GitHub/fap-api/backend/docs/seo/seo-dash-mvp-online-final-closeout.md` | fap-api Ops Portal | Read status/runbook evidence; summarize, do not mutate |
| `/ops/seo` unauth redirect | Documented as redirect to `/ops/login`; not live-verified in this scan | `/Users/rainie/Desktop/GitHub/fap-api/backend/docs/seo/seo-dash-mvp-online-final-closeout.md` | fap-api Ops Portal | Mark Access required if live proof needed |
| SEO Intel private API | Exists behind admin SEO read middleware | `/Users/rainie/Desktop/GitHub/fap-api/backend/routes/api.php` prefix `ops/seo-intel`; `EnsureSeoIntelReadAuthorized` | fap-api API | Read-only review if operator provides access/export |
| Owner / ops-read / SEO-read access | Defined | `EnsureSeoIntelReadAuthorized::isAllowed` allows `ADMIN_SEO_INTEL_READ`, `ADMIN_OWNER`, `ADMIN_OPS_READ` | fap-api auth | Do not modify permissions |
| `/ops/seo-operations` | Exists; operational CMS SEO repair surface | `SeoOperationsPage`, `SeoOperationsService` | fap-api Ops Portal/CMS | Do not duplicate; skill may prepare review checklist |
| URL Truth storage | Exists | migration `2026_05_17_000100_create_seo_urls_table.php`; `2026_05_17_000200_create_seo_url_entities_table.php`; `UrlTruthInventoryCollector` | seo_intel | Read/audit only |
| Issue Queue storage | Exists | migration `2026_05_17_001700_create_seo_issue_queue_table.php`; `IssueQueueFoundationCollector` | seo_intel | Summarize queue; no writes |
| Search Channel Queue | Exists with migration, planner, writer, live executor | migration `2026_05_20_220000_create_seo_search_channel_queue_tables.php`; `SearchChannelQueuePlanner`; `SearchChannelQueueEligibilityEvaluator`; `SearchChannelQueueLiveSubmissionExecutor` | seo_intel/fap-api | Read-only queue audit; no submit |
| GSC/Baidu/IndexNow foundations | Readiness/foundation; live gates disabled by default | `config/seo_intel.php` GSC/Baidu/IndexNow sections; docs `gsc-live-readiness-contract.md`, `baidu-live-readiness-contract.md`, `indexnow-live-readiness-contract.md` | seo_intel | Review readiness and reports only |
| Metabase MVP dashboard | Documented private 10-card MVP; not live-accessed in this scan | `metabase-ops-access-runbook.md`; `url-truth-mvp-dashboard-spec.md`; `seo-dash-mvp-online-final-closeout.md` | Metabase private deployment | Interpret screenshots/exports; never expose |
| CMS editorial package import | Exists; dry-run and draft-only import command | `ArticleImportEditorialPackage` | fap-api CMS | QA package before operator import |
| Controlled Publish | Exists with exact confirmation and preflight gates | `ArticlePublishControlled` | fap-api CMS | Preflight review; no publish |
| fap-web article runtime | Dynamic SSR article route using CMS/LKG API data | `/Users/rainie/Desktop/GitHub/fap-web/app/(localized)/[locale]/articles/[slug]/page.tsx` | fap-web public runtime | Post-publish smoke only |
| Private URL guard | Exists in indexing/discoverability/analytics suppression code | `lib/seo/indexingPolicy.ts`; `lib/seo/discoverabilityExposurePolicy.ts`; `lib/tracking/browserAnalyticsSuppression.ts` | fap-web | Audit expected exclusions |
| ISR/content release revalidation | Exists; token-gated and path-allowlisted | `/Users/rainie/Desktop/GitHub/fap-web/app/api/content-release/revalidate/route.ts` | fap-web | Smoke checklist only; no trigger |

## 3. CMS / Ops Portal scan

| Area | Existing capability | Evidence | Missing | Risk | Skill implication |
|---|---|---|---|---|---|
| `/ops/seo` | Native SEO dashboard with URL Truth, Issue Queue, Metabase, Search Channel, crawler safety cards | `SeoDashboardAccessPage` cards and `seo-dash-mvp-online-final-closeout.md` | Live UI not accessed | Access required for current production UI proof | Skill reads/reports only |
| `/ops/seo-operations` | CMS SEO operations page with bulk actions | `SeoOperationsPage::applyBulkAction`; `SeoOperationsService::applyBulkAction` | Not intended for daily dashboard | Write-capable surface must stay operator-controlled | Skill must not call mutations |
| Ops auth | Admin SEO read access middleware | `EnsureSeoIntelReadAuthorized` | Live unauth redirect not verified | Login/session proof requires access | Skill records Access required |
| Metabase bridge | Explicit no iframe/reverse proxy/public Metabase | `ops-portal-seo-private-metabase-access-bridge.md`; `metabase-ops-access-runbook.md` | Live network state not verified | Public exposure would be severe | Skill should never expose or proxy Metabase |
| CMS Article resource | Article model supports publication state, public/indexable flags, SEO meta relation | `Article`; `ArticleSeoMeta` | Filament Article resource not deeply scanned | Resource UI access not verified | Skill uses API/model evidence only |
| Article public API | Publicly readable/indexable gating | `ArticleController::index`, `show`, `seo`; `publiclyReadable`, `publiclyIndexable` | API fallback answer surface may create authority-drift risk | Generated fallback CTA/FAQ must not replace CMS authority | Skill should flag fallback authority risk |
| Editorial package import | Non-public draft import with dry-run and warnings | `ArticleImportEditorialPackage` | Actual operator package content not scanned | Import still requires operator action | Skill does package QA only |
| Controlled Publish gate | Exact phrase, body hash, claims, media, references, FAQ, CTA, SEO metadata, make-indexable gates | `ArticlePublishControlled::preflight` | Rollback/snapshot not fully proven beyond revision model/import records | Publish remains high-impact | Skill prepares checklist; never publishes |
| Article Publishing Ops Queue | Read-only queue summary for publish readiness | `ArticlePublishingOpsPage` | Live Ops page not accessed | Queue state requires admin access | Skill can summarize if export provided |
| Draft exclusion | Public article API requires status/published revision/public flags | `Article::published`, `publiclyReadable`, `publiclyIndexable` | Live sitemap data not accessed | Mixed sitemap sources can drift | Skill audits source/runtime parity |

## 4. seo_intel scan

| Table / collector | Exists | Status | Write mode | Evidence | Skill implication |
|---|---:|---|---|---|---|
| `seo_urls` | Yes | URL Truth foundation | Config-gated; dry-run default | migration `2026_05_17_000100_create_seo_urls_table.php`; `UrlTruthInventoryCollector` | Read-only review |
| `seo_url_entities` | Yes | URL entity truth foundation | Config-gated; dry-run default | migration `2026_05_17_000200_create_seo_url_entities_table.php` | Read-only review |
| `seo_issue_queue` | Yes | Issue Queue foundation | Config-gated; CMS mutation false | migration `2026_05_17_001700_create_seo_issue_queue_table.php`; `IssueQueueFoundationCollector` | Summarize only |
| `seo_contract_snapshots` | No | Not found | N/A | migration/code search not found | Gap: drift/contract snapshot not available |
| `seo_html_snapshots` | No | Not found | N/A | migration/code search not found | Gap: rendered HTML history not available |
| `seo_sitemap_entries` | No | Not found | N/A | migration/code search not found | Use sitemap runtime/source exports instead |
| `seo_llms_entries` | No | Not found | N/A | migration/code search not found | Use llms runtime/source exports instead |
| `seo_parity_issues` | No | Not found | N/A | migration/code search not found | Gap: parity issues are not normalized table |
| `seo_gsc_daily` | Yes | Foundation/readiness | Live API disabled by default | migration `2026_05_17_000900_create_seo_gsc_daily_table.php`; `config/seo_intel.php` | Review GSC daily when populated |
| `seo_google_url_inspection_snapshots` | No | Not found | N/A | migration/code search not found | Gap: URL inspection snapshots missing |
| `seo_baidu_push_logs` | Yes | Foundation/readiness | Live push disabled by default | migration `2026_05_17_001000_create_seo_baidu_push_logs_table.php`; `config/seo_intel.php` | Review only |
| `seo_baidu_crawl_snapshots` | No | Not found | N/A | migration/code search not found | Gap |
| `seo_baidu_landing_daily` | Yes | Foundation | Config-gated | migration `2026_05_17_001100_create_seo_baidu_landing_daily_table.php` | Review when populated |
| `seo_rank_keywords` | No | Not found | N/A | migration/code search not found | Gap |
| `seo_rank_snapshots` | No | Not found | N/A | migration/code search not found | Gap |
| `seo_ga4_landing_daily` | No | Not found | N/A | migration/code search not found | Gap; GA4 is not truth source |
| `seo_cluster_daily` | Yes | Foundation | Config-gated | migration `2026_05_17_000700_create_seo_cluster_daily_table.php` | Review when populated |
| `seo_revenue_daily` | Yes | Foundation | Config-gated; excludes raw PII | migration `2026_05_17_000600_create_seo_revenue_daily_table.php`; attribution config | Review sanitized aggregates |
| `seo_content_decay_alerts` | No | Not found | N/A | migration/code search not found | Gap |
| `seo_competitor_rank_snapshots` | No | Not found | N/A | migration/code search not found | Gap |
| `UrlTruthInventoryCollector` | Yes | Foundation collector | Writes only when enabled and not dry-run/no-write | collector metadata; `SeoIntelCollectorManager` | Skill should not run writes |
| `GscCollector` | Yes | Readiness/foundation | Live API disabled by default | collector file; config `gsc_live_api_enabled=false` | Skill reviews exported data |
| `BaiduFoundationCollector` | Yes | Readiness/foundation | Real URL submission false | collector file; config | Skill reviews readiness |
| `IndexNowFoundationCollector` | Yes | Readiness/foundation | Real URL submission false | collector file; config | Skill reviews readiness |
| `So360/Sogou/Shenma` collectors | Yes | Domestic readiness/foundation | Real URL submission false | collector files; config | Skill reviews only |
| Scheduler | No SEO scheduler found | Not scheduled | N/A | `Console/Kernel.php` has no `seo-intel:*` schedule; config scheduler false | Skill must not enable scheduler |
| PII guard | Yes | PII/order/payment/email false | Guarded | `config/seo_intel.php`; `UrlTruthInventoryCollector::forbiddenDetailKeys` | Skill must avoid PII/raw data |
| Node2 local DB guard | Yes | Explicitly forbidden | N/A | `config/seo_intel.php`; Search Channel evaluator | Skill must not use Node2 authority |

## 5. Metabase / dashboard scan

| Dashboard / card / runbook | Exists | Evidence | Can support daily review? | Gap |
|---|---:|---|---:|---|
| Metabase private access runbook | Yes | `metabase-ops-access-runbook.md` | Yes | Live deployment state not accessed |
| Private access bridge contract | Yes | `ops-portal-seo-private-metabase-access-bridge.md` | Yes | Requires operator confirmation for current network state |
| Access/export/sharing verification | Yes | `ops-portal-seo-access-export-sharing-verification.md` | Yes | Current Metabase settings not live-verified |
| URL Truth MVP dashboard spec | Yes | `url-truth-mvp-dashboard-spec.md` | Yes | Spec-focused; not a live UI proof |
| SEO Dash MVP final closeout | Yes | `seo-dash-mvp-online-final-closeout.md` | Yes | Historical/operator closeout, not current access |
| 10 cards | Documented | closeout says 10 verified cards | Yes | Current cards require Metabase/Ops access |
| Daily SEO review | Supported by URL Truth, Issue Queue, Search Channel, crawler safety cards | runbooks/specs | Yes | Needs live data feed/export |
| Weekly article review | Partially supported | ArticlePublishingOps + issue queue + CMS publish evidence | Partial | Article funnel/CTA performance card gap |
| 7/14-day canary observation | Partially supported | Search Channel canary docs and dashboard specs | Partial | Live GSC/Baidu collector readiness only |
| Public sharing disabled | Documented | `metabase-ops-access-runbook.md` | N/A | Access required for current proof |

## 6. Search Channel Queue scan

| Channel | Queue exists | Eligibility guard | Submission guard | Evidence | Skill role |
|---|---:|---|---|---|---|
| Google sitemap | Yes as readiness/queue channel | Blocks invalid/draft/noindex/private/claim unsafe | No live submit; sitemap source only | config `search_channel_queue`; `SearchChannelQueueEligibilityEvaluator` | Review queue and sitemap readiness |
| GSC readiness | Yes | Same evaluator | Live API disabled by default | `config/seo_intel.php`; GSC readiness docs | Report only |
| llms queue | Yes | Same evaluator | No submission action | queue config and llms runtime | Audit inclusion/exclusion |
| Baidu push | Yes as future submission channel | Same evaluator | Live submission disabled/default false | config and Baidu docs | Human-authorized only |
| IndexNow | Yes | Same evaluator + executor validates approval, host, claim_safe, not private | Exact approval phrase, live gates, external gates, key gates | `SearchChannelQueueLiveSubmissionExecutor` | Prepare approval review only |
| 360 | Yes as future channel | Same evaluator | Real submission disabled | config domestic foundations | Human-authorized only |
| Sogou | Yes as future channel | Same evaluator | Real submission disabled | config domestic foundations | Human-authorized only |
| Shenma | Yes as future channel | Same evaluator | Real submission disabled | config domestic foundations | Human-authorized only |

## 7. fap-web runtime scan

| Runtime capability | Evidence | Risk | Skill role |
|---|---|---|---|
| Article page SSR/readable initial HTML | `app/(localized)/[locale]/articles/[slug]/page.tsx`, `dynamic = "force-dynamic"`, `renderArticleBody` | Depends on CMS/LKG data availability | Smoke HTML only |
| FAQ visible and JSON-LD | same file uses `answerSurface.faqBlocks` and `FAQPage` JSON-LD | CMS answer surface fallback risk in API if missing | Verify FAQ source and visibility |
| CTA tracking | `SeoTrackedCtaLink`; `seoCtaAttribution` | Must avoid private/take-path attribution | Confirm `article_to_test_click` appears separately |
| `article_to_test_click` separated | `SeoTrackedCtaLink` maps article detail to `article_to_test_click`, other surfaces to `start_attempt` | Naming differs from requested `start_test` term | Report mapping clearly |
| Private result/share routes noindex | result/share page metadata and `NOINDEX_ROBOTS` | Other private paths need policy audit | Include smoke checklist |
| Sitemap generation | `next-sitemap.config.js` mixes static generated, CMS/public APIs, backend sitemap source, safe fallback | Authority drift risk remains if fallback used | Skill should compare source/runtime |
| `llms.txt` / `llms-full.txt` | route handlers pull CMS/backend sources and apply deny/indexing policy | Runtime data not fetched in this scan | Audit generated output only with approval |
| Robots | `app/robots.ts` | Simple allow/disallow; path-level private control is metadata/policy | Include in smoke |
| Revalidation route | `app/api/content-release/revalidate/route.ts` token + allowlist + reject private paths | Triggering is forbidden without authorization | Skill prepares payload review only |

## 8. Claim / private URL guard scan

| Guard | Exists | Evidence | Missing | Risk |
|---|---:|---|---|---|
| Diagnostic/treatment/clinical claim block | Yes | `ChineseClaimLinter` forbidden phrases include diagnosis, treatment, cure, clinical claims | English claim linter not fully scanned | Claims may appear outside Chinese package path |
| Career success/hiring/best-career block | Yes | `ChineseClaimLinter` blocks precise career recommendation, best career, hiring fit, success/salary guarantees | Need package-specific review | High if bypassed |
| RIASEC/Big Five boundary | Yes | `ChineseClaimLinter` blocks RIASEC career recommendation and Big Five precise matching | Runtime article body audit not performed | Medium |
| Claim unsafe search blocking | Yes | `SearchChannelQueueEligibilityEvaluator` blocks `claim_unsafe`; executor also validates `claim_safe` | Live queue data not inspected | High if queue manually changed |
| Private URL sitemap/llms exclusion | Yes | `discoverabilityExposurePolicy`, `indexingPolicy`, `llms` route filters, sitemap config filters | Generated outputs not fetched | High if source/runtime drift |
| Sensitive analytics query stripping/suppression | Yes | `browserAnalyticsSuppression` sensitive query and private path suppression | Runtime analytics not observed | Medium |
| Email/order/payment/result/token forbidden in SEO detail | Yes | `UrlTruthInventoryCollector::forbiddenDetailKeys` | Production rows not inspected | High |
| Test coverage | Unknown | Test files not scanned in this task | Unknown | Needs targeted test inventory |

## 9. Final capability classification

### A. Already handled by SEO middle office

- URL Truth storage and entity mapping.
- Issue Queue foundation and summary.
- Search Channel Queue schema/planner/writer/executor gates.
- seo_intel collector manager safety gates.
- Private Metabase MVP dashboard/runbook/spec.
- `/ops/seo` read-only SEO dashboard.

### B. Already handled by CMS / backend

- CMS Article model, SEO meta relation, public/indexable state.
- Editorial package import into non-public draft.
- Article Publishing Ops queue/readiness surface.
- Controlled Publish exact confirmation and preflight gate.
- Claim linting for Chinese SEO content packages.
- CMS/public Article API gating for public pages.

### C. Should be assisted by Codex skill

- Daily SEO signal review from Metabase/Ops/exported seo_intel summaries.
- Weekly article review and content decay/manual opportunity summaries.
- CMS content package QA before import.
- Controlled publish preflight checklist and evidence compilation.
- Post-publish smoke checklist for article HTML, metadata, FAQ, CTA, sitemap/llms.
- Search Channel Queue read-only audit.
- URL Truth/drift review and authority-drift report.
- 7/14-day canary observation narrative from operator-provided data.
- Claim and private URL guard audit report.

### D. Must remain human-authorized

- CMS mutations/imports/publish.
- Sitemap/search submission.
- GSC/Baidu/IndexNow/360/Sogou/Shenma live calls.
- ISR/content release revalidation.
- Collector/scheduler enablement.
- Metabase exposure/sharing/export permission changes.
- Production DB writes or migrations.
- Ops Portal permission changes.

### E. Unknown / needs access

- Current production `/ops/seo` UI state and live redirect behavior.
- Current Metabase settings, dashboards, and card counts.
- Current seo_intel production row counts.
- Whether GSC/Baidu data is populated by manual import vs live collector.
- Current Search Channel Queue production contents and IndexNow accepted record.
- Full automated test coverage for claim/private URL guards.
