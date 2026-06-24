# Assessment Hub Six-Route Metadata Parity Packet

Verdict: `PASS_ROUTE_METADATA_INDEXABILITY_SCHEMA_DISCOVERABILITY_PARITY`

Task: `ASSESSMENT-HUB-SIX-ROUTE-METADATA-PARITY-PACKET-01`

This packet consumes `ASSESSMENT-HUB-QA-COMMON-CONTRACT-01` and stays docs/contracts-only. It does not mutate sitemap, llms, llms-full, schema, hreflang, canonical, robots, noindex, redirects, CMS, search queues, provider APIs, deploys, private results, attempts, answers, payment, orders, or analytics instrumentation.

## Decision

The prior scan handoff expected `12/12 PASS` for route metadata/indexability/schema/discoverability parity and recorded the IQ mismatch as not reproduced. The first PR2 attempt correctly recorded a temporary `llms-full` / sitemap instability hold. That blocker was fixed separately in PR #1420, merge commit `71325857228de2283b69d4f84da415226d8f0ecd`.

The post-repair read-only live recheck now supports the PASS claim:

| Recheck | Command | Result | Shared resource finding | Surface impact |
| --- | --- | --- | --- | --- |
| `post_repair_live_recheck_1` | `node scripts/seo/check-six-assessment-hub-parity.mjs --json` | `ok=true` | sitemap 200, llms 200, llms-full 200, sitemap-source en/zh 200 | 12/12 PASS |

The superseded HOLD evidence remains captured in the JSON packet under `superseded_hold_rechecks`. Current direct read-only spot checks confirm sitemap, `llms.txt`, and `llms-full.txt` contain all 12 public hub routes.

## Route Scope

The packet covers 12 public routes across these six scales: `MBTI`, `BIG5_OCEAN`, `ENNEAGRAM`, `RIASEC`, `IQ_RAVEN`, and `EQ_60`. Every route is marked `PASS` for public route metadata, canonical/robots/hreflang, sitemap/llms/llms-full presence, lookup indexability, and sitemap-source indexability.

The IQ mismatch did not reproduce after repair: IQ zh/en runtime robots resolve to `index, follow`, lookup `is_indexable=true`, and sitemap/llms/llms-full contain the IQ zh/en URLs.

## Deferred

CTA and form-code details remain deferred to `ASSESSMENT-HUB-TAKE-FLOW-CTA-PACKET-01`. This packet does not POST start/submit/result APIs and does not access private attempts or private result payloads.

## Next Safe Action

Merge PR2 after checks pass, clean up the branch, then continue to `ASSESSMENT-HUB-TAKE-FLOW-CTA-PACKET-01`.
