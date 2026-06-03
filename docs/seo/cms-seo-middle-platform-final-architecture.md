# CMS and SEO Middle Platform Final Architecture Charter

Version: `cms_seo_middle_platform_final_architecture.v1`
Scope: `ARCH-SEO-CMS-02`
Status: `reconciled_by_BACKEND-RUNTIME-02D`

## Purpose

This document is the final architecture charter after `ARCH-SEO-CMS-00` and `ARCH-SEO-CMS-01`.

It converts the repository, cloud, server, and runtime scans into a decision-ready architecture plan for the CMS middle platform and SEO 中台. It is not a migration plan, not an implementation PR, and not approval to change DNS, deploy services, create databases, start crawlers, or modify runtime behavior.

This charter locks:

- current runtime truth
- the dual backend runtime conflict
- the post-`BACKEND-RUNTIME-02D` backend authority closure
- backend convergence options
- the recommended backend authority direction
- target 4-server topology
- CMS and SEO 中台 ownership boundaries
- media/CDN and PII guardrails
- what must not start yet
- the first implementation train after this charter

## Current Runtime Truth

| Runtime | Current role | Status | Evidence |
| --- | --- | --- | --- |
| `fap-node1` / `fap-app-01` | Production frontend Server 1 | `observed`, `ready` | `/opt/apps/fap-web`, PM2 `fap-web` 4 cluster instances online, Node 24.14.0, 1Panel OpenResty container, deployed SHA prefix `fa06f4a`, worktree clean |
| `fap-node2` / `fap-app-02` | `api.fermatmind.com` public API legacy runtime | `observed`, `conflict`, `architecture_debt` | Docker / 1Panel / `php84`, backend path `/www/wwwroot/fap-api/backend`, no `.git`, `.deploy_commit` prefix `d12e427`, local MySQL style, Redis env not configured, supervisor `fap-api-queue` is `FATAL` |
| `fap-api-prod` / `ops.fermatmind.com` | Standard CMS / authority backend / ops backend | `observed`, `partial` | `/var/www/fap-api/current/backend`, standard Laravel release path, deployed SHA prefix `c254ef4`, nginx + PHP 8.4 FPM + cron + supervisor, `schedule:run` every minute, 4 queue workers `RUNNING`, DB/Redis external private hosts |
| `staging` | Mixed frontend/backend staging | `observed`, `partial` | `/var/www/fap-api-staging/current/backend`, `/var/www/fap-web-staging/current`, local loopback staging DB, staging web worktree has `public/sitemap.xml` modification |

Current cloud/media truth:

- DNSPod manages `fermatmind.com`.
- Tencent Cloud has 4 Lighthouse servers, not CVM.
- Tencent assets include `rds-fap-prod`, `redis-fap-prod`, and `vpc-fap-prod`.
- Alibaba assets include OSS bucket `ferm-mind-site`, CDN domain `assets.fermatmind.com`, and TLS certificate for `assets.fermatmind.com`.
- Current media chain is `DNSPod -> Alibaba CDN -> Alibaba OSS`.
- Tencent COS is not confirmed usable and must not be treated as active media authority.

## Historical Critical Architecture Debt

At the time of `ARCH-SEO-CMS-02`, production architecture had dual backend runtime drift:

```text
api.fermatmind.com
  -> fap-node2
  -> legacy Docker / 1Panel / php84 API runtime
  -> local MySQL style
  -> Redis env missing
  -> fap-api-queue FATAL

ops.fermatmind.com
  -> fap-api-prod
  -> standard Laravel release runtime
  -> external private DB/Redis
  -> scheduler online
  -> 4 queue workers RUNNING
```

This blocked SEO 中台 production rollout because collectors, attribution, issue queues, URL truth, sitemap/llms observation, CMS metadata checks, and funnel mirrors needed a single backend authority or an explicitly documented split authority.

Specific blockers:

- `api.fermatmind.com` points to legacy Docker runtime.
- `fap-api-prod` appears to be the standard backend/CMS authority.
- `fap-node2` queue is `FATAL`.
- `fap-node2` and `fap-api-prod` have different deployed SHA markers.
- `fap-node2` uses local MySQL style while `fap-api-prod` points to external private DB/Redis.
- Redis is missing in `fap-node2` env but present in `fap-api-prod` runtime classification.
- Public API and CMS/ops backend may not have the same data, queue, scheduler, cache, or release contract.

This historical blocker was resolved for public API authority by `BACKEND-RUNTIME-02D`.

## BACKEND-RUNTIME-02D Authority Closure

`BACKEND-RUNTIME-02D` supersedes the unresolved authority status in this charter for public API and SEO-DASH design gating.

Accepted closure:

- `api.fermatmind.com` is an API edge gateway on Node2 OpenResty.
- Node2 OpenResty has `server_name api.fermatmind.com`.
- Node2 OpenResty has `location ^~ /api/`.
- Node2 OpenResty proxies `/api/` to Node3 / `fap-api-prod` at `http://122.152.221.126`.
- Node3 / `fap-api-prod` is accepted as the backend/CMS/commerce authority source for public API reads.
- Node2 local Laravel, local DB, queue, and `php84` remain non-authority and quarantined.
- SEO Collector and Metabase must not read Node2 local Laravel or local DB as authority.

