# RIASEC Safety Gate Consumption Packet

Task id: `RIASEC-SAFETY-GATE-CONSUMPTION-PACKET-01`

Verdict: `READY_TO_CONSUME_BY_SAFETY_GATE`

This packet lets `claim_privacy_safety_gate` consume the RIASEC Runtime QA and Analytics packets as read-only evidence. It references fap-api Career Graph bridge authority only as read-only planning and handoff evidence. It does not implement safety runtime code, analytics runtime code, event emission, production metric backfill, opportunity scoring, Search Channel mutation, provider calls, CMS writes, publishing, deployment, private-data access, fap-api mutation, RIASEC import commands, runtime wrapper enablement, Career Graph runtime mutation, deterministic career recommendations, or generated readiness artifact writes.

## Consumed Evidence

| Evidence | Status |
| --- | --- |
| Safety Gate common contract | `READY_TO_CONSUME_COMMON_SAFETY_GATE_CONTRACT` |
| RIASEC standard alignment | `RIASEC_RESULT_PAGE_AGENT_STANDARD_ALIGNED` |
| RIASEC readonly route/API/PDF/share review | `RIASEC_READONLY_ROUTE_API_PDF_SHARE_REVIEW_READY_WITH_RUNTIME_PRODUCTION_HOLDS` |
| RIASEC Runtime QA packet | `READY_TO_CONSUME_BY_RUNTIME_QA` |
| RIASEC Analytics packet | `READY_TO_CONSUME_BY_ANALYTICS` |
| fap-api handoff scope | `planning_and_handoff_packet_only` |
| Career bridge policy | `examples_only_not_recommendations` |

RIASEC remains one flagship under `holland-career-interest-test-riasec` with two supported forms: `riasec_60` and `riasec_140`. This clearance does not authorize production import, runtime wrapper enablement, runtime, production, CMS, search, private-data access, event emission, backfill, opportunity scoring, Career Graph runtime mutation, provider calls, deploy, generated readiness artifact writes, or fap-api mutation.

## Safety Assertions

| Assertion | Status | Boundary |
| --- | --- | --- |
| `unsupported_claim_gate` | `PASS` | Blocks deterministic career recommendation, best-career, guaranteed-fit, you-should-choose, admissions, hiring, salary, performance, success, ability, official Holland type, and life-outcome claims. |
| `private_result_boundary_gate` | `PASS` | Blocks raw RIASEC scores, score vectors, dimension vectors, percentiles, selector traces, share blocks, metadata, private IDs, private URLs, tokens, secrets, private payloads, and payment/order identifiers. |
| `analytics_payload_privacy_gate` | `PASS` | Analytics readiness permits public-safe coarse interest labels and read-only quality planning only, not event emission, backfill, opportunity scoring, deterministic recommendations, or private payloads. |
| `share_public_summary_gate` | `PASS` | Share remains public-summary only. |
| `pdf_private_print_gate` | `PASS` | PDF and private print remain report-access governed and private-safe. |
| `public_private_content_separation_gate` | `PASS` | Private RIASEC result/report/history/payment surfaces do not become public SEO, sitemap, llms, canonical, JSON-LD, hreflang, or search-submission authority. |
| `source_classification_gate` | `PASS` | fap-api Career Graph bridge evidence is read-only planning evidence, not runtime mutation authority. |
| `hard_hold_action_gate` | `PASS` | Production import, runtime wrapper enablement, runtime, CMS, search, Career Graph runtime mutation, deterministic recommendations, private data, event emission, backfill, opportunity scoring, provider calls, generated writes, deploy, rollout, and fap-api mutation remain held. |
| `smoke_exclusion_gate` | `PASS` | Smoke/test/QA/synthetic, fixture, generated, staging-only, provider/search/deploy, and private URL observations are excluded from approval. |
| `runtime_qa_to_analytics_safety_gate` | `PASS` | Runtime QA plus Analytics readiness can feed a read-only Safety Gate report only. |
| `opportunity_scoring_hold_gate` | `PASS` | Opportunity scoring and production metric backfill remain blocked. |
| `search_provider_hold_gate` | `PASS` | Search submission, Search Channel mutation, crawler/provider calls, GSC, Baidu, and IndexNow remain blocked. |
| `production_mutation_hold_gate` | `PASS` | No production import, runtime wrapper enablement, Career Graph runtime mutation, generated write, deploy, rollout, or fap-api mutation is authorized. |

## Claim Boundary

Allowed RIASEC claim classes are public-safe and exploratory: `self_understanding`, `career_interest_exploration`, `method_boundary`, `non_diagnostic_note`, `examples_only`, `public_summary`, and `public_projection`.

Forbidden RIASEC claim classes include deterministic career recommendation, `best career for you`, guaranteed fit, `you should choose`, `you will succeed`, hiring prediction, hiring screen, admissions decision, salary prediction, performance prediction, success prediction, ability measurement, life-outcome guarantee, `official Holland type determines your career`, and `low score means cannot do this`.

## Private Field Boundary

Safety Gate must block `attempt_id`, `user_id`, `account_id`, `email`, `phone`, `raw_score`, `raw_scores`, `score_vector`, `dimension_vector`, `percentile`, `selector_trace`, `share_block`, `source_refs`, `qa_trace`, `editor_notes`, `private_url`, `report_token`, `token`, `secret`, `private_result_payload`, `full_report_body_text`, `payment_id`, `order_id`, `access_token`, `cookie`, and `session_id`.

## Career Graph Boundary

Career bridge language is examples-only. Allowed language includes `examples to explore`, `work activities that may be worth comparing`, `career areas to learn about first`, `majors or roles that often involve similar activity patterns`, and `use this as a starting point, not a decision`.

Forbidden Career Graph inputs include raw item answers, raw scores, score vectors, percentiles, selector trace, private attempt ID or user ID, payment/report-access/order state, unreviewed CMS text, frontend fallback copy, hidden editor notes, source notes, QA metadata, and repair drafts.

## HOLD Boundary

RIASEC remains HOLD for production import, runtime wrapper enablement, runtime enablement, CMS, search, Career Graph runtime mutation, deterministic career recommendation, private result access, event emission, production metric backfill, opportunity scoring, provider calls, Search Channel mutation, generated readiness artifact writes, fap-api mutation, deploy, rollout, and default-denied action approval.

Next safe output: `read_only_riasec_safety_report`, requiring separate authorization.
