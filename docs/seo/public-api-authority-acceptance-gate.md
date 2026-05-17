# Public API Authority Acceptance Gate

Version: public_api_authority_acceptance_gate.v1
Scope: BACKEND-RUNTIME-02C
Status: partial

## A. Purpose

This document records the BACKEND-RUNTIME-02C public API authority acceptance gate after BACKEND-RUNTIME-02B.

The goal is to determine whether `api.fermatmind.com` can be accepted as a Node2 edge gateway backed by Node3 / `fap-api-prod` authority for public read API consumption, and whether SEO-DASH-00 may start.

This is evidence capture and architecture gating only. It does not implement, migrate, deploy, restart, or reconfigure anything.

## B. Scope and Non-Changes

Observed in this PR:

- Public HTTPS GET smoke checks against `https://api.fermatmind.com`.
- Selected public HTTPS GET comparison checks against `https://ops.fermatmind.com`.
- Header, CORS, cache, rate-limit, and HSTS metadata.
- A synthetic non-mutating private-surface check using a non-real attempt id.
- Side-effect policy enforcement.

Not changed:

- No frontend runtime code.
- No backend runtime code.
- No Node2, Node3, OpenResty, DNS, CDN, COS/OSS, database, queue, scheduler, env, deploy, payment, report, email, recommendation, scoring, sitemap, llms, analytics, Metabase, collector, or `seo_intel` behavior.
- No SSH or cloud command was used for this gate.
- No orders, attempts, emails, or payment webhooks were created or triggered.

## C. Accepted Topology Being Tested

The accepted prior-contract topology under test is:

- Node1 / `fap-node1`: production `fap-web` public frontend runtime.
- Node2 / `fap-node2`: `api.fermatmind.com` API edge gateway / OpenResty proxy node.
- Node3 / `fap-api-prod`: backend / CMS / commerce authority candidate.
- Node2 local Laravel / DB / queue / `php84` / `fap-mysql`: legacy, non-authority, quarantined.

Prior accepted evidence from BACKEND-RUNTIME-01C and BACKEND-RUNTIME-02A/02B states that `api.fermatmind.com /api/` was observed proxying to `122.152.221.126`, which corresponds to Node3 / `fap-api-prod`.

## D. Gateway Config Verification

Fresh gateway config verification was unavailable in this task because BACKEND-RUNTIME-02C explicitly disallowed SSH and runtime access.

Recorded status:

- `gateway_config_verified`: false
- `evidence_source`: `prior_contract_only`
- `api_proxy_target_classification`: `unknown_from_fresh_02c_scan`
- `gateway_config_fresh_verification`: `unavailable`

This does not contradict the prior Node2 gateway finding, but it prevents a full `accepted` decision in this gate. The result is therefore `partial`.

## E. Public API Smoke Matrix

All required public GET smoke endpoints returned HTTP 200 from `https://api.fermatmind.com` with JSON content and without storing response bodies.

| Name | Method | Status | Body Hash | Bytes | Schema Keys |
| --- | --- | ---: | --- | ---: | --- |
| scales catalog | GET | 200 | `45c5b4a3a53a299ce0c64cf90c7223270a3445bc43198deca6b901727d21d40f` | 20398 | `ok`, `locale`, `items` |
| MBTI lookup | GET | 200 | `fd2339fcf62271e76304f422ae842743dcb142c4344528e1849fbebbe849967d` | 10332 | `ok`, `scale_code`, `scale_code_legacy`, `scale_code_v2`, `scale_uid` |
| RIASEC lookup | GET | 200 | `c9874d02973fdfc5c7a8051e53426152787356514478a33ab53aeecdbab80326` | 9511 | `ok`, `scale_code`, `scale_code_legacy`, `scale_code_v2`, `scale_uid` |
| sitemap source | GET | 200 | `4b84063050013cf7cb1c4be30ba62039eb462e9476193b72e1a3101fadbda732` | 266862 | `ok`, `source`, `count`, `items` |
| articles list | GET | 200 | `36412d6a78dec91f0f5ac20bf853b75958f456f0b3bb2c710c4ed232bc4696e9` | 298256 | `ok`, `items`, `pagination`, `landing_surface_v1` |
| article detail | GET | 200 | `724e4c54a995c9ac2942fcf9f0474752e70f6e473471b2a468e0f7ce8b1f2288` | 45057 | `ok`, `article`, `seo_surface_v1`, `landing_surface_v1`, `answer_surface_v1` |
| topics | GET | 200 | `06045f0ed6fee16f8021c57ebf0672ecb3e6f813e2c0c69e27e2463747212654` | 4390 | `ok`, `items`, `pagination`, `landing_surface_v1` |
| personality INFJ | GET | 200 | `f0a059da90320479d19a1afa296eb2ed16965417b46fb0f607f20c8132ddd513` | 16737 | `ok`, `profile`, `sections`, `seo_meta`, `mbti_public_projection_v1` |
| career jobs | GET | 200 | `c190b4ac23450812bd080ad4229ade162c282f0ccccd5eefcf506af9306aebd0` | 1814391 | `bundle_kind`, `bundle_version`, `items` |
| MBTI SKUs | GET | 200 | `3108bca1a819fa0ba7e46978839f44595338aa3fe42ee543b560b4fe9223814d` | 1979 | `ok`, `items` |

