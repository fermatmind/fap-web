# API Edge Gateway Hardening and Local Runtime Quarantine Plan

Version: `api_edge_gateway_hardening_quarantine_plan.v1`
Scope: `BACKEND-RUNTIME-02A`
Status: `planning_contract`

## Purpose

This document is the operational hardening and quarantine plan after `BACKEND-RUNTIME-01C`.

It turns the accepted API edge gateway/backend authority contract into a future execution plan. It does not implement, migrate, deploy, restart, reconfigure, delete, fix, or approve any production runtime change.

This plan defines:

- how Node2 may safely remain as `api.fermatmind.com` edge gateway
- what must be backed up, observed, and smoke-tested before future changes
- how Node2 local Laravel, local DB, and local queue are quarantined as non-authority
- which runtime paths are authoritative
- which runtime paths must be ignored by SEO Collector, CMS, Metabase, and production automation
- which gates must pass before `SEO-DASH-00` can start

## Current Accepted Topology

| Runtime | Accepted role | Status |
| --- | --- | --- |
| `fap-node1` / `fap-app-01` | Production `fap-web` frontend runtime | `observed`, `ready` |
| `fap-node2` / `fap-app-02` | `api.fermatmind.com` API edge gateway / OpenResty proxy node | `observed`, `edge_gateway_only` |
| `fap-api-prod` / Node3 | Backend/CMS/commerce authority candidate | `observed`, `canonical_backend_authority_candidate` |
| Node2 local Laravel | Legacy / non-authority runtime | `observed`, `quarantined`, `non_authority` |
| `assets.fermatmind.com` | Public media chain | `DNSPod -> Alibaba CDN -> Alibaba OSS` |

Accepted source-of-truth rules:

- `fap-web` is the production frontend source-of-truth.
- `fap-api` is backend/CMS/commerce authority core.
- `/Users/rainie/Desktop/GitHub/fap-api/fap-web` is stale/skeleton and must not be treated as production frontend runtime.
- CMS is content authority, not SEO BI.
- SEO 中台 observes, attributes, detects drift, and creates issue queues. It does not publish content or generate pSEO.

## Edge Gateway Responsibility

Node2 may own only:

- public edge ingress for `api.fermatmind.com`
- OpenResty proxy layer
- TLS/proxy config as applicable
- request forwarding to Node3 backend authority

Node2 must not own:

- backend truth
- CMS truth
- queue/scheduler truth
- report/email/commerce job truth
- SEO Collector source truth
- Metabase data source truth
- sitemap/llms source truth
- attribution source truth

If Node2 remains in the public API path, its production description must be: edge gateway / OpenResty proxy. It must not be described as canonical backend, CMS backend, commerce backend, queue worker host, or SEO data source.

## Local Runtime Quarantine

`BACKEND-RUNTIME-00A` and `BACKEND-RUNTIME-01C` established:

| Node2 local asset | Evidence | Quarantine decision |
| --- | --- | --- |
| Local Laravel | Route count `194`; Node3 reference route count `312` | non-authority |
| Local queue | `fap-api-queue FATAL` | non-authority / unhealthy |
| Local Redis env | Redis env key not observed | not trusted |
| Scheduler | not observed | not trusted |
| Deploy marker | not found in current scan | provenance incomplete |
| `php84` runtime | local PHP/Laravel container | non-authority runtime |
| `fap-mysql` | local MySQL container | non-authority data store |

Node2 local Laravel must be ignored by production automation unless a future explicit decision reactivates it. Reactivation requires a new plan, route parity proof, DB/Redis proof, queue/scheduler proof, deploy provenance, rollback plan, and approval.

## Authoritative Runtime Paths

Treat these as authoritative or candidate-authoritative:

- Public frontend renderer: `fap-node1` / `/opt/apps/fap-web`
- Backend/CMS/commerce authority candidate: `fap-api-prod` / Node3 / `/var/www/fap-api/current/backend`
- Public API edge ingress: Node2 OpenResty for `api.fermatmind.com`
- Public media chain: `assets.fermatmind.com` via `DNSPod -> Alibaba CDN -> Alibaba OSS`

Treat these as ignored/non-authority for production truth:

