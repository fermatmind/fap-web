# Active Result Page Agents Analytics Common Contract

Task id: `ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-COMMON-CONTRACT-01`

Verdict: `READY_TO_CONSUME_COMMON_ANALYTICS_CONTRACT`

This contract defines how the Analytics / GSC Opportunity agent may consume public-safe handoff evidence from Runtime QA and the three active result-page agents: Big Five, Enneagram, and RIASEC. It is docs/contracts-only. It does not implement analytics runtime code, emit events, backfill production metrics, score opportunities, mutate Search Channel, call GSC/GA4/providers, write CMS, deploy, publish, access private result data, mutate fap-api, or write generated readiness artifacts.

## Agent Boundary

| Role | Agent |
| --- | --- |
| Receiving agent | `analytics_gsc_opportunity` |
| Upstream agent | `runtime_qa` |
| Upstream agent | `big_five_result_page` |
| Upstream agent | `enneagram_result_page` |
| Upstream agent | `riasec_result_page` |

`MBTI`, `IQ_RAVEN`, and `EQ_60` remain `PARKED_PLACEHOLDER`. They may appear only as parked references in aggregate analytics planning until each has a dedicated result-page agent packet.

## Event Family Vocabulary

- `result_view`
- `full_report_view`
- `report_module_view`
- `pdf_click`
- `share_event`
- `share_summary_view`
- `second_test_click`
- `returning_user_signal`
- `career_exploration_click`
- `public_profile_click`
- `method_boundary_click`

These names are vocabulary for future analytics consumption packets only. This PR does not add tracking code or event emission.

## Common Allowed Properties

Allowed properties are coarse and public-safe: `scale_code`, `agent_id`, `locale`, `surface`, `event_version`, `result_surface`, `report_access_state`, `access_state`, `is_full_report_unlocked`, `projection_version`, `quality_state`, `module_id`, `module_slot`, `bridge_entry`, `example_kind`, `redaction_state`, `source_classification`, `smoke_excluded`, and `qa_excluded`.

## Common Forbidden Properties

Analytics packets must not consume or emit attempt/user identifiers, contact/account data, report tokens, private URLs, raw scores, score vectors, percentiles, selector traces, source refs, QA traces, editor notes, private report payloads, full report body text, payment/order data, benefit IDs, access tokens, cookies, session IDs, release/registry/content hashes, dominance gap, answer keys, or correct answers.

## Smoke, QA, And Synthetic Exclusions

Analytics-ready packets must exclude production activation smoke attempts, any `codex_probe_` anon/session/request prefixes, QA/synthetic attempts, fixtures, generated readiness artifacts, staging-only artifacts, internal previews, crawler/search/provider behavior, and private result/report URLs.

## Source Classification

Allowed source classifications are `live_public`, `backend_authority`, `runtime_qa_artifact`, `analytics_observation`, `generated_artifact`, `fixture`, `mock`, `unknown`, and `access_required`.

Only `live_public`, `backend_authority`, and `runtime_qa_artifact` can support future read-only analytics quality reporting. `generated_artifact`, `fixture`, `mock`, `unknown`, and `access_required` must not unlock opportunity scoring.

## Active Agent Rules

| Agent | Scale | Analytics common status | Required packet |
| --- | --- | --- | --- |
| `big_five_result_page` | `BIG5_OCEAN` | `READY_TO_CONSUME` | `BIG5-ANALYTICS-CONSUMPTION-PACKET-01` |
| `enneagram_result_page` | `ENNEAGRAM` | `READY_TO_CONSUME` | `ENNEAGRAM-ANALYTICS-CONSUMPTION-PACKET-01` |
| `riasec_result_page` | `RIASEC` | `READY_TO_CONSUME` | `RIASEC-ANALYTICS-CONSUMPTION-PACKET-01` |

## Negative Guarantees

- no analytics runtime code change
- no event emission
- no production metric backfill
- no opportunity scoring
- no GSC, GA4, Search Console, Baidu, IndexNow, crawler, or provider call
- no Search Channel Queue mutation
- no CMS write, import, publish, unpublish, or media upload
- no deploy, revalidation, staging wait, or server operation
- no private result payload, private report URL/token, account payload, env, payment, or order access
- no fap-api mutation
- no generated readiness artifact write

## Stop Conditions

Analytics consumption must stop and report `BLOCKED` if a packet requires analytics runtime implementation, event emission, production metric backfill, opportunity scoring, provider access, Search Channel mutation, CMS/deploy access, private result payload access, fap-api mutation, or generated readiness artifact writes.

## Next Train

The next PR must create the Big Five analytics consumption packet after this common contract is merged. Enneagram and RIASEC packets may also proceed after this common contract, but each remains a separate docs/contracts-only PR.