This closure does not mean Node2 can be shut down, DNS can be changed, OpenResty can be edited, collectors can be deployed, `seo_intel` can be created in production, or Metabase can be deployed. Those remain separate explicitly approved tasks.

## Target Architecture Doctrine

The target doctrine is:

- `fap-web` is the public frontend runtime.
- There is one backend/CMS/commerce authority runtime.
- Managed business DB/Redis are the business data/cache layer.
- `seo_intel` is logically isolated from business/CMS tables.
- Server 4 is the SEO Intelligence Node.
- Metabase is read-only against `seo_intel`.
- SEO Collector runs as a separate process/container.
- CMS is content authority, not SEO BI.
- SEO 中台 observes, attributes, detects drift, and creates issue queue summaries. It does not publish content.

Target 4-server topology:

| Target server | Target role | Current state |
| --- | --- | --- |
| Server 1 | `fap-web` public frontend runtime | `observed`, `ready` on `fap-node1` |
| Server 2 | Single backend/CMS/commerce authority runtime | `accepted` for public API authority via Node2 edge gateway to Node3 / `fap-api-prod`; Node2 local runtime remains quarantined |
| Server 3 | Data layer with business DB/Redis and logically isolated `seo_intel` DB | `partial`; managed MySQL/Redis observed, `seo_intel` missing |
| Server 4 | SEO Intelligence Node | `missing`; not deployed |

## Backend Convergence Options

### Option A: Migrate `api.fermatmind.com` to `fap-api-prod`

Recommended target unless blocked by live API compatibility.

Pros:

- Aligns public API with standard Laravel release/runtime.
- Uses the runtime where CMS/ops, scheduler, and queue workers are already healthy.
- Reduces dual-SHA and dual-database ambiguity.
- Makes SEO Collector input source easier to define.
- Simplifies future `seo_intel` attribution and CMS issue queue contracts.

Cons:

- Requires careful public API parity validation.
- May expose route, auth, CORS, webhook, or cache behavior differences.
- Requires a rollback plan before DNS/proxy change.

Risks:

- Public API clients may depend on legacy `fap-node2` behavior.
- Payment webhooks or report/email gates may be routed differently.
- Session/auth/cookie behavior may differ between hosts.

Required validation:

- route parity
- auth/session parity
- payment webhook parity
- report/email gate parity
- CORS/origin parity
- rate-limit parity
- healthcheck parity
- queue/scheduler parity
- rollback plan
- DNS/proxy plan
- staged smoke

SEO 中台 impact:

- Best long-term option for production rollout.
- Allows collectors to observe a single canonical backend authority after gates pass.

### Option B: Keep `fap-node2` as Public API but Standardize It

Pros:

- Avoids immediate DNS/API migration.
- Keeps current public API entry point stable while cleaning runtime drift.
- Can be staged incrementally.

Cons:

- Requires substantial standardization work on `fap-node2`.
- Still maintains two backend nodes unless a clear gateway/authority contract is written.
- Requires queue, Redis, release provenance, DB, and deployment contract cleanup.

Required standardization:

- Git/release provenance.
- External DB/Redis alignment.
- Healthy queue workers.
- Same deploy contract as backend authority.
- Explicit gateway role.
- Runbook parity with `fap-api-prod`.

Risks:

- Legacy runtime may continue drifting.
- Local MySQL may diverge from managed business DB.
- Queue failure may hide user-facing async defects.

Required validation:

- API route parity with `fap-api-prod`.
- DB identity and migration state parity.
- Redis/cache parity.
- Queue health parity.
- Release SHA/provenance parity.
- Supervisor/runtime health gates.

SEO 中台 impact:

- Acceptable only if `fap-node2` is documented as a standardized gateway or public API runtime with the same truth DB and contract version.
- Not acceptable while queue is `FATAL` and DB/Redis topology differs.

### Option C: Keep Split Public API and Ops Backend Intentionally

Pros:

- Allows dedicated public API and ops/CMS backend responsibilities.
- Can support a gateway pattern if explicitly designed.
- Avoids forced convergence if product needs split traffic patterns.

Cons:

- Requires a formal gateway/backend boundary.
- Requires a shared truth DB or explicit data sync contract.
- Requires one API contract version and explicit ownership docs.
- Increases operational complexity.

Required validation:

- Gateway/backend boundary definition.
- Same truth DB or documented sync semantics.
- Same contract version and compatibility matrix.
- Queue/scheduler ownership.
- Content release and revalidation ownership.
- Public API vs ops/CMS route ownership.
- Rollback and incident runbooks.

Risks:

- SEO 中台 may observe one truth while CMS edits another.
- Attribution may join against the wrong backend.
- Issue queue summaries may point to stale CMS/runtime data.

SEO 中台 impact:

- Possible but more complex.
- Collector inputs must explicitly name public runtime source, CMS truth source, and authoritative join keys.

## Recommended Decision

Original recommendation: choose Option A as the target direction, unless read-only parity reports show live API compatibility blockers.

