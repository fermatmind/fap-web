# SEO Ops Skill Build Recommendation

## 1. Should we build one skill or multiple?

Current recommendation: build one umbrella skill first: `.agents/skills/fermatmind-seo-ops/`.

Reason: FermatMind SEO Ops is already a cross-system middle office. The skill must consistently enforce the same no-write, no-submit, no-publish, no-revalidate, no-production-access boundaries across CMS, Ops Portal, seo_intel, Metabase, Search Channel Queue, and fap-web. A single V1 skill reduces contradictory instructions.

Future split candidates after stable usage:

- `fermatmind-seo-gsc-review`
- `fermatmind-seo-cms-package-qa`
- `fermatmind-seo-search-channel-audit`
- `fermatmind-seo-post-publish-smoke`

## 2. V1 workflows

- `daily_seo_review`
- `weekly_article_review`
- `cms_content_package_qa`
- `seo_middle_office_audit`
- `search_channel_queue_audit`
- `post_publish_smoke`
- `canary_observation`
- `url_truth_drift_review`

## 3. Workflow definitions

| Workflow | Trigger | Inputs | Steps | Outputs | Hard gates | No-go conditions |
|---|---|---|---|---|---|---|
| `daily_seo_review` | Operator asks for daily SEO review | Metabase screenshot/export, `/ops/seo` notes, GSC/Baidu exports if available | Classify data freshness, URL Truth, Issue Queue, Search Channel Queue, collector readiness, anomalies | Daily SEO signal report | Access required for private dashboards | No DB writes, no collector run, no search submission |
| `weekly_article_review` | Weekly content/growth review | Article list, GSC/exported metrics, CMS status, CTA metrics if available | Rank articles, find decay/opportunities, verify claim/private/sitemap status | Weekly article review | Do not invent metrics | No CMS mutation, no article generation, no publish |
| `cms_content_package_qa` | Before backend import | Content package files, slug/locale, references, CTA, FAQ, claims | Validate package structure, body hash expectation, headings, references, claims, FAQ/CTA, no private URLs | QA report and import readiness | Claim warning must remain warning/block | No import, no draft creation, no schema auto-generation |
| `seo_middle_office_audit` | SEO Ops architecture scan | Repo evidence, runbooks, optional exports | Audit `/ops/seo`, `seo_intel`, Metabase, Search Channel, runtime safety | Evidence-first audit report | Unknown stays Unknown | No prod access without authorization |
| `search_channel_queue_audit` | Before search submission/canary review | Queue export, URL list, channel target | Check eligibility blockers, claim safety, private/noindex/draft, approval state, execution state | Queue audit report | Any unsafe URL is no-go | No GSC/Baidu/IndexNow/360/Sogou/Shenma calls |
| `post_publish_smoke` | After operator-published article | URL, expected slug/locale, CMS evidence | Check initial HTML, title/meta/canonical/hreflang, FAQ, CTA, JSON-LD, sitemap/llms inclusion, private exclusions | Smoke report | Access required for live page if not public | No revalidation trigger |
| `canary_observation` | 7/14-day canary checkpoint | Search channel record, GSC/Baidu/IndexNow evidence, URL metrics | Compare expected vs observed indexing/crawl/clicks, classify readiness/live source | Canary observation report | Do not treat readiness as live data | No resubmission |
| `url_truth_drift_review` | URL Truth or parity review | `seo_intel` export, fap-web sitemap/llms/runtime evidence | Compare URL authority, CMS source, frontend generated paths, private/noindex exclusions | URL Truth/drift report | Node2/local DB forbidden | No queue writes |

## 4. Required operator authorizations

These actions must always remain human-authorized and outside the skill's autonomous execution:

- CMS mutation.
- CMS content package import.
- Article publish.
- Article make-indexable action.
- Sitemap submission.
- GSC submission or URL inspection API calls.
- Baidu push/submission.
- IndexNow submission.
- 360/Sogou/Shenma submission.
- ISR/content release revalidation.
- Collector enabling.
- Scheduler enabling.
- Production migration execution.
- Production DB writes.
- Metabase exposure, sharing, embedding, datasource, or permission changes.
- Ops Portal permission changes.
- Security group, DNS, CDN, Nginx, or OpenResty changes.

## 5. Next task recommendation

Recommended next task after operator approval:

`SEO-OPS-SKILL-BUILD-00`

The build task should create only the planned skill files and templates. It should not run live SEO operations, import CMS content, publish, submit search URLs, enable collectors, change Metabase, or trigger revalidation.
