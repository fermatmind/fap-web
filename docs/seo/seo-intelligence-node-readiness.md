# SEO Intelligence Node Readiness and Ownership Contract

Version: `seo_intelligence_asset_map.v1`
Scope: `ARCH-SEO-CMS-01`
Status: `partial`

## Purpose

SEO 中台 is an independent observation, attribution, drift detection, and issue queue system. It watches public runtime output, CMS/backend truth, search console signals, crawler output, performance drift, funnel attribution, and external search signals.

CMS 中台 is the content authority and publish governance system. It owns editorial/content truth, SEO metadata truth, publication state, revisions, release gates, and revalidation coordination.

SEO 中台 must not become a CMS plugin, content generator, pSEO generator, or publishing authority. CMS 中台 must not become full SEO BI. The two systems may exchange issue summaries, but they must keep ownership and write boundaries separate.

## Source-of-Truth Boundaries

| Surface | Owner | Status | Contract |
| --- | --- | --- | --- |
| Production frontend source | `fap-web` | `observed` | Public runtime renderer and deterministic consumer of backend/CMS truth. |
| Backend/CMS/commerce authority | `fap-api` | `observed` | Owns CMS, commerce, report, email, sitemap/public content source contracts, and business APIs. |
| Nested `fap-api/fap-web` | none | `dangerous_if_assumed` | Stale/skeleton copy. Must not be treated as production frontend runtime. |
| CMS/backend content truth | `fap-api` CMS/backend | `observed` | Owns content, SEO metadata, publication state, and content release truth. |
| Public rendering | `fap-web` | `observed` | Renders truth deterministically. Must not invent CMS-backed SEO/content truth. |
| SEO 中台 | independent SEO Intelligence Node | `missing` | Observes and reports. It may write only to `seo_intel`, not to CMS/content/runtime tables. |

RIASEC, Big Five, and Career Decision surfaces must not be described as complete recommender runtime unless a backend-authoritative recommender contract exists and is observed.

## Current Runtime Topology

| Runtime | Role | Evidence | Status |
| --- | --- | --- | --- |
| `fap-node1` / `fap-app-01` | Production frontend Server 1 | `/opt/apps/fap-web`, PM2 `fap-web` 4 cluster instances online, Node 24.14.0, listens `80/443/3000`, 1Panel OpenResty proxy, deployed SHA prefix `fa06f4a`, worktree clean | `observed`, `ready` |
| `fap-node2` / `fap-app-02` / `api.fermatmind.com` | Public API legacy Docker runtime | Docker / 1Panel / `php84`, local MySQL style, backend path `/www/wwwroot/fap-api/backend`, no `.git`, `.deploy_commit` prefix `d12e427`, `DB_HOST` points to server-local private IP, Redis env not configured, supervisor `fap-api-queue` is `FATAL` | `observed`, `conflict`, `architecture_debt` |
| `fap-api-prod` / `ops.fermatmind.com` | CMS / authority backend / ops backend | `/var/www/fap-api/current/backend`, release path under `/var/www/fap-api/releases`, deployed SHA prefix `c254ef4`, nginx + PHP 8.4 FPM + cron + supervisor, `schedule:run` every minute, 4 queue workers running, DB/Redis point to external private hosts consistent with managed MySQL/Redis | `observed`, `partial` |
| `fap-api-staging` | Mixed staging frontend/backend | `/var/www/fap-api-staging/current/backend`, `/var/www/fap-web-staging/current`, local loopback staging DB, staging web worktree has `public/sitemap.xml` modification | `observed`, `partial` |

### Critical Conflict

Current backend runtime has dual authority drift:

- `api.fermatmind.com` routes to `fap-node2`, a legacy Docker API runtime.
- `ops.fermatmind.com` routes to `fap-api-prod`, the standard Laravel/CMS/queue runtime.

These runtimes differ by deployment shape, SHA marker, database topology, Redis setup, and queue health. This is an `architecture_debt` and `conflict`. It requires a human decision before SEO Collector production rollout.

## Target 4-Server Topology

