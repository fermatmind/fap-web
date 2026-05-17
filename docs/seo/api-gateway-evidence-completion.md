# API Gateway Evidence Completion

Version: api_gateway_evidence_completion.v1
Scope: BACKEND-RUNTIME-02D
Status: accepted

## A. Purpose

This document completes the missing BACKEND-RUNTIME-02C gateway evidence.

It verifies whether Node2 OpenResty currently serves `api.fermatmind.com`, whether `/api/` is proxied to Node3 / `fap-api-prod`, whether Node2 local Laravel is involved in `/api/` authority, and whether SEO-DASH-00 can start.

This is a read-only evidence report. It does not implement, migrate, deploy, restart, reload, or reconfigure anything.

## B. Scope and Non-Changes

Observed:

- Fresh read-only Node2 SSH access.
- Node2 OpenResty container metadata.
- Minimal OpenResty config evidence for `server_name api.fermatmind.com`, `location ^~ /api/`, and `proxy_pass`.
- Safe config checksum and mtime.
- Public HTTPS GET smoke recheck against `https://api.fermatmind.com`.
- Selected public HTTPS GET comparison against `https://ops.fermatmind.com`.

Not changed:

- No frontend runtime code.
- No backend runtime code.
- No Node2, Node3, OpenResty, DNS, CDN, COS/OSS, database, queue, scheduler, env, deploy, payment, report, email, recommendation, scoring, sitemap, llms, analytics, Metabase, collector, or `seo_intel` behavior.
- No OpenResty reload or restart.
- No config edits or file copies.
- No orders, attempts, emails, checkout, email-bind, or payment webhooks.
- No secrets, env values, private keys, raw cookies, raw response bodies, emails, order numbers, or payment IDs were stored.

## C. Accepted Topology Under Test

- Node1 / `fap-node1`: production `fap-web` public frontend runtime.
- Node2 / `fap-node2`: `api.fermatmind.com` API edge gateway / OpenResty proxy node.
- Node3 / `fap-api-prod`: backend / CMS / commerce authority candidate.
- Node2 local Laravel / DB / queue / `php84` / `fap-mysql`: legacy, non-authority, quarantined.

## D. Fresh Node2 Gateway Config Evidence

Fresh read-only Node2 evidence:

- Hostname: `VM-4-14-ubuntu`
- Evidence time: `2026-05-17T10:02:57+08:00`
- OpenResty container: `1Panel-openresty-r188`
- OpenResty image: `1panel/openresty:1.27.1.2-5-1-focal`
- OpenResty status: `running`
- OpenResty network mode: `host`
- Config file: `/usr/local/openresty/nginx/conf/conf.d/fap-api.conf`
- Config checksum: `03622298e56a2c4107b63a5911a32c5ea174708c2adaeb9575ccaeea6c112479`
- Config mtime: `2026-05-03 22:03:20.953200769 +0800`
- Config size: `3298`

Minimal config evidence:

- `server_name api.fermatmind.com` is present.
- `location ^~ /api/` is present.
- `/api/` has `proxy_pass http://122.152.221.126`.

## E. API Proxy Target Classification

Classification: `node3_backend_authority`

Evidence:

- `122.152.221.126` is the accepted Node3 / `fap-api-prod` backend authority candidate.
- Fresh Node2 OpenResty config shows `/api/` proxying to `http://122.152.221.126`.
- Node2 local `php84` and `fap-mysql` are present, but `/api/` does not proxy to `127.0.0.1:9000`, a local PHP socket, a local PHP upstream, or Node2 local Laravel.

There is no fresh evidence that Node2 local Laravel serves `/api/` authority.

## F. Public API Smoke Recheck Matrix

All required public GET smoke endpoints returned HTTP 200 from `https://api.fermatmind.com` with JSON content and without storing response bodies.