Selected `ops.fermatmind.com` comparison:

- `scales_catalog`: status, bytes, schema, and hash matched.
- `articles_list`: status, bytes, schema, and hash matched.
- `skus_mbti`: status, bytes, schema, and hash matched.
- `sitemap_source`: status, bytes, and schema matched; body hash differed, so it is recorded as equivalent shape with dynamic/hash drift requiring no runtime change in this PR.

## F. Header / CORS / Cache / Auth Matrix

Smoke requests used:

- `Origin: https://fermatmind.com`
- `Accept: application/json`

Observed across required public endpoints:

- `content-type`: `application/json`
- `access-control-allow-origin`: `https://fermatmind.com`
- `access-control-expose-headers`: `X-Request-Id`
- `cache-control`: `no-cache, private`
- `vary`: `Origin`
- `strict-transport-security`: present on `api.fermatmind.com`
- `x-ratelimit-limit` / `x-ratelimit-remaining`: present on scale/SKU endpoints, absent on some CMS/public content endpoints.
- No cookie values were stored in the artifact.

Private surface smoke:

- `GET /api/v0.3/attempts/nonexistent/report-access` used a synthetic non-real id.
- Result: HTTP 404 JSON response with `ok`, `error_code`, `message`, `details`, and `request_id` shape.
- This is acceptable protected behavior for a non-real resource and did not mutate state.

## G. Report / Email / Checkout / Payment Side-Effect Boundary

Side-effect policy was enforced:

- `created_orders`: false
- `created_attempts`: false
- `sent_emails`: false
- `triggered_payment_webhook`: false

Not called:

- `POST /attempts/start`
- `POST /attempts/submit`
- `POST /email-bind`
- `POST /orders/checkout`
- Any payment provider callback or webhook endpoint
- Any endpoint expected to mutate state

Payment webhook ingress was not live-tested. It remains mapping-only from existing route/contracts until an approved non-production or explicitly authorized QA procedure exists.

## H. Node2 Local Runtime Quarantine Check

Node2 local runtime remains quarantined by contract:

- Node2 local Laravel route count: 194 from BACKEND-RUNTIME-00A.
- Node3 / `fap-api-prod` route count reference: 312.
- Node2 local queue: FATAL / unhealthy from BACKEND-RUNTIME-00A.
- Node2 local Redis env key: not observed from BACKEND-RUNTIME-00A.
- Node2 scheduler: not observed from BACKEND-RUNTIME-00A.
- SEO Collector must not read Node2 local Laravel as authority.
- Metabase must not query Node2 local DB.

No fresh evidence in this task contradicted quarantine.

## I. Acceptance Status

Acceptance status: `partial`

Reason:

- All required public API smoke endpoints passed.
- Headers/CORS/cache behavior was acceptable for public read API smoke.
- Side-effect boundaries were enforced.
- No PII, secret values, cookie values, order numbers, payment IDs, or raw response bodies were stored.
- However, fresh Node2 OpenResty gateway config verification was unavailable because SSH/runtime access was explicitly disallowed in this task.

Therefore, `api.fermatmind.com` can be treated as publicly smoke-passing, but full public API authority acceptance is not complete.

## J. What Remains Blocked

Still blocked:

- SEO-DASH-00 production implementation.
- SEO Collector production rollout.
- Treating Node2 gateway config as freshly accepted.
- Treating Node2 local Laravel as any production authority.
- Metabase / collector access to Node2 local DB.
- Any payment/report/email side-effect test in production.

## K. Final Decision

Final decision: `partial`

Answers:

- Public read API surfaces pass smoke checks: yes.
- `api.fermatmind.com` can be accepted as fully proven Node2 gateway backed by Node3 in this PR: no, because fresh gateway config verification was unavailable.
- Node2 local Laravel remains non-authority: yes, by prior contract and no contradictory evidence.
- Side-effect boundary was preserved: yes.
- SEO-DASH-00 unblocked: no.

## L. Next Task

Next task: `BACKEND-RUNTIME-02D | Gateway Evidence Completion`

BACKEND-RUNTIME-02D should capture fresh read-only gateway config evidence for `api.fermatmind.com /api/` without changing Node2, OpenResty, DNS, CDN, database, queues, or backend runtime behavior.
