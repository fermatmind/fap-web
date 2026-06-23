# Active Result-Page Agents Analytics Matrix

Task id: `ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-MATRIX-01`

Verdict: `ACTIVE_ANALYTICS_MATRIX_READY`

This matrix aggregates the docs/contracts-only Analytics handoff packets for Big Five, Enneagram, and RIASEC. It does not implement analytics runtime code, emit events, backfill production metrics, score opportunities, call GSC/GA4/Baidu/IndexNow/Bing providers, mutate Search Channel, write CMS, publish, deploy, access private result data, mutate fap-api, or write generated readiness artifacts.

## Active Agents

| Agent | Scale | Packet | Analytics status | Runtime QA -> Analytics handoff |
| --- | --- | --- | --- | --- |
| `big_five_result_page` | `BIG5_OCEAN` | `BIG5-ANALYTICS-CONSUMPTION-PACKET-01` | `READY_TO_CONSUME_BY_ANALYTICS` | available |
| `enneagram_result_page` | `ENNEAGRAM` | `ENNEAGRAM-ANALYTICS-CONSUMPTION-PACKET-01` | `READY_TO_CONSUME_BY_ANALYTICS` | available |
| `riasec_result_page` | `RIASEC` | `RIASEC-ANALYTICS-CONSUMPTION-PACKET-01` | `READY_TO_CONSUME_BY_ANALYTICS` | available |

## Parked Placeholders

`MBTI`, `IQ_RAVEN`, and `EQ_60` remain `PARKED_PLACEHOLDER`. They are not part of this active Analytics integration except as parked references.

## Event Matrix

| Scale | Events |
| --- | --- |
| `BIG5_OCEAN` | `big5_result_view`, `big5_full_report_view`, `big5_report_module_view`, `big5_pdf_click`, `big5_share_event`, `big5_second_test_click`, `big5_returning_user_signal` |
| `ENNEAGRAM` | `enneagram_result_view`, `enneagram_full_report_view`, `enneagram_report_module_view`, `enneagram_share_summary_view`, `enneagram_second_test_click`, `enneagram_public_profile_click` |
| `RIASEC` | `riasec_result_view`, `riasec_full_report_view`, `riasec_report_module_view`, `riasec_career_exploration_click`, `riasec_share_summary_view`, `riasec_second_test_click` |

These event names are analytics-consumption vocabulary only. This PR does not add tracking code or event emission.

## Exclusion Matrix

Analytics quality reporting must exclude production activation smoke attempts, any `codex_probe_` anon/session/request prefixes, QA/synthetic attempts, fixtures, generated readiness artifacts, staging-only artifacts, internal previews, crawler/search/provider behavior, and private result/report URLs.

## Source Classification Matrix

| Source classification | Analytics use |
| --- | --- |
| `runtime_qa_artifact` | Allowed for read-only quality report inputs only. |
| `backend_authority` | Allowed by reference when already public-safe and handoff-scoped. |
| `fixture` | Excluded from production metric interpretation. |
| `generated_artifact` | Excluded unless separately authorized and explicitly public-safe. |
| `access_required` | Blocked for this train. |

## Hard Holds

- analytics runtime implementation
- event emission
- production metric backfill
- opportunity scoring
- GSC/GA4/Baidu/IndexNow/Bing provider calls
- Search Channel Queue mutation
- CMS write/import/publish/media upload
- deploy or revalidation
- private result access
- generated readiness artifact write
- fap-api mutation

## GSC / Opportunity / Search Channel Boundary

Opportunity scoring remains `HOLD` until `live_gsc_api_data_quality_passes`. No live provider calls were performed. Search Channel enqueue/approve/submit remains `HOLD` and requires a separate exact approval before any queue mutation.

## Next Safe Output

The next safe output is a future read-only analytics quality report from the `analytics_gsc_opportunity` agent. That report may compare public-safe readiness coverage from these packets, but it still must not emit events, backfill metrics, score opportunities, call providers, mutate Search Channel, write CMS, deploy, access private data, mutate fap-api, or write generated readiness artifacts.
