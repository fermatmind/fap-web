# Result Page Agent Analytics Handoff

Task: `RESULT-PAGE-AGENT-ANALYTICS-HANDOFF-01`

Status: docs/contracts and read-only analytics handoff only.

Verdict: `ANALYTICS_HANDOFF_READY_NO_RUNTIME_MUTATION`

## Safety Boundary

- runtime analytics mutation: none
- provider calls: none
- private payload emitted: none
- CMS writes: none
- production import: none
- rollout: none

This handoff defines analytics contract boundaries only. It does not change runtime tracking code, emit analytics events, call providers, write CMS, access private results, import production content, or roll out result-page behavior.

## Inputs

- `docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json`
- `docs/result-page-agents/six-hub-free-full-report-runtime-qa.v1.json`
- `docs/result-page-agents/result-page-agent-runtime-qa-handoff.v1.json`

## Allowed Event Classes

- `result_page_view`
- `result_module_view`
- `result_report_access_state`
- `result_pdf_action_intent`
- `result_share_action_intent`
- `result_compare_action_intent`
- `result_history_action_intent`
- `result_redaction_state`
- `result_error_boundary`

## Forbidden Private Payload Fields

- `attempt_id`
- `user_id`
- `account_id`
- `email`
- `phone`
- `report_token`
- `report_url`
- `raw_score`
- `raw_scores`
- `score_vector`
- `percentile`
- `answer_key`
- `responses`
- `selector_trace`
- `qa_trace`
- `source_refs`
- `private_result_payload`
- `payment_id`
- `order_id`

## Smoke-Test Exclusions

- no provider call
- no analytics runtime mutation
- no real user identifiers
- no raw private result payload
- no search submission
- no production import
- no rollout

## Per-Scale Analytics Readiness

| Scale | Agent | Analytics readiness | Allowed | Blocked |
|---|---|---|---|---|
| MBTI | `mbti_result_page` | `LIMITED_SCAFFOLD_ONLY` | shared public-safe result page event classes only | generated agent readiness analytics |
| BIG5_OCEAN | `big_five_result_page` | `READONLY_HANDOFF_CLEARED` | shared public-safe result page event classes only; plan full-report view, PDF click, share event, second-test, and returning-user metrics | runtime analytics mutation, private payload emission, pilot/runtime/production activation, CMS writes, and search mutation |
| RIASEC | `riasec_result_page` | `PRIORITY_READONLY_HANDOFF` | interest structure may be summarized as public-safe coarse labels | raw scores, vectors, percentiles, attempt/user/private report payload |
| IQ_RAVEN | `iq_raven_result_page` | `LIMITED_SCAFFOLD_ONLY` | shared public-safe result page event classes only | raw scores, answer key, diagnostic, school-placement, hiring, certification claims |
| EQ_60 | `eq60_result_page` | `LIMITED_SCAFFOLD_ONLY` | shared public-safe result page event classes only | raw scores, clinical, medical, hiring, success, guaranteed-outcome claims |
| ENNEAGRAM | `enneagram_result_page` | `READONLY_HANDOFF` | shared public-safe result page event classes only | private payload and generated readiness analytics until separately authorized |

## Big Five Analytics Handoff Plan

Status: `READY_READONLY_CLEARED_HANDOFF_ONLY`

Authority source: sanitized fap-api PR #2326/#2331 evidence only. No private result data was accessed.

Metric plan:

- `big5_full_report_view`: count public-safe Big Five full-report result views without attempt, user, raw score, percentile, selector trace, or private report URL fields.
- `big5_pdf_click`: count PDF intent/click events only after redaction state is public-safe.
- `big5_share_event`: count share intent events scoped to public-safe summaries.
- `big5_second_test`: plan second-test funnel attribution without private identifiers or deterministic recommendation output.
- `big5_returning_user`: plan returning-user/read-return signal only through aggregate, privacy-safe access state.

Smoke exclusion:

- exclude smoke/test/QA/synthetic artifacts
- exclude runs carrying test fixture markers
- exclude events with private identifiers or raw result payload fields
- exclude provider/search/deploy events

Holds:

- no pilot
- no runtime enablement
- no production rollout
- no CMS
- no search
- no private result data

## RIASEC Career Bridge Analytics Boundary

Allowed summary:

- public-safe interest structure label
- coarse result module impression
- redaction state
- share/PDF/history/compare intent without private identifiers

Forbidden emission:

- raw scores
- score vectors
- percentiles
- attempt id
- user id
- private report payload
- selector trace
- deterministic career recommendation
- admissions/hiring/salary/performance/success/ability guarantee

## Next Task

`RESULT-PAGE-AGENT-SEO-CONTROL-HANDOFF-01`

Allowed scope:

- private result noindex control handoff
- public hub/public explanation SEO boundary
- search/provider mutation prohibitions

Forbidden scope:

- sitemap mutation
- robots mutation
- llms mutation
- schema or JSON-LD mutation
- hreflang mutation
- Search Queue enqueue/approve/submit
- GSC/Baidu/IndexNow provider call

## Repository Rule Impact

This task adds an analytics handoff document, a JSON handoff artifact, and a contract test only. It does not change tracking runtime, event emission, frontend result rendering, backend report generation, CMS ownership, SEO enumeration, sitemap/llms output, schema/hreflang, publishing behavior, private route indexing behavior, payment/order flows, or environment configuration.