| Name | Method | Status | Body Hash | Bytes | Schema Keys |
| --- | --- | ---: | --- | ---: | --- |
| scales catalog | GET | 200 | `45c5b4a3a53a299ce0c64cf90c7223270a3445bc43198deca6b901727d21d40f` | 20398 | `ok`, `locale`, `items` |
| MBTI lookup | GET | 200 | `fd2339fcf62271e76304f422ae842743dcb142c4344528e1849fbebbe849967d` | 10332 | `ok`, `scale_code`, `scale_code_legacy`, `scale_code_v2`, `scale_uid` |
| RIASEC lookup | GET | 200 | `c9874d02973fdfc5c7a8051e53426152787356514478a33ab53aeecdbab80326` | 9511 | `ok`, `scale_code`, `scale_code_legacy`, `scale_code_v2`, `scale_uid` |
| sitemap source | GET | 200 | `7e2fd5c14e72e2634cc108ef3698f56bdbcf851ac6295a6c267b4aa27b1d6ad3` | 266862 | `ok`, `source`, `count`, `items` |
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
- `sitemap_source`: status, bytes, and schema matched; hash differed and is classified as dynamic/hash drift, not a blocker.

## G. Header / CORS / Cache Observations

Smoke requests used:

- `Origin: https://fermatmind.com`
- `Accept: application/json`

Observed across required public endpoints:

- `content-type`: `application/json`
- `access-control-allow-origin`: `https://fermatmind.com`
- `access-control-expose-headers`: `X-Request-Id`
- `cache-control`: `no-cache, private`
- `vary`: `Origin`
- `strict-transport-security`: present on primary API responses.
- Rate-limit headers are present on scale and SKU endpoints and absent on some CMS/public content endpoints.
- Cookie values were not stored.

## H. Side-Effect Boundary Verification

Side-effect boundary remained clean:

- `created_orders`: false
- `created_attempts`: false
- `sent_emails`: false
- `triggered_payment_webhook`: false
- `modified_openresty`: false
- `restarted_services`: false
- `changed_dns`: false
- `changed_database`: false

No email-bind, checkout, webhook, attempt creation, mail sending, deployment, migration, env edit, or runtime mutation was performed.

## I. Node2 Local Runtime Quarantine Verification

Node2 local runtime remains quarantined:

- `php84` container is present.
- `fap-mysql` container is present.
- Node2 local Laravel route count remains prior-reference `194`.
- Node3 route count remains prior-reference `312`.
- Node2 local queue remains prior-reference FATAL / unhealthy.
- Node2 local Redis env key remains prior-reference not observed.
- Node2 scheduler remains prior-reference not observed.
- `/api/` proxy target is Node3, not local Laravel, local PHP, or local socket.
- SEO Collector must not read Node2 local Laravel as authority.
- Metabase must not query Node2 local DB.

## J. Acceptance Status

Acceptance status: `accepted`

Reasons:

- Fresh Node2 OpenResty evidence verifies `api.fermatmind.com` is configured in `fap-api.conf`.
- Fresh Node2 OpenResty evidence verifies `location ^~ /api/` proxies to `http://122.152.221.126`.
- `122.152.221.126` corresponds to Node3 / `fap-api-prod` backend authority candidate.
- No evidence shows `/api/` serving from Node2 local Laravel.
- All required public GET smoke endpoints passed.
- Side-effect boundary was clean.
- No secrets, PII, cookie values, raw response bodies, order numbers, or payment IDs were stored.

## K. Remaining Blockers

No blocker remains for starting SEO-DASH-00 as a docs/schema/PII/consent-boundary PR.

Still forbidden until separately approved:

- Deploying collectors.
- Creating `seo_intel` in production.
- Deploying Metabase.
- Changing OpenResty, DNS, CDN, COS/OSS, database, queues, sitemap, llms, tracking, payment, report, email, recommendation, or scoring behavior.
- Letting SEO Collector read Node2 local Laravel or local DB as authority.

## L. Final Decision

Final decision: `accepted`

Answers:

- Is Node2 OpenResty currently serving `api.fermatmind.com`? Yes, as observed from fresh Node2 OpenResty config.
- Does Node2 OpenResty currently proxy `/api/` to Node3 / `fap-api-prod`? Yes, `/api/` proxies to `http://122.152.221.126`.
- Is there evidence that `/api/` is served by Node2 local Laravel/php84? No.
- Can public API authority be accepted for SEO-DASH-00? Yes.

## M. Next Task

Next task: `SEO-DASH-00`

SEO-DASH-00 should remain a docs/schema/attribution/PII/consent boundary task first. It must not deploy collectors, create production migrations, deploy Metabase, or change runtime behavior without a later approved implementation PR.
