# API Gateway Smoke and Rollback Runbook

Version: `api_gateway_smoke_rollback_runbook.v1`
Scope: `BACKEND-RUNTIME-02B`
Status: `planning_contract`

## Purpose

This document is the API gateway smoke and rollback runbook after `BACKEND-RUNTIME-02A`.

It defines how a future operator should verify `api.fermatmind.com` gateway behavior and how a future OpenResty gateway change window should be backed up, smoke-tested, and rolled back. It does not implement gateway changes, execute smoke checks, modify OpenResty, change DNS, restart services, touch Node2/Node3, or approve production changes.

## Accepted Topology

| Runtime | Accepted role | Status |
| --- | --- | --- |
| Node2 / `fap-node2` | `api.fermatmind.com` API edge gateway only | `edge_gateway_only` |
| Node3 / `fap-api-prod` | Backend/CMS/commerce authority candidate | `backend_authority_candidate` |
| Node2 local Laravel | Legacy local runtime | `non_authority`, `quarantined` |
| Node2 local DB / `fap-mysql` | Local data store | `non_authority`, `quarantined` |
| Node2 local queue | Local queue | `FATAL`, `unhealthy`, `non_authority` |

Accepted gateway observation from previous scans:

```text
api.fermatmind.com /api/ -> proxy_pass http://122.152.221.126
```

`122.152.221.126` corresponds to Node3 / `fap-api-prod`.

## Pre-Smoke Conditions

Before any future smoke run or change window:

- No deploy is in progress.
- No payment/webhook test is in progress.
- No DNS/CDN change is in progress.
- OpenResty config is readable by the operator.
- Operator has read-only access for smoke commands.
- Rollback owner is identified before any future change window.
- Scope owner confirms that smoke is read-only and must not create orders, attempts, emails, payments, database writes, queue jobs, or config changes.

## Read-Only Gateway Smoke Checks

The following smoke checks are GET/HEAD only. They are intended to verify that `api.fermatmind.com` remains available and public API surfaces still behave through the Node2 gateway and Node3-backed authority.

| Surface | Example path | Method | Side-effect policy |
| --- | --- | --- | --- |
| API availability | `/` or known health endpoint if available | `HEAD` or `GET` | read-only |
| Scale catalog | `/api/v0.3/scales/catalog?locale=zh-CN` | `GET` | read-only |
| MBTI lookup | `/api/v0.3/scales/lookup?slug=mbti-personality-test-16-personality-types&locale=zh-CN` | `GET` | read-only |
| RIASEC lookup | `/api/v0.3/scales/lookup?slug=holland-career-interest-test-riasec&locale=zh-CN` | `GET` | read-only |
| Sitemap source | `/api/v0.5/seo/sitemap-source` | `GET` | read-only |
| Articles list | `/api/v0.5/articles?locale=zh-CN` | `GET` | read-only |
| Article detail | `/api/v0.5/articles/holland-career-interest-test-can-and-cannot-tell-you?locale=zh-CN` | `GET` | read-only |
| Topics | `/api/v0.5/topics?locale=zh-CN` | `GET` | read-only |
| Personality | `/api/v0.5/personality/infj?locale=zh-CN` | `GET` | read-only |
| Career jobs | `/api/v0.5/career/jobs?locale=en` | `GET` | read-only |
| SKUs | `/api/v0.3/skus?scale=MBTI` | `GET` | read-only |

POST, PUT, PATCH, DELETE, webhook replay, checkout creation, order creation, attempt creation, email sending, queue mutation, and auth mutation are forbidden during this smoke.

## Header / CORS / Cache Smoke

For public GET responses, record only non-secret metadata:

- request `Origin: https://fermatmind.com`
- status code
- `content-type`
- CORS allow-origin behavior
- rate-limit header behavior if present
- cache headers
- HSTS observation if present
- robots/noindex headers if relevant
- upstream or proxy diagnostic headers only if they do not expose secrets

Do not record cookies, bearer tokens, session IDs, raw authorization headers, emails, order numbers, payment IDs, webhook signatures, or private IDs in the smoke report.

## Auth / Session Smoke

Auth/session smoke is read-only only:

- Do not log in.
- Do not submit passwords.
- Do not mutate accounts.
- Do not bind email.
- Do not refresh tokens.
- Do not create sessions.

Verify only:

- unauthenticated public surfaces remain public
- private surfaces remain protected
- unexpected cookies are not leaked in public responses
- auth-required responses do not expose sensitive payloads

## Report / Email / Checkout Smoke