| Target server | Intended owner | Current status | Required decision |
| --- | --- | --- | --- |
| Server 1 | `fap-web` public runtime | `observed` | Keep `fap-node1` as production frontend unless a future deployment plan replaces it. |
| Server 2 | Single `fap-api` / CMS / commerce authority runtime | `conflict`, `human_confirm_required` | Decide whether to migrate `api.fermatmind.com` to `fap-api-prod`, keep `fap-node2`, or explicitly split public API vs CMS/ops with contracts. |
| Server 3 | Data layer with business DB and logically isolated `seo_intel` DB | `partial` | Current data layer is managed MySQL/Redis plus legacy local MySQL on `fap-node2`; `seo_intel` is `missing`. |
| Server 4 | SEO Intelligence Node | `missing`, `human_confirm_required` | Provision or designate a separate node for collectors, crawlers, Metabase, SerpBear, Crawlee/Playwright, SEOnaut, and GSC/Baidu collectors. |

Do not pretend the target topology is current reality.

## Current Cloud and Media Asset Map

Observed cloud assets:

- Tencent Cloud uses 4 Lighthouse servers, not CVM.
- Tencent production MySQL: `rds-fap-prod`.
- Tencent production Redis: `redis-fap-prod`.
- Tencent VPC: `vpc-fap-prod`.
- Tencent DNSPod manages `fermatmind.com`.
- Alibaba OSS bucket: `ferm-mind-site`.
- Alibaba CDN domain: `assets.fermatmind.com`.
- Alibaba TLS certificate: `assets.fermatmind.com`.

Current media chain:

```text
DNSPod
  -> assets.fermatmind.com CNAME
  -> Alibaba CDN
  -> Alibaba OSS ferm-mind-site
```

Tencent COS is not confirmed usable and must not be treated as active media authority. Current cloud structure is mixed: Tencent DNS/server/DB/Redis plus Alibaba OSS/CDN/TLS.

## Known Repository Assets

Observed from repository/config readiness scan:

- `fap-web` has PM2/Node deployment assets for `/opt/apps/fap-web`.
- `fap-web` owns deterministic public rendering, SEO adapters, sitemap/llms consumers, analytics clients, and frontend runtime contracts.
- `fap-api` deploy/runbook evidence points to Laravel backend/CMS/ops authority, release paths, scheduler, queues, storage, mail, commerce/report, sitemap/public discoverability services, and S3-compatible storage configuration.
- Backend sitemap/public discoverability is treated as backend/CMS truth source where available.
- `fap-web` has SEO scripts and checks including sitemap indexability and mobile SEO gates.
- `fap-web` references `assets.fermatmind.com` as a public asset/media host.
- Repository evidence alone is not enough to prove live cloud assets; cloud/server facts require cloud console or runtime observation.

Current gaps:

- Repo config cannot prove DNS, CDN origin rules, TLS ownership, firewall rules, snapshot policy, collector deployment, or cloud billing status.
- Env keys are configuration intent, not live cloud inventory.
- No observed `seo_intel` migration, database, collector job, or Metabase deployment exists in this PR scope.

## Unknown and Human Confirmation Required

Still unknown:

- Exact DNS/CDN origin rules beyond observed domain-level chain.
- TLS renewal owner and process.
- Security group and firewall summaries.
- Backup policies.
- RDS snapshot and restore policy.
- Redis persistence policy.
- Cloud billing and renewal owners.
- GSC/Baidu API access, ownership, and verification state.
- Metabase, SerpBear, Crawlee, SEOnaut deployment status.
- Whether `fap-node2` should remain public API.
- Whether `fap-api-prod` should become canonical public API backend.
- Whether public API and CMS/ops backends currently share the same business database.

## SEO 中台 Module Readiness Matrix

| Module | Current status | Evidence | First task |
| --- | --- | --- | --- |
| URL Truth Inventory | `partial` | Repo has SEO/url inventory and sitemap authority checks; no observed `seo_intel` DB | Define URL truth schema and collector inputs. |
| Drift Detection | `missing` | No observed drift worker or issue queue | Build collector skeleton after runtime convergence decision. |
| CWV / Performance Drift | `missing` | No observed CWV store or worker | Define metric source and sampling boundary. |
| Tracking Consent Gate | `partial` | Frontend/backend tracking assets exist; no SEO BI boundary | Lock PII/consent rules before attribution storage. |
| Funnel Attribution | `partial` | Commerce/report/email/tracking assets exist; no `seo_intel` attribution model | Define aggregated attribution schema. |
| GSC | `blocked`, `human_confirm_required` | API access not observed | Confirm GSC property/API access. |
| Baidu | `blocked`, `human_confirm_required` | Verification/config traces exist; collector not observed | Confirm Baidu ownership/API/push access. |
| Metabase | `missing` | No deployment observed | Deploy only on Server 4 after `seo_intel` exists. |
| CMS Issue Queue | `missing` | No independent SEO issue queue observed | Define issue summary contract for CMS display. |
| Competitor Radar | `missing` | No tool deployment observed | Keep lite/rate-limited and outside runtime nodes. |
| Email / Retention Metrics | `partial` | Email/report assets exist; SEO-safe retention metrics not modeled | Store aggregated metrics only, no email detail. |
| Paid Ads Validation | `missing` | No staged validation support observed | Define validation staging before production attribution. |

