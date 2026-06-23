# Enneagram Analytics Consumption Packet

Task id: `ENNEAGRAM-ANALYTICS-CONSUMPTION-PACKET-01`

Verdict: `READY_TO_CONSUME_BY_ANALYTICS`

This packet lets the `analytics_gsc_opportunity` agent consume Enneagram result-page evidence after the common analytics contract. It is docs/contracts-only. It does not implement analytics runtime code, emit events, backfill production metrics, score opportunities, generate/import/activate Enneagram payloads, switch runtime, mutate public personality content, write CMS, publish, deploy, submit search URLs, call providers, access private result data, or write generated readiness artifacts.

## Consumed Evidence

| Evidence | Source |
| --- | --- |
| Common analytics contract | `docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json` |
| Enneagram Runtime QA packet | `docs/result-page-agents/enneagram-runtime-qa-consumption-packet.v1.json` |
| Enneagram standard alignment | `docs/result-page-agents/enneagram-result-page-agent-readiness.proposal.json` |
| Standard alignment report | `docs/result-page-agents/enneagram-result-page-agent-standard-alignment-2026-06-22.md` |
| Result-page analytics handoff | `docs/result-page-agents/result-page-agent-analytics-handoff.v1.json` |
| Public share contract | `tests/contracts/enneagram-share-surface.contract.test.tsx` |
| Public personality boundary | `tests/contracts/personality-enneagram-v1-noindex-render.contract.test.ts` |

## Analytics Events

| Event | Family | Boundary |
| --- | --- | --- |
| `enneagram_result_view` | `result_view` | Aggregate public-safe result view only. |
| `enneagram_full_report_view` | `full_report_view` | Public-safe full-report view/access state only. |
| `enneagram_report_module_view` | `report_module_view` | Coarse module impression using `module_id` and `module_slot`; no body text. |
| `enneagram_share_summary_view` | `share_summary_view` | Public-summary share surface only. |
| `enneagram_second_test_click` | `second_test_click` | Funnel transition count only; no deterministic recommendation. |
| `enneagram_public_profile_click` | `public_profile_click` | Public profile click intent only; no private result text publication. |

These event names are analytics-consumption vocabulary only. This PR does not add tracking code or event emission.

## Forbidden Payload Fields

Enneagram analytics must not consume attempt IDs, scores, raw scores, score vectors, dominance gap, release hash, raw/internal metadata, private result payloads, private report text, full report body text, report tokens, private URLs, account/user/contact fields, payment/order data, selector traces, source refs, or QA traces.

## Public Personality Boundary

Private result text must not become public personality content. Public profile content mutation remains `HOLD`. Analytics may only represent public-profile click intent and must not publish, generate, or transform private Enneagram result text into public personality content.

## Claim Boundary

Analytics consumption must not support final type certainty, fixed type certainty, diagnosis, therapy, treatment, hiring, salary, performance, success, admission, ability, or life-outcome claims.

## Holds

Enneagram remains `HOLD` for candidate generation, import, activation, runtime switch, public profile content mutation, CMS, search, private result access, event emission, production metric backfill, opportunity scoring, provider calls, Search Channel mutation, generated readiness artifact writes, deploy, production import, and rollout.

## Next Safe Output

The next safe analytics output is a future read-only analytics quality report. That report may cite this packet and compare public-safe readiness coverage, but it still must not emit events, backfill metrics, score opportunities, call providers, mutate Search Channel, write CMS, deploy, access private data, generate/import/activate Enneagram content, or mutate public personality content.
