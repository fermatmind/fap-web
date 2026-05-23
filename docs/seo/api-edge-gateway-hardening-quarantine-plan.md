# API Edge Gateway Hardening and Local Runtime Quarantine Plan

Version: `api_edge_gateway_hardening_quarantine_plan.v1`
Scope: `BACKEND-RUNTIME-02A`
Status: `planning_contract`

## Purpose

This document is the operational hardening and quarantine plan after `BACKEND-RUNTIME-01C`.

It turns the accepted API edge gateway/backend authority contract into a future execution plan. It does not implement, migrate, deploy, restart, reconfigure, delete, fix, or approve any production runtime change.

This plan defines:

- how API edge gateway may safely remain as `api.fermatmind.com` edge gateway
- what must be backed up, observed, and smoke-tested before future changes
- how API edge gateway local Laravel, local DB, and local queue are quarantined as non-authority
- which runtime paths are authoritative
- which runtime paths must be ignored by SEO Collector, CMS, Metabase, and production automation
- which gates must pass before `SEO-DASH-00` can start

## Current Accepted Topology

| Runtime | Accepted role | Status |
| --- | --- | --- |
| `frontend-runtime` | Production `fap-web` frontend runtime | `observed`, `ready` |
| `api-edge-gateway` | `api.fermatmind.com` API edge gateway / OpenResty proxy node | `observed`, `edge_gateway_only` |
| `canonical-backend-authority` | Backend/CMS/commerce authority candidate | `observed`, `canonical_backend_authority_candidate` |
| API edge gateway local Laravel | Legacy / non-authority runtime | `observed`, `quarantined`, `non_authority` |
| `assets.fermatmind.com` | Public media chain | `DNSPod -> Alibaba CDN -> Alibaba OSS` |

Accepted source-of-truth rules:

- `fap-web` is the production frontend source-of-truth.
- `fap-api` is backend/CMS/commerce authority core.
- `REDACTED_LOCAL_BACKEND_REPO_PATH` is stale/skeleton and must not be treated as production frontend runtime.
- CMS is content authority, not SEO BI.
- SEO 中台 observes, attributes, detects drift, and creates issue queues. It does not publish content or generate pSEO.

## Edge Gateway Responsibility

API edge gateway may own only:

- public edge ingress for `api.fermatmind.com`
- OpenResty proxy layer
- TLS/proxy config as applicable
- request forwarding to canonical backend authority

API edge gateway must not own:

- backend truth
- CMS truth
- queue/scheduler truth
- report/email/commerce job truth
- SEO Collector source truth
- Metabase data source truth
- sitemap/llms source truth
- attribution source truth

If API edge gateway remains in the public API path, its production description must be: edge gateway / OpenResty proxy. It must not be described as canonical backend, CMS backend, commerce backend, queue worker host, or SEO data source.

## Local Runtime Quarantine

`BACKEND-RUNTIME-00A` and `BACKEND-RUNTIME-01C` established:

| API edge gateway local asset | Evidence | Quarantine decision |
| --- | --- | --- |
| Local Laravel | Route count `194`; canonical backend reference route count `312` | non-authority |
| Local queue | `local-queue FATAL` | non-authority / unhealthy |
| Local Redis env | Redis env key not observed | not trusted |
| Scheduler | not observed | not trusted |
| Deploy marker | not found in current scan | provenance incomplete |
| `local-php-runtime` runtime | local PHP/Laravel container | non-authority runtime |
| `local-db-container` | local MySQL container | non-authority data store |

API edge gateway local Laravel must be ignored by production automation unless a future explicit decision reactivates it. Reactivation requires a new plan, route parity proof, DB/Redis proof, queue/scheduler proof, deploy provenance, rollback plan, and approval.

## Authoritative Runtime Paths

Treat these as authoritative or candidate-authoritative:

- Public frontend renderer: `frontend-runtime` / `REDACTED_FRONTEND_RUNTIME_PATH`
- Backend/CMS/commerce authority candidate: `canonical-backend-authority` / `REDACTED_BACKEND_RELEASE_PATH`
- Public API edge ingress: API edge gateway OpenResty for `api.fermatmind.com`
- Public media chain: `assets.fermatmind.com` via `DNSPod -> Alibaba CDN -> Alibaba OSS`

Treat these as ignored/non-authority for production truth:

- API edge gateway `REDACTED_LEGACY_BACKEND_PATH`
- API edge gateway local Laravel route list
- API edge gateway local `local-php-runtime` application runtime
- API edge gateway local `local-db-container`
- API edge gateway local queue
- API edge gateway local scheduler state
- API edge gateway local DB contents

## Required Gateway Hardening Gates

Before any future change to API edge gateway, canonical backend, OpenResty, DNS, proxy paths, payment ingress, or collector source, complete:

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

- API edge gateway local Laravel non-authority label.
- API edge gateway local DB non-authority label.
- API edge gateway local queue non-authority label.
- API edge gateway local `local-db-container` non-authority label.
- API edge gateway local `local-php-runtime` runtime non-authority label.
- No collector reads from API edge gateway local Laravel.
- No Metabase reads from API edge gateway local DB.
- No CMS admin assumes API edge gateway local data is source of truth.
- No production automation uses API edge gateway local queue or scheduler.
- No report/email/commerce worker ownership is assigned to API edge gateway local runtime.

## SEO 中台 Implications

`SEO-DASH` production implementation cannot start until:

- API edge gateway contract is operationally accepted.
- canonical backend authority source is accepted.
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

### Option A: Keep API edge gateway Gateway and Quarantine Local Runtime

Keep API edge gateway as `api.fermatmind.com` edge gateway, harden OpenResty ownership, and quarantine local Laravel/DB/queue as non-authority.

This is the recommended current path because it matches the observed `/api/` proxy pattern while keeping canonical backend as backend authority candidate.

### Option B: Migrate `api.fermatmind.com` Directly to canonical backend

Remove API edge gateway from the public API path and make `canonical-backend-authority` directly serve `api.fermatmind.com`.

This may be simpler long-term, but it requires DNS/proxy staging, webhook ingress confirmation, route smoke, auth/session/CORS parity, and rollback planning.

### Option C: Standardize API edge gateway into True Backend Runtime

Reactivate and standardize API edge gateway local Laravel as a real backend runtime.

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
- modifying API edge gateway
- modifying canonical backend
- deploying SEO Collector
- creating `seo_intel` DB
- deploying Metabase
- letting SEO Collector read API edge gateway local Laravel
- letting Metabase query API edge gateway local DB
- starting pSEO from this state
- starting Career Decision expansion from this state
- overclaiming RIASEC, Big Five, or Career Decision as a complete recommender runtime

## Repository Rule Impact

This PR is docs/generated/test contract work only. It does not change runtime behavior, public routes, sitemap/llms enumeration, analytics tracking, payment/report/email/recommendation/scoring behavior, backend code, frontend code, cloud resources, DNS, CDN, COS/OSS, database, env, OpenResty, API edge gateway, canonical backend, or deployment scripts.