## CMS 中台 Finalization Readiness Matrix

| CMS module | Current status | Boundary |
| --- | --- | --- |
| Articles | `partial` | CMS/backend should own article content, article SEO, publication state, covers, categories, tags, and related placement. |
| Topics | `partial` | CMS/backend should own topic surfaces, SEO fields, FAQ, and sections. |
| Personality | `partial` | CMS/backend should own descriptive content and SEO; scoring truth remains backend runtime. |
| Tests/scales | `partial` | Backend owns test/scoring/report contracts; CMS may govern explanatory content, not scoring truth. |
| Career jobs/guides | `partial` | Backend/CMS/public APIs own content and SEO; frontend must not invent local career content. |
| Landing surfaces | `partial` | CMS `landing_surfaces` / `page_blocks` should own ordering, CTA text, and landing SEO. |
| Media | `partial` | Current public chain is Alibaba OSS/CDN; Tencent COS is not active authority. |
| Revisions/publish state | `partial` | Must remain CMS/backend-owned and connected to release/revalidate. |
| Release/revalidate | `partial` | Needs runtime authority convergence before finalization. |
| Claim gate | `partial` | Claims need backend/CMS linting and frontend deterministic rendering. |
| SEO metadata completeness | `partial` | CMS/backend should own metadata completeness; SEO 中台 can report gaps but not publish fixes. |

## Ownership Contract

- CMS owns content and publish truth.
- `fap-api` owns backend contract truth, CMS authority, commerce, report, email, and public API contracts.
- `fap-web` owns deterministic rendering and frontend interaction/runtime behavior.
- SEO 中台 owns observation, drift detection, attribution, and issue queue.
- Metabase owns read-only dashboards against `seo_intel` only.
- SEO Collector may read CMS/backend truth and public runtime output.
- SEO Collector may write only to `seo_intel`.
- SEO Collector must not publish content, mutate CMS records, change sitemap/llms, change tracking, or alter runtime behavior.
- CMS may show SEO issue summaries but must not run heavy BI, crawlers, or Metabase queries directly.
- Public API and CMS/backend authority must be converged or explicitly documented before SEO Collector production rollout.

## Forbidden Assumptions

- Do not treat target 4-server topology as current truth.
- Do not treat env keys as live cloud assets.
- Do not treat nested `fap-api/fap-web` as production runtime.
- Do not claim RIASEC, Big Five, or Career Decision is a complete career recommender runtime.
- Do not let SEO 中台 publish content or generate pSEO pages.
- Do not let Metabase query CMS/business tables directly.
- Do not store email in SEO analytics detail.
- Do not expose `order_no` to normal ops dashboards; mask or aggregate it.
- Do not run crawlers on `fap-web` Node1.
- Do not run heavy SEO workers inside `fap-api` web request process.
- Do not assume `fap-node2` and `fap-api-prod` are interchangeable backends.
- Do not assume Tencent COS is active media authority.

## First Implementation Path

1. Lock this asset map and ownership contract.
2. Decide backend runtime convergence:
   - Keep `fap-node2` public API?
   - Migrate `api.fermatmind.com` to `fap-api-prod`?
   - Explicitly split public API vs CMS/ops backend with contracts?
3. `ARCH-SEO-CMS-02`: final architecture charter.
4. `SEO-DASH-00`: schema, attribution, PII, and consent boundary.
5. `SEO-DASH-01`: `seo_intel` DB and collector skeleton.
6. `SEO-DASH-02`: URL truth and drift collector.
7. `SEO-DASH-03`: funnel attribution.
8. `SEO-DASH-04`: GSC/Baidu.
9. `SEO-DASH-05`: Metabase.
10. `SEO-DASH-06`: CMS issue queue.

## No Runtime Change Statement

This contract changes only documentation, a generated JSON artifact, train metadata, and a contract test. It does not modify runtime code, backend code, sitemap/llms behavior, analytics tracking, payment/report/email/recommendation/scoring behavior, deployment scripts, env files, migrations, or cloud resources.