Report/email/checkout smoke must avoid side effects:

- `report-access` smoke may use a pre-existing safe QA attempt only if explicitly provided for the smoke window.
- `email-bind` must not be called unless explicit QA authorization provides a QA attempt and QA email.
- Checkout/order creation is forbidden.
- Payment is forbidden.
- Mail sending is forbidden.
- Attempt creation is forbidden.
- Queue-triggering endpoints are forbidden.

If no safe QA attempt is provided, report/email smoke is limited to route mapping and auth boundary observation without invoking state-changing endpoints.

## Payment Webhook Ingress Mapping Verification

Webhook verification in this runbook is mapping-only and non-triggering:

- verify route presence from route inventory or config evidence
- verify provider endpoint path mapping
- verify webhook domain/path owner
- verify whether the path is intended to enter Node2 gateway or Node3 directly
- verify no gateway rewrite would drop signature headers

Forbidden:

- do not send fake payment events to production
- do not call provider webhook live
- do not replay captured webhooks
- do not create payment intents
- do not create orders
- do not print webhook secrets or signatures

## OpenResty Config Backup Plan for Future Change Window

These are future change-window steps. They must not be executed by this PR.

Before changing OpenResty:

1. Capture the OpenResty config file path for `api.fermatmind.com`.
2. Copy the config to a timestamped backup path.
3. Record a checksum for the active config and backup.
4. Record the current upstream target for `/api/`.
5. Preserve TLS blocks, `server_name`, redirect blocks, ACME challenge blocks, and proxy header behavior.
6. Validate syntax before reload.
7. Prepare staged reload plan.
8. Prepare rollback restore plan.

The backup must be sufficient to restore the previous gateway behavior without editing application code or database state.

## Rollback Plan

Rollback is required if any future gateway change causes:

- `/api` smoke failure
- auth/session regression
- CORS/header regression
- payment webhook ingress uncertainty
- report/email/checkout route regression
- unexpected 5xx or timeout increase
- proxy target drift
- TLS/server_name regression

Future rollback steps:

1. Stop the change window.
2. Restore previous OpenResty config from the timestamped backup.
3. Validate OpenResty syntax.
4. Reload OpenResty only inside the approved change window.
5. Re-run read-only gateway smoke checks.
6. Communicate rollback result and remaining risk.
7. Do not continue to SEO-DASH or other dependent work until smoke is green.

Rollback stop conditions:

- backup missing
- syntax validation fails
- smoke remains red after rollback
- payment/report/email ingress is uncertain
- operator cannot prove active upstream target

## 02C Acceptance Prerequisites

`BACKEND-RUNTIME-02C` may start only when:

- gateway smoke runbook exists
- rollback plan exists
- Node2 local runtime remains quarantined
- Node3-backed public API smoke passes
- payment/report/email routes have non-side-effect mapping verified
- SEO Collector input source can be locked to Node3-backed authority
- forbidden side-effect operations remain out of smoke scope

## Recommended Next Task

Recommended next task:

```text
BACKEND-RUNTIME-02C | API Gateway Read-only Smoke Evidence Capture
```

`SEO-DASH-00` remains blocked until the gateway/backend authority boundary is operationally accepted.

## Forbidden Actions

The following actions are forbidden during this PR and during read-only smoke unless a future task explicitly authorizes them:

- changing DNS
- changing OpenResty
- restarting services
- creating orders
- creating attempts
- sending emails
- calling live payment webhooks
- replaying payment webhooks
- creating checkout sessions
- fixing Node2 queue
- touching Node2 local Laravel
- reading Node2 local Laravel as authority
- querying Node2 local DB from Metabase
- deploying SEO Collector
- creating `seo_intel` DB
- deploying Metabase

## Side-Effect Policy

Allowed:

- GET/HEAD requests to public or explicitly safe read-only endpoints
- header inspection
- route/config mapping review without secrets
- checksum and backup planning for a future change window

Forbidden:

- POST/PUT/PATCH/DELETE against production
- account mutation
- checkout/order/attempt creation
- payment or webhook event generation
- email sending
- queue/scheduler mutation
- database writes
- OpenResty reload or config edit
- DNS/CDN/COS/OSS changes

## Repository Rule Impact

This PR is docs/generated/test contract work only. It does not change runtime behavior, public routes, sitemap/llms enumeration, analytics tracking, payment/report/email/recommendation/scoring behavior, backend code, frontend code, cloud resources, DNS, CDN, COS/OSS, database, env, OpenResty, Node2, Node3, or deployment scripts.