Post-`BACKEND-RUNTIME-02D` accepted decision: keep `api.fermatmind.com` as a Node2 OpenResty API edge gateway for now, with `/api/` proxied to Node3 / `fap-api-prod` as the backend/CMS/commerce authority source. Node2 local Laravel, local DB, and queue are not authority.

This reconciliation does not implement any runtime change. Direct DNS/proxy migration, Node2 retirement, OpenResty edits, or backend deploys remain out of scope.

Pre-migration gates before any DNS/proxy/API migration:

1. Route parity.
2. Auth/session parity.
3. Payment webhook parity.
4. Report/email gate parity.
5. CORS/origin parity.
6. Rate-limit parity.
7. Healthcheck parity.
8. Queue/scheduler parity.
9. Rollback plan.
10. DNS/proxy plan.
11. Staged smoke.

If any gate fails, do not migrate DNS or proxy. Record the blocker and either remediate under backend runtime scope or choose Option B/C explicitly.

## SEO 中台 Gating

SEO 中台 production rollout must not start until the remaining gates are closed:

- `seo_intel` DB target is confirmed
- Server 4 target is confirmed
- Metabase isolation policy is confirmed
- Collector input source is decided
- PII/consent boundary is locked

Backend runtime authority for public API reads is accepted by `BACKEND-RUNTIME-02D`; production collectors, migrations, and Metabase deployment still require separate approval.

Allowed after authority closure but before production rollout:

- docs and contracts
- schema design without production migration
- PII/consent boundary design
- collector interface design without deployment

Still blocked before explicit implementation approval:

- production `seo_intel` migration
- production collector deployment
- Metabase production deployment
- crawlers against production runtime
- GSC/Baidu production collectors
- CMS issue queue production writes

## CMS 中台 Final Boundary

CMS owns:

- content truth
- publish state
- revisions
- SEO metadata truth
- content release/revalidate governance
- reviewed editorial changes

CMS does not own:

- SEO BI
- scoring truth
- report runtime truth
- payment/order truth
- profile memory
- recommender state

CMS may consume `seo_issue_queue` summaries. CMS cannot directly publish SEO-generated suggestions without editorial/review gates.

## SEO 中台 Final Boundary

SEO 中台 observes:

- public runtime output
- backend/CMS truth
- sitemap/llms output
- ranking/search console signals
- performance drift
- attribution/funnel aggregates

SEO 中台 writes:

- `seo_intel` only
- drift records
- attribution aggregates
- issue queue summaries

SEO 中台 cannot:

- publish content
- generate pSEO
- mutate CMS/business tables
- run heavy workers on `fap-web` Node1
- run heavy SEO workers inside `fap-api` web request process
- let Metabase query CMS/business tables directly

## Media / CDN Boundary

Current media chain:

```text
DNSPod
  -> assets.fermatmind.com
  -> Alibaba CDN
  -> Alibaba OSS ferm-mind-site
```

Tencent COS is not active media authority unless later confirmed by cloud inventory and runtime evidence.

Before media migration or SEO image pipeline changes, write:

- media ownership runbook
- CDN origin rules
- TLS renewal owner/process
- OSS/COS bucket policy summary
- upload path contract
- rollback plan

## Data / PII Boundary

- Email is forbidden in SEO analytics details.
- `order_no` must be masked or aggregated for normal dashboards.
- Payment IDs are forbidden in normal SEO/ops dashboards.
- Metabase is read-only.
- `seo_intel` stores aggregate or sanitized data.
- GA4, Google Ads, Baidu, and other external analytics systems must not receive PII.
- Raw attempt answers must not be stored in `seo_intel`.

## What Must Not Start Yet

Do not start:

- `seo_intel` migration
- Metabase production deployment
- crawler deployment
- GSC/Baidu collectors
- DNS/API migration
- `fap-node2` shutdown
- pSEO
- Career Decision runtime expansion
- RIASEC/Big Five recommender claims
- heavy SEO workers on `fap-web` Node1
- heavy SEO workers inside `fap-api` web request process

## First Implementation Train After Charter

Reconciled sequence:

1. `BACKEND-RUNTIME-01C`: API edge gateway and backend authority contract completed.
2. `BACKEND-RUNTIME-02A`: API edge gateway hardening and local runtime quarantine plan completed.
3. `BACKEND-RUNTIME-02B`: API gateway smoke and rollback runbook completed.
4. `BACKEND-RUNTIME-02C`: public API authority acceptance gate completed with partial status.
5. `BACKEND-RUNTIME-02D`: gateway evidence completion accepted public API authority.
6. `SEO-DASH-00B`: Search Intelligence data contract completed.
7. `SEO-DASH-01+`: physical `seo_intel`, collector, Metabase, and CMS issue summary implementation require separate scoped approvals and must not be pulled into this reconciliation.

## No Runtime Change Statement

This PR changes only docs, a generated architecture artifact, a contract test, and PR train metadata. It does not change frontend runtime, backend runtime, sitemap/llms behavior, analytics tracking, payment/report/email/recommendation/scoring behavior, env files, deployment scripts, DNS, CDN, COS/OSS, cloud resources, or production services.
