# SEO Ops Scan Evidence Index

| Claim | Evidence path | Line / function / class / migration / route | Confidence | Notes |
|---|---|---|---|---|
| `/ops/seo` exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Filament/Ops/Pages/SeoDashboardAccessPage.php` | class `SeoDashboardAccessPage`, `protected static ?string $slug = 'seo'` | High | Source verified |
| `/ops/seo` is read-only/native dashboard | `SeoDashboardAccessPage.php`; `seo-dash-mvp-online-final-closeout.md` | status cards and closeout dashboard notes | High | No mutation method found in page scan |
| `/ops/seo` unauth redirects `/ops/login` | `/Users/rainie/Desktop/GitHub/fap-api/backend/docs/seo/seo-dash-mvp-online-final-closeout.md` | documented final closeout | Medium | Not live-verified; Access required |
| Ops route disabled if admin panel disabled | `/Users/rainie/Desktop/GitHub/fap-api/backend/routes/web.php` | `/admin` and `/ops` route fallback/redirect block | High | Source verified |
| SEO Intel private API routes exist | `/Users/rainie/Desktop/GitHub/fap-api/backend/routes/api.php` | prefix `ops/seo-intel`; endpoints `overview`, `url-truth`, `issues`, `trends`, `page-performance`, `conversion-funnel` | High | Source verified |
| SEO Intel read auth exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Http/Middleware/EnsureSeoIntelReadAuthorized.php` | `isAllowed`; envs `ADMIN_SEO_INTEL_READ`, `ADMIN_OWNER`, `ADMIN_OPS_READ` | High | Source verified |
| SEO Intel API is read-only | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Http/Controllers/API/V0_5/Ops/SeoIntel/SeoIntelDashboardController.php` | response meta `read_only=true` | High | Source verified |
| `/ops/seo-operations` exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Filament/Ops/Pages/SeoOperationsPage.php` | class `SeoOperationsPage`, slug `seo-operations` | High | Source verified |
| `/ops/seo-operations` can mutate CMS SEO fields | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Ops/SeoOperationsService.php` | actions `fill_metadata`, `sync_canonical`, `sync_robots`, `mark_indexable`, `mark_noindex` | High | Must not be duplicated by skill |
| URL Truth table exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/database/migrations/seo_intel/2026_05_17_000100_create_seo_urls_table.php` | migration creates `seo_urls` | High | Source verified |
| URL entity table exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/database/migrations/seo_intel/2026_05_17_000200_create_seo_url_entities_table.php` | migration creates `seo_url_entities` | High | Source verified |
| Issue Queue table exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/database/migrations/seo_intel/2026_05_17_001700_create_seo_issue_queue_table.php` | migration creates `seo_issue_queue` | High | Source verified |
| Search Channel Queue tables exist | `/Users/rainie/Desktop/GitHub/fap-api/backend/database/migrations/seo_intel/2026_05_20_220000_create_seo_search_channel_queue_tables.php` | creates batches/items/events with eligibility, approval, execution, claim, private fields | High | Source verified |
| GSC table exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/database/migrations/seo_intel/2026_05_17_000900_create_seo_gsc_daily_table.php` | migration creates `seo_gsc_daily` | High | Source verified |
| Baidu push log table exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/database/migrations/seo_intel/2026_05_17_001000_create_seo_baidu_push_logs_table.php` | migration creates `seo_baidu_push_logs` | High | Source verified |
| `seo_contract_snapshots` not found | migrations/code search | no matching migration/model found | Medium | Based on local search, not DB inspection |
| `seo_html_snapshots` not found | migrations/code search | no matching migration/model found | Medium | Based on local search |
| `seo_sitemap_entries` not found | migrations/code search | no matching migration/model found | Medium | Based on local search |
| `seo_llms_entries` not found | migrations/code search | no matching migration/model found | Medium | Based on local search |
| `seo_parity_issues` not found | migrations/code search | no matching migration/model found | Medium | Based on local search |
| Collector safety gates exist | `/Users/rainie/Desktop/GitHub/fap-api/backend/config/seo_intel.php` | `dry_run_default=true`, `allow_external_api_calls=false`, `allow_production_crawl=false`, `allow_production_log_read=false` | High | Source verified |
| Collectors disabled by default | `config/seo_intel.php`; `SeoIntelCollectorManager` | `enabled`, `write_enabled`, `collectors_enabled` default false; blocked result when disabled | High | Source verified |
| No SEO scheduler found | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Console/Kernel.php` | no `seo-intel:*` schedule in scanned schedule block | Medium | Source scan only |
| Node2/local DB forbidden | `config/seo_intel.php`; `SearchChannelQueueEligibilityEvaluator` | forbidden source authorities and reason codes | High | Source verified |
| PII guard exists | `config/seo_intel.php`; `UrlTruthInventoryCollector` | `allow_pii=false`, forbidden detail keys include email/order/payment/token/raw IP/UA | High | Source verified |
| Search Channel command is no-live by design | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Console/Commands/SeoIntelSearchChannelQueueCommand.php` | description and payload flags `search_submission=false`, `live_submission=false` | High | Source verified |
| Search Channel eligibility blocks draft/noindex/private/claim unsafe | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/SeoIntel/SearchChannelQueue/SearchChannelQueueEligibilityEvaluator.php` | `evaluateUrl` blocker rules | High | Source verified |
| Search Channel live submit requires exact approval and gates | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/SeoIntel/SearchChannelQueue/SearchChannelQueueLiveSubmissionExecutor.php` | `expectedApprovalPhrase`, `validateLiveGates`, `validateQueueItem` | High | Source verified |
| Metabase private localhost-only is documented | `/Users/rainie/Desktop/GitHub/fap-api/backend/docs/seo/metabase-ops-access-runbook.md` | private model: no public IPv4, bind `127.0.0.1`, public sharing disabled | Medium | Documented, not live-verified |
| Public Metabase iframe/reverse proxy forbidden | `ops-portal-seo-private-metabase-access-bridge.md`; `metabase-ops-access-runbook.md` | forbidden public URL/DNS/CDN/iframe/reverse proxy | High | Runbook evidence |
| Metabase datasource limited to `seo_intel` | `metabase-ops-access-runbook.md`; `ops-portal-seo-access-export-sharing-verification.md` | datasource boundary and verification checklist | Medium | Requires live operator confirmation |
| 10-card dashboard documented | `seo-dash-mvp-online-final-closeout.md`; `url-truth-mvp-dashboard-spec.md` | closeout and MVP card groups | Medium | Historical/documented evidence |
| CMS editorial package import exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Console/Commands/ArticleImportEditorialPackage.php` | command `articles:import-editorial-package` | High | Source verified |
| Import gate table exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/database/migrations/2026_05_14_000100_create_article_editorial_package_imports_table.php` | table includes body hash, headings, references, claim/media/graph JSON | High | Source verified |
| Controlled publish gate exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Console/Commands/ArticlePublishControlled.php` | command `articles:publish-controlled`; exact confirmation and preflight | High | Source verified |
| Publish gate checks body hash/claims/FAQ/CTA/references/media/SEO | `ArticlePublishControlled.php` | `preflight`, `expectedConfirmationPhrase` | High | Source verified |
| Article Publishing Ops queue exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Filament/Ops/Pages/ArticlePublishingOpsPage.php` | class `ArticlePublishingOpsPage`, slug `article-publishing-ops` | High | Source verified |
| Article public/readable/indexable gates exist | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Models/Article.php` | scopes `published`, `publiclyReadable`, `publiclyIndexable` | High | Source verified |
| Article SEO metadata model exists | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Models/ArticleSeoMeta.php` | table `article_seo_meta`, fillable SEO fields | High | Source verified |
| Public Article API hides unpublished articles | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Http/Controllers/API/V0_5/Cms/ArticleController.php` | `index`, `show`, `seo` use public/published checks | High | Source verified |
| fap-web article route is dynamic SSR | `/Users/rainie/Desktop/GitHub/fap-web/app/(localized)/[locale]/articles/[slug]/page.tsx` | `dynamic = "force-dynamic"` and server rendering code | High | Source verified |
| Article FAQ and JSON-LD render from answer surface | `app/(localized)/[locale]/articles/[slug]/page.tsx` | `faqBlocks`, `FAQPage`, structured data scripts | High | Source verified |
| Article CTA tracking exists | `/Users/rainie/Desktop/GitHub/fap-web/components/cta/SeoTrackedCtaLink.tsx`; `lib/tracking/seoCtaAttribution.ts` | event mapping and public test-path attribution | High | Source verified |
| `article_to_test_click` is separated from start event | `SeoTrackedCtaLink.tsx` | article detail event name `article_to_test_click`, other contexts `start_attempt` | High | Source verified |
| Private routes noindex | result/share page files; `lib/seo/noindex.ts` | `NOINDEX_ROBOTS` metadata | High | Source verified for sampled routes |
| Private paths excluded from sitemap/llms policy | `discoverabilityExposurePolicy.ts`; `indexingPolicy.ts`; `next-sitemap.config.js`; `llms.txt/route.ts`; `llms-full.txt/route.ts` | shared deny patterns and `shouldIncludeInSitemap` | High | Source verified |
| Sensitive analytics suppression exists | `/Users/rainie/Desktop/GitHub/fap-web/lib/tracking/browserAnalyticsSuppression.ts` | private route and sensitive query suppression | High | Source verified |
| Revalidation route exists and is token-gated | `/Users/rainie/Desktop/GitHub/fap-web/app/api/content-release/revalidate/route.ts` | `CONTENT_RELEASE_REVALIDATE_TOKEN`, path allowlist/rejections, `revalidatePath` | High | Source verified |
| Sitemap generation is mixed-source | `/Users/rainie/Desktop/GitHub/fap-web/next-sitemap.config.js` | backend sitemap source, CMS article API, static generated paths, fallback | High | Source verified |
| Robots route exists | `/Users/rainie/Desktop/GitHub/fap-web/app/robots.ts` | production allow and sitemap URL, staging disallow | High | Source verified |
| Claim linter blocks diagnosis/treatment/career/hiring claims | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/SeoIntel/ClaimLint/ChineseClaimLinter.php` | forbidden phrase patterns and severity mapping | High | Source verified |
| Claim linter is non-mutating | `ChineseClaimLinter.php`; `SeoIntelClaimLintCommand.php` | metadata no rewrite/CMS mutation/search enqueue; command fixture/json only | High | Source verified |
| Test coverage for claim/private guard | Not verified | Not scanned | Unknown | Needs targeted test inventory if requested |