- Node2 `/www/wwwroot/fap-api/backend`
- Node2 local Laravel route list
- Node2 local `php84` application runtime
- Node2 local `fap-mysql`
- Node2 local queue
- Node2 local scheduler state
- Node2 local DB contents

## Required Gateway Hardening Gates

Before any future change to Node2, Node3, OpenResty, DNS, proxy paths, payment ingress, or collector source, complete:

- OpenResty config backup.
- `/api` proxy target verification.
- Healthcheck endpoint inventory and smoke.
- Route smoke through `api.fermatmind.com`.
- CORS/header/rate-limit smoke.
- Auth/session smoke.
- `report-access` and `email-bind` smoke.
- Checkout/order read-only smoke.
- Payment webhook ingress mapping verification without triggering live payment.
- Rollback plan.
- Log location and ownership.
- Config ownership and change approval.

These gates are evidence requirements. They are not approval to change production.

## Required Quarantine Gates

Before SEO 中台, Metabase, CMS issue queue, or production automation consumes backend data, enforce:

- Node2 local Laravel non-authority label.
- Node2 local DB non-authority label.
- Node2 local queue non-authority label.
- Node2 local `fap-mysql` non-authority label.
- Node2 local `php84` runtime non-authority label.
- No collector reads from Node2 local Laravel.
- No Metabase reads from Node2 local DB.
- No CMS admin assumes Node2 local data is source of truth.
- No production automation uses Node2 local queue or scheduler.
- No report/email/commerce worker ownership is assigned to Node2 local runtime.

## SEO 中台 Implications

`SEO-DASH` production implementation cannot start until:

- Node2 gateway contract is operationally accepted.
- Node3 backend authority source is accepted.
- Collector input source is locked.
- `seo_intel` target is decided.
- Metabase read-only policy is accepted.

Allowed before those gates:

- documentation
- read-only scans
- schema discussion
- PII/consent boundary drafting

Blocked before those gates:

- production collector deployment
- `seo_intel` production migration
- Metabase production deployment
- GSC/Baidu production collectors
- crawler jobs against production
- CMS issue queue writes
- funnel attribution mirrors

## Future Options

### Option A: Keep Node2 Gateway and Quarantine Local Runtime

Keep Node2 as `api.fermatmind.com` edge gateway, harden OpenResty ownership, and quarantine local Laravel/DB/queue as non-authority.

This is the recommended current path because it matches the observed `/api/` proxy pattern while keeping Node3 as backend authority candidate.

### Option B: Migrate `api.fermatmind.com` Directly to Node3

Remove Node2 from the public API path and make Node3 / `fap-api-prod` directly serve `api.fermatmind.com`.

This may be simpler long-term, but it requires DNS/proxy staging, webhook ingress confirmation, route smoke, auth/session/CORS parity, and rollback planning.

### Option C: Standardize Node2 into True Backend Runtime

Reactivate and standardize Node2 local Laravel as a real backend runtime.

This is not recommended unless there is a strong business reason. It requires route parity from `194` to the canonical route set, DB/Redis alignment, healthy queue workers, scheduler ownership, deploy provenance, and a formal backend authority decision.

## Recommended Next Task

Recommended next task:

```text
BACKEND-RUNTIME-02B | API Gateway Smoke and Rollback Runbook
```

Do not start `SEO-DASH-00` yet unless the gateway/backend authority boundary is accepted.

## Forbidden Actions

The following actions are forbidden in this PR and remain blocked until explicitly authorized by a future implementation task:

- changing DNS
- restarting OpenResty
- fixing queue
- deleting local Laravel
- modifying Node2
- modifying Node3
- deploying SEO Collector
- creating `seo_intel` DB
- deploying Metabase
- letting SEO Collector read Node2 local Laravel
- letting Metabase query Node2 local DB
- starting pSEO from this state
- starting Career Decision expansion from this state
- overclaiming RIASEC, Big Five, or Career Decision as a complete recommender runtime

## Repository Rule Impact

This PR is docs/generated/test contract work only. It does not change runtime behavior, public routes, sitemap/llms enumeration, analytics tracking, payment/report/email/recommendation/scoring behavior, backend code, frontend code, cloud resources, DNS, CDN, COS/OSS, database, env, OpenResty, Node2, Node3, or deployment scripts.
