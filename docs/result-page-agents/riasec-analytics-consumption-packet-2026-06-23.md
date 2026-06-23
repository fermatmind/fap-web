# RIASEC Analytics Consumption Packet

Task id: `RIASEC-ANALYTICS-CONSUMPTION-PACKET-01`

Verdict: `READY_TO_CONSUME_BY_ANALYTICS`

This packet lets the `analytics_gsc_opportunity` agent consume RIASEC result-page evidence after the common analytics contract. It is docs/contracts-only. It does not implement analytics runtime code, emit events, backfill production metrics, score opportunities, mutate Search Channel, call GSC/GA4/providers, write CMS, publish, deploy, access private result data, mutate fap-api, run a production import, enable runtime wrappers, mutate career graph runtime behavior, or write generated readiness artifacts.

## Consumed Evidence

| Evidence | Source |
| --- | --- |
| Common analytics contract | `docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json` |
| RIASEC Runtime QA packet | `docs/result-page-agents/riasec-runtime-qa-consumption-packet.v1.json` |
| RIASEC Runtime QA report | `docs/result-page-agents/riasec-runtime-qa-consumption-packet-2026-06-23.md` |
| RIASEC standard alignment | `docs/result-page-agents/riasec-result-page-agent-standard-alignment-2026-06-23.md` |
| Result-page analytics handoff | `docs/result-page-agents/result-page-agent-analytics-handoff.v1.json` |
| fap-api runtime/career/analytics handoff | `fap-api:backend/docs/riasec/riasec-result-page-agent-runtime-career-analytics-handoff-2026-06-23.md` |

RIASEC is ready for a future read-only analytics quality report only. It is not ready for event emission, opportunity scoring, production metric backfill, runtime mutation, production import, or career graph runtime mutation.

## One-Flagship / Two-Form Boundary

- canonical landing: `holland-career-interest-test-riasec`
- supported forms: `riasec_60`, `riasec_140`
- parallel RIASEC stack introduced: no
- legacy 36Q surface allowed: no

## Analytics Events

| Event | Family | Boundary |
| --- | --- | --- |
| `riasec_result_view` | `result_view` | Aggregate public-safe result view only. |
| `riasec_full_report_view` | `full_report_view` | Public-safe full-report view/access state only. |
| `riasec_report_module_view` | `report_module_view` | Coarse module impression using `module_id` and `module_slot`; no body text. |
| `riasec_career_exploration_click` | `career_exploration_click` | Public-safe exploration intent only; examples-only, not recommendations. |
| `riasec_share_summary_view` | `share_summary_view` | Public-summary share surface only. |
| `riasec_second_test_click` | `second_test_click` | Funnel transition count only; no deterministic recommendation. |

These event names are analytics-consumption vocabulary only. This PR does not add tracking code or event emission.

## Career Graph Bridge Boundary

RIASEC analytics may treat career bridge interaction as public-safe exploration intent only. `public_dimension_code` and `example_kind` may be consumed only when they are already public-safe and coarse. Career bridge language stays examples-only and must not become a deterministic career recommendation.

Allowed bridge language includes:

- examples to explore
- work activities that may be worth comparing
- career areas to learn about first
- majors or roles that often involve similar activity patterns
- use this as a starting point, not a decision

Forbidden bridge claims include deterministic career recommendation, best career for you, guaranteed fit, you should choose, you will succeed, hiring screen, admissions decision, salary prediction, performance prediction, success prediction, ability measurement, official Holland type determines your career, and low score means cannot do this.

## Forbidden Payload Fields

RIASEC analytics must not consume attempt/user/account/contact identifiers, raw scores, score vectors, dimension vectors, percentiles, selector traces, share blocks, source refs, QA/editor notes, private URLs, report tokens, tokens, secrets, private result payloads, full report body text, payment/order data, access tokens, cookies, or session IDs.

## Exclusions

Analytics consumption must exclude production activation smoke attempts, any `codex_probe_` anon/session/request prefixes, QA/synthetic attempts, fixtures, generated readiness artifacts, staging-only artifacts, internal previews, crawler/search/provider behavior, and private result/report URLs.

## Holds

RIASEC remains `HOLD` for production import, runtime wrapper enablement, runtime enablement, CMS, search, career graph runtime mutation, deterministic career recommendation, private result access, event emission, production metric backfill, opportunity scoring, provider calls, Search Channel mutation, generated readiness artifact writes, fap-api mutation, deploy, and rollout.

## Next Safe Output

The next safe analytics output is a future read-only analytics quality report. That report may cite this packet and compare public-safe readiness coverage, but it still must not emit events, backfill metrics, score opportunities, call providers, mutate Search Channel, write CMS, deploy, access private data, run production import, enable runtime wrappers, mutate career graph runtime behavior, or mutate fap-api.
