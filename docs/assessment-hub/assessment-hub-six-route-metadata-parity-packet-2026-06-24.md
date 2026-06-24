# Assessment Hub Six-Route Metadata Parity Packet

Verdict: `HOLD_LIVE_DISCOVERABILITY_UNSTABLE`

Task: `ASSESSMENT-HUB-SIX-ROUTE-METADATA-PARITY-PACKET-01`

This packet consumes `ASSESSMENT-HUB-QA-COMMON-CONTRACT-01` and stays docs/contracts-only. It does not mutate sitemap, llms, llms-full, schema, hreflang, canonical, robots, noindex, redirects, CMS, search queues, provider APIs, deploys, private results, attempts, answers, payment, orders, or analytics instrumentation.

## Decision

The prior scan handoff expected `12/12 PASS` for route metadata/indexability/schema/discoverability parity and recorded the IQ mismatch as not reproduced. Current read-only live rechecks do not support that PASS claim. PR2 is therefore `HOLD`, not `PASS`.

## Current Live Rechecks

| Recheck | Command | Result | Shared resource finding | Surface impact |
| --- | --- | --- | --- | --- |
| `live_recheck_1` | `node scripts/seo/check-six-assessment-hub-parity.mjs --json` | `ok=false` | sitemap 200, llms 200, llms-full 200, sitemap-source en/zh 200; verifier reported `llms_full.route` missing | 12/12 HOLD |
| `live_recheck_2` | `node scripts/seo/check-six-assessment-hub-parity.mjs --json` | `ok=false` | sitemap 500, llms 200, llms-full 200, sitemap-source en/zh 200 | 12/12 HOLD |

Direct read-only spot checks found `llms.txt` contains all 12 route URLs and `llms-full.txt` contains six-assessment URLs, while `sitemap.xml` also returned 500 once. The live discoverability surface is unstable enough that this packet cannot truthfully record the requested `12/12 PASS`.

## Route Scope

The packet covers 12 public routes across these six scales: `MBTI`, `BIG5_OCEAN`, `ENNEAGRAM`, `RIASEC`, `IQ_RAVEN`, and `EQ_60`. Every route is marked `HOLD` in this packet because the shared discoverability checks are unstable.

## Deferred

CTA and form-code details remain deferred to `ASSESSMENT-HUB-TAKE-FLOW-CTA-PACKET-01`. This packet does not POST start/submit/result APIs and does not access private attempts or private result payloads.

## Next Safe Action

Stop the Assessment Hub QA PR train at PR2 until live discoverability parity is stable or a separate scoped repair scan is authorized.
