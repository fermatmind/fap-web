# API Edge Gateway and Backend Authority Contract

Version: `api_edge_gateway_backend_authority_contract.v1`
Scope: `BACKEND-RUNTIME-01C`
Status: `decision_contract`

## Purpose

This document is the architecture contract after `BACKEND-RUNTIME-00` and `BACKEND-RUNTIME-00A`.

It records the current `api.fermatmind.com` edge gateway finding and defines the intended ownership split between `api-edge-gateway` and `canonical-backend-authority`. It does not implement, migrate, deploy, restart, reconfigure, or approve any runtime change.

This contract exists to prevent future SEO 中台, CMS, analytics, Metabase, collector, or automation work from accidentally treating `api-edge-gateway` local Laravel as backend authority.

## Current Observed Topology

| Runtime | Current role | Status | Evidence |
| --- | --- | --- | --- |
| `frontend-runtime` | Production `fap-web` frontend | `observed`, `ready` | `REDACTED_FRONTEND_RUNTIME_PATH`, PM2 `fap-web` 4 cluster instances, Node runtime, 1Panel OpenResty |
| `api-edge-gateway` | `api.fermatmind.com` edge / OpenResty / legacy Docker node | `observed`, `conflict`, `architecture_debt` | redacted read-only runtime observation, Docker containers `local-php-runtime`, `local-db-container`, `local-openresty-container` |
| `canonical-backend-authority` | Standard Laravel backend/CMS/ops authority candidate | `observed`, `canonical_backend_authority_candidate` | `REDACTED_BACKEND_RELEASE_PATH`, standard Laravel deploy path, scheduler and queue workers previously observed healthy |
| `staging` | Mixed backend/frontend staging | `observed`, `partial` | `fap-api-staging` and `fap-web-staging` paths observed in prior scan |
| `assets.fermatmind.com` | Public media chain | `observed` | `DNSPod -> Alibaba CDN -> Alibaba OSS` |

Source-of-truth boundaries remain:

- `fap-web` is the production frontend source-of-truth.
- `fap-api` is backend/CMS/commerce authority core.
- `REDACTED_LOCAL_BACKEND_REPO_PATH` is stale/skeleton and must not be treated as production runtime.
- CMS is content authority, not SEO BI.
- SEO 中台 observes, attributes, detects drift, and creates issue queues. It does not publish content or generate pSEO.

## api-edge-gateway Local Runtime Status

`BACKEND-RUNTIME-00A` observed the following on `api-edge-gateway`:

| Item | Status |
| --- | --- |
| Local Laravel path | `REDACTED_LEGACY_BACKEND_PATH` |
| PHP/Laravel container | `local-php-runtime` |
| Local Docker runtime | `local-php-runtime`, `local-db-container`, `local-openresty-container` |
| Local Laravel route count | `194` |
| `canonical-backend-authority` route count reference | `312` |
| Route parity | `conflict`; local API edge gateway route set does not match `canonical-backend-authority` |
| Local queue | `local-queue FATAL` |
| Local Redis env key | `missing` / not observed |
| Scheduler | not observed |
| Deploy marker | not found in current scan |
| Local Laravel authority status | not canonical backend authority |

The local Laravel runtime on `api-edge-gateway` is therefore a legacy / non-authority runtime unless a future explicit architecture decision reactivates and standardizes it.

## API Gateway Finding

`BACKEND-RUNTIME-00A` observed the `api.fermatmind.com` OpenResty configuration on `api-edge-gateway`.

Key finding:

```text
api.fermatmind.com /api/ -> proxy_pass upstream://canonical-backend-authority
```

`REDACTED_UPSTREAM` corresponds to `canonical-backend-authority`.

Therefore, public `/api/` traffic appears to depend on canonical backend authority through API edge gateway as an edge gateway. This explains why public read-only endpoint samples can appear close to `ops.fermatmind.com` while API edge gateway local Laravel route/runtime parity remains unproven and divergent.

## Target Ownership Contract

The current contract is:

- API edge gateway may serve as the `api.fermatmind.com` API edge gateway only.
- `canonical-backend-authority` owns backend/CMS/commerce truth as the canonical backend authority candidate.
- API edge gateway local Laravel must not be consumed by `fap-web`, SEO Collector, CMS, Metabase, or production automation as authority.
- API edge gateway local queue must not be relied on for report, email, commerce, release, revalidation, or async jobs.
- If API edge gateway remains in the API path, its role must be explicit: edge gateway / OpenResty proxy, not backend authority.
- If API edge gateway local Laravel is ever reactivated, it requires a future decision, standardization plan, route parity proof, DB/Redis proof, scheduler/queue proof, and rollback plan.

## SEO 中台 Impact

SEO 中台 must treat this as a blocking boundary issue:

- SEO Collector source should be canonical backend authority, not API edge gateway local Laravel.
- URL Truth Inventory must read from `canonical-backend-authority`-backed authority.
- `sitemap-source` validation must target canonical backend authority, not API edge gateway local Laravel.
- CMS issue queue summaries must join against backend/CMS truth from canonical backend authority.
- Attribution mirror inputs must not depend on API edge gateway local DB or local Laravel.
- Metabase must not query API edge gateway local DB.
- SEO 中台 production rollout remains blocked until the gateway/backend authority boundary is accepted.

