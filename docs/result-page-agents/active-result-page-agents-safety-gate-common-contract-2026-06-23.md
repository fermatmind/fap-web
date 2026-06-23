# Active Result-Page Agents Safety Gate Common Contract

Task id: `ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-COMMON-CONTRACT-01`

Verdict: `READY_TO_CONSUME_COMMON_SAFETY_GATE_CONTRACT`

This contract defines the common Claim / Privacy / Safety Gate vocabulary for the three active result-page agents: Big Five, Enneagram, and RIASEC. It converts the completed Runtime QA and Analytics handoffs into a docs/contracts-only safety-gate boundary. It does not implement safety runtime code, analytics runtime code, event emission, production metric backfill, opportunity scoring, Search Channel mutation, provider calls, CMS writes, publishing, deployment, private-data access, or generated readiness artifact writes.

Negative guarantee summary: no safety runtime code, no analytics runtime code, no event emission, no opportunity scoring, no CMS, no publish, no search submission, no provider calls, no deploy, and no private-data access.

## Agent Boundary

| Role | Agent |
| --- | --- |
| Receiving agent | `claim_privacy_safety_gate` |
| Producing upstream | `runtime_qa` |
| Producing upstream | `analytics_gsc_opportunity` |
| Producing upstream | `big_five_result_page` |
| Producing upstream | `enneagram_result_page` |
| Producing upstream | `riasec_result_page` |

`MBTI`, `IQ_RAVEN`, and `EQ_60` remain `PARKED_PLACEHOLDER` and are not active Safety Gate integration targets in this train.

## Assertion Families

The Safety Gate common contract defines these assertion families:

- `unsupported_claim_gate`
- `private_result_boundary_gate`
- `analytics_payload_privacy_gate`
- `share_public_summary_gate`
- `pdf_private_print_gate`
- `public_private_content_separation_gate`
- `source_classification_gate`
- `hard_hold_action_gate`
- `smoke_exclusion_gate`
- `runtime_qa_to_analytics_safety_gate`
- `opportunity_scoring_hold_gate`
- `search_provider_hold_gate`
- `production_mutation_hold_gate`

## Claim Class Boundary

Allowed claim classes are limited to public-safe interpretation language: `self_understanding`, `personality_reflection`, `motivation_pattern_reflection`, `career_interest_exploration`, `communication_reflection`, `method_boundary`, `non_diagnostic_note`, `examples_only`, `public_summary`, and `public_projection`.

Forbidden claim classes include `diagnosis`, `treatment`, `therapy`, `clinical assessment`, `hiring screen`, `employment suitability guarantee`, `salary prediction`, `performance prediction`, `success prediction`, `admissions guarantee`, `ability measurement guarantee`, `deterministic career recommendation`, `final type certainty`, `official fixed type claim`, `IQ/EQ diagnostic guarantee`, `relationship guarantee`, `life outcome guarantee`, and `paid/official/certified guarantee unless backend authority explicitly supports it`.

## Private Field Boundary

The common denylist blocks `attempt_id`, `user_id`, `email`, `phone`, `account_id`, `report_token`, `private_url`, `raw_score`, `raw_scores`, `score_vector`, `dimension_vector`, `percentile`, `selector_trace`, `source_refs`, `qa_trace`, `editor_notes`, `private_report_payload`, `full_report_body_text`, `order_id`, `payment_id`, `benefit_grant_id`, `benefit_wallet_id`, `access_token`, `cookie`, `session_id`, `release_hash`, `registry_hash`, `content_hash`, `dominance_gap`, `answer_key`, `correct_answer`, `pdf_private_url`, `share_private_payload`, and `private_report_url`.

## Hard HOLD Actions

Safety Gate may block unsafe actions and report blocked actions. It must not approve default-denied action families. The common hard-HOLD assertions are: no CMS, no publish, no search submission, no provider calls, no deploy, no runtime instrumentation, no production metric backfill, no opportunity scoring, no Search Channel mutation, no generated readiness artifact write, no raw private data, no deterministic career recommendation, and no diagnosis/treatment/hiring/salary/outcome claims.

## Source Classification

Allowed source classifications are `backend_authority`, `fap_web_consumer_contract`, `runtime_qa_artifact`, `analytics_handoff_artifact`, `safety_gate_artifact`, `generated_artifact`, `fixture`, `mock`, `unknown`, and `access_required`. `unknown` and `access_required` must fail closed for approval decisions.

## Runtime QA And Analytics Bridge

Runtime QA and Analytics handoffs can be consumed as read-only evidence by Safety Gate. They do not authorize runtime enablement, analytics runtime implementation, event emission, production metric backfill, opportunity scoring, provider calls, Search Channel mutation, CMS writes, publishing, deployment, or private-data access.

The Safety Gate can block unsupported claims, private-data leaks, public/private content blending, and default-denied actions. It cannot approve CMS writes, publish, search submission, provider calls, deploy, runtime enablement, event emission, opportunity scoring, or private-data access.

## Repository Rule Impact

This PR is docs/contracts-only. It does not change content authority, frontend rendering, runtime behavior, CMS ownership, SEO/GEO enumeration, sitemap, robots, llms, schema, hreflang, canonical, noindex, payment/order behavior, or deploy readiness.
