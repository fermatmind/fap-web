# SEO Ops Skill Gap Map

## 1. Do not duplicate

- URL Truth storage in `seo_urls` and `seo_url_entities`.
- Issue Queue storage in `seo_issue_queue`.
- Search Channel Queue schema, planner, writer, and live executor.
- Search Channel submission actions.
- CMS article import, mutation, or controlled publish.
- Article SEO metadata persistence.
- Metabase dashboard storage or public sharing.
- Collector manager, collector scheduler, or production migration execution.
- Claim linter enforcement inside backend publishing/search gates.
- fap-web runtime sitemap/llms/robots/revalidation implementation.
- Ops Portal permissions or access bridge.

## 2. Skill should assist

- Daily GSC/Search Console review from operator-provided exports or Metabase screenshots.
- Daily SEO middle-office audit summary covering URL Truth, Issue Queue, Search Channel Queue, and crawler/readiness safety.
- Weekly article review covering impressions/clicks if provided, article CTA funnel, CMS freshness, claim risk, and issue queue status.
- CMS content package QA before backend import.
- Controlled Publish preflight evidence checklist.
- Search Channel Queue read-only review, including eligibility blockers and approval readiness.
- Post-publish smoke planning for article HTML, metadata, FAQ, CTA, canonical, hreflang, sitemap, llms, and private URL exclusion.
- 7/14-day canary observation report using GSC/Baidu/IndexNow/operator-provided evidence.
- URL Truth and drift review using `seo_intel` exports and fap-web source/runtime evidence.
- Claim Gate and Private URL Guard audit reports.

## 3. Missing or weak areas

- Daily report template is not present as a reusable Codex skill asset.
- Weekly article review template is not present as a reusable Codex skill asset.
- Article funnel join is only partially evidenced; CTA tracking exists, but dashboard/card coverage was not verified.
- Dynamic CTA QA needs a checklist because CTA source can come from article answer surface/related test edges.
- Hreflang/canonical review exists in runtime, but needs smoke workflow against rendered pages and metadata.
- Cache/revalidation smoke needs an authorization-gated checklist; route exists but must not be triggered by the skill.
- Metabase weekly article/canary cards may be incomplete; URL Truth/Issue Queue MVP is stronger than growth review coverage.
- GSC live collector is readiness/foundation, not confirmed live collector.
- Baidu live collector/push is readiness/foundation, not confirmed live collector.
- IndexNow live executor exists but is heavily gated; accepted canary record is operator-provided/documented, not live-verified in this scan.
- seo_intel lacks normalized tables for contract/html snapshots, sitemap entries, llms entries, parity issues, rank snapshots, GA4 landing daily, content decay alerts, and competitor rank snapshots.
- Automated tests for claim/private URL guards were not scanned.

## 4. Risk map

| Risk | Severity | Current owner | Skill role | Human approval required |
|---|---|---|---|---|
| Skill accidentally triggers CMS publish or import | High | fap-api CMS | Explicit no-go gates and checklist-only workflow | Yes |
| Skill triggers search submission | High | fap-api Search Channel Queue | Read-only queue audit; approval phrase review only | Yes |
| Metabase exposure via iframe/reverse proxy/public link | Critical | Ops/infra/Metabase | Audit against runbook; never expose | Yes |
| Treating GSC/Baidu readiness as live collector | High | seo_intel | Label readiness vs live data clearly | Yes for live enablement |
| Reading Node2 local Laravel/DB | Critical | seo_intel authority rules | Enforce not-authority rule in every workflow | N/A, forbidden |
| Private URL in sitemap/llms/search queue | High | fap-web + seo_intel queue gates | Smoke/audit exclusions | Yes for remediation |
| Claim-unsafe article gets indexed/submitted | High | CMS publish gate + Search Channel evaluator | Claim QA report and no-go summary | Yes for override/ack |
| Authority drift between CMS/backend/fap-web fallback | Medium | fap-api + fap-web | Source/runtime parity report | Yes for content mutation |
| Stale sitemap/llms after publish | Medium | fap-web revalidation route + operator | Prepare revalidation smoke plan only | Yes |
| Missing weekly growth cards | Medium | Metabase/SEO Ops | Recommend card backlog | No for report; yes for dashboard changes |
| Production row counts stale | Medium | seo_intel/Metabase | Mark Access required | Yes for production access |