## Acceptable Future Paths

### Option A: Keep API edge gateway as Edge Gateway

Keep API edge gateway in front of public API traffic, but harden and document it as an edge gateway while quarantining local Laravel.

Pros:

- Preserves current public API entrypoint.
- Matches the observed `/api/` proxy behavior.
- Avoids immediate DNS cutover.
- Lets canonical backend remain backend authority.

Cons:

- API edge gateway remains in the request path.
- OpenResty config becomes a critical production dependency.
- Local legacy Laravel must be fenced off to prevent accidental use.

Required gates:

- `/api` smoke checks.
- OpenResty config backup.
- Explicit upstream map.
- Auth/session/CORS/rate-limit parity.
- Payment webhook path confirmation.
- Rollback runbook.
- Local Laravel quarantine decision.

Risks:

- Future operators may confuse API edge gateway local Laravel with API authority.
- Proxy drift may hide backend changes.
- Gateway observability and rollback ownership may be unclear.

### Option B: Migrate `api.fermatmind.com` Directly to `canonical-backend-authority`

Remove API edge gateway from the public API path and make `canonical-backend-authority` directly serve `api.fermatmind.com`.

Pros:

- Simplifies topology.
- Eliminates API edge gateway ambiguity.
- Aligns API domain with canonical backend authority.

Cons:

- Requires DNS/proxy migration planning.
- Requires careful public API compatibility validation.
- Requires staged rollback and smoke tests.

Required gates:

- Full `/api` route smoke.
- Auth/session/CORS/rate-limit parity.
- Payment webhook parity.
- Report/email gate parity.
- Healthcheck parity.
- DNS/proxy staged change plan.
- Rollback plan.

Risks:

- Public API clients may depend on current gateway behavior.
- Webhook endpoints may have provider-side allowlists or cached DNS.
- A rushed migration could affect checkout/report/email flows.

### Option C: Standardize API edge gateway into a True Backend Runtime

Reactivate and standardize API edge gateway local Laravel as a backend runtime.

Pros:

- Could preserve a dedicated API node if there is a strong business reason.
- Could support a deliberate public API runtime split.

Cons:

- Not recommended from current evidence.
- Requires route count parity from `194` to the canonical set.
- Requires DB/Redis/queue/scheduler standardization.
- Requires deploy provenance and release contract cleanup.

Required gates:

- Git/release provenance.
- External DB/Redis alignment.
- Healthy queue workers.
- Scheduler ownership.
- Same deploy contract as backend authority.
- Route parity with canonical backend.
- Explicit API gateway/backend boundary.

Risks:

- Continues dual-backend runtime drift.
- Increases SEO 中台 source ambiguity.
- Can mask report/email/commerce async failures.

## Recommended Current Direction

Recommended direction:

- Treat `canonical-backend-authority` as the canonical backend authority candidate.
- Treat API edge gateway as `api.fermatmind.com` edge gateway / legacy node.
- Do not standardize API edge gateway local Laravel as backend authority unless a future explicit decision is made.
- Do not let SEO-DASH work start from API edge gateway local Laravel evidence.
- Next implementation should be edge gateway hardening and local runtime quarantine planning, not SEO-DASH.

## Required Gates Before Any Change

Before changing API edge gateway, canonical backend, DNS, OpenResty, proxy paths, payment routes, or SEO collector sources, complete:

- `/api` route smoke.
- Auth/session/CORS/rate-limit parity.
- Payment webhook path confirmation.
- Report/email gate parity.
- Scheduler/queue ownership confirmation.
- Rollback plan.
- OpenResty config backup.
- DNS/proxy staged change plan if migration path is chosen.

## Forbidden Assumptions

The following assumptions are forbidden:

- API edge gateway local Laravel is production backend authority.
- API edge gateway and canonical backend are interchangeable.
- API edge gateway queue `FATAL` is harmless for local runtime.
- SEO Collector may read API edge gateway local Laravel as authority.
- Metabase may query API edge gateway local DB.
- SEO 中台 production rollout may start before backend authority source is locked.
- pSEO or Career Decision expansion may start from this state.
- RIASEC, Big Five, or Career Decision may be described as a complete recommender runtime.
- Env keys or mounted files imply live cloud authority without runtime/cloud confirmation.
- Tencent COS is active media authority without a future explicit confirmation.

## First Implementation Path

Recommended sequence:

1. `BACKEND-RUNTIME-02A`: edge gateway hardening / local runtime quarantine plan.
2. `BACKEND-RUNTIME-02B`: API gateway smoke and rollback runbook.
3. `SEO-DASH-00`: schema, attribution, PII, and consent boundary only after gateway/backend authority source is accepted.
4. `SEO-DASH-01`: `seo_intel` DB and collector skeleton only after data source is locked.

## Repository Rule Impact

This PR is docs/generated/test contract work only. It does not change runtime behavior, public routes, sitemap/llms enumeration, analytics tracking, payment/report/email/recommendation/scoring behavior, backend code, frontend code, cloud resources, DNS, CDN, COS/OSS, database, env, or deployment scripts.
