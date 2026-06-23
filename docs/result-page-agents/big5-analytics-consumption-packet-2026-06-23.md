# Big Five Analytics Consumption Packet

Task id: `BIG5-ANALYTICS-CONSUMPTION-PACKET-01`

Verdict: `READY_TO_CONSUME_BY_ANALYTICS`

This packet lets the `analytics_gsc_opportunity` agent consume Big Five result-page evidence after the common analytics contract. It is docs/contracts-only. It does not implement analytics runtime code, emit events, backfill production metrics, score opportunities, mutate Search Channel, call GSC/GA4/providers, write CMS, publish, deploy, access private result data, mutate fap-api, or write generated readiness artifacts.

## Consumed Evidence

| Evidence | Source |
| --- | --- |
| Common analytics contract | `docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json` |
| Big Five Runtime QA packet | `docs/result-page-agents/big5-runtime-qa-consumption-packet.v1.json` |
| Big Five readonly-cleared handoff | `docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff.v1.json` |
| Result-page analytics handoff | `docs/result-page-agents/result-page-agent-analytics-handoff.v1.json` |
| PDF/share/private leak contracts | `tests/contracts/big5-pdf-rendered-qa.contract.test.tsx`, `tests/contracts/big5-share-card-rendered-qa.contract.test.tsx`, `tests/contracts/result-private-leak-regressions.contract.test.ts` |

The historical Big Five share-safety blocker is cleared for read-only consumption only. The handoff evidence records `share_safety_missing_count=0`, `validation_error_count=0`, and `leak_hit_count=0` from sanitized fap-api PR #2326 and PR #2331 evidence.

## Analytics Events

| Event | Family | Boundary |
| --- | --- | --- |
| `big5_result_view` | `result_view` | Aggregate public-safe result view only. |
| `big5_full_report_view` | `full_report_view` | Public-safe full-report view/access state only. |
| `big5_report_module_view` | `report_module_view` | Coarse module impression using `module_id` and `module_slot`; no body text. |
| `big5_pdf_click` | `pdf_click` | Intent/click count only after redaction state is public-safe. |
| `big5_share_event` | `share_event` | Public-safe share summary intent only. |
| `big5_second_test_click` | `second_test_click` | Funnel transition count only; no deterministic recommendation. |
| `big5_returning_user_signal` | `returning_user_signal` | Aggregate return/read state only. |

These event names are analytics-consumption vocabulary only. This PR does not add tracking code or event emission.

## Forbidden Payload Fields

Big Five analytics must not consume raw OCEAN scores, raw scores, score vectors, dimension vectors, percentiles, attempt/user/account/contact identifiers, report tokens, private URLs, private result payloads, full report body text, selector traces, source refs, QA traces, payment/order data, access tokens, cookies, or session IDs.

## Exclusions

Analytics consumption must exclude production activation smoke attempts, any `codex_probe_` anon/session/request prefixes, QA/synthetic attempts, fixtures, generated readiness artifacts, staging-only artifacts, internal previews, crawler/search/provider behavior, and private result/report URLs.

## Holds

Big Five remains `HOLD` for pilot activation, runtime enablement, production rollout, CMS, search, private result data, event emission, production metric backfill, opportunity scoring, provider calls, Search Channel mutation, generated readiness artifact writes, renderer changes, runtime instrumentation changes, Big Five content changes, and fap-api mutation.

## Next Safe Output

The next safe analytics output is a future read-only analytics quality report. That report may cite this packet and compare public-safe readiness coverage, but it still must not emit events, backfill metrics, score opportunities, call providers, mutate Search Channel, write CMS, deploy, access private data, or mutate fap-api.
