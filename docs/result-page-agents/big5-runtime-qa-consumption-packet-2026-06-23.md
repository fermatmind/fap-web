# Big Five Runtime QA Consumption Packet

Task id: `BIG5-RUNTIME-QA-CONSUMPTION-PACKET-01`

Verdict: `READY_TO_CONSUME_BY_RUNTIME_QA`

This packet lets the `runtime_qa` agent consume Big Five result-page evidence after the common Runtime QA contract. It is read-only and docs/contracts-only. It does not implement runtime QA code, change the renderer, change runtime instrumentation, modify Big Five content, mutate fap-api, run backend artifact-writing commands, deploy, write CMS, publish, submit search URLs, call providers, access private result data, or write generated readiness artifacts.

## Consumed Evidence

| Evidence | Source |
| --- | --- |
| Common Runtime QA contract | `docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json` |
| Big Five readonly-cleared handoff | `docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff.v1.json` |
| Active readiness matrix | `docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json` |
| Runtime QA handoff | `docs/result-page-agents/result-page-agent-runtime-qa-handoff.v1.json` |
| Analytics handoff | `docs/result-page-agents/result-page-agent-analytics-handoff.v1.json` |

The historical Big Five share-safety blocker is cleared for read-only evidence only. The source handoff records `share_safety_missing_count=0`, `validation_error_count=0`, and `leak_hit_count=0` from sanitized fap-api PR #2326 and PR #2331 evidence.

## Runtime QA Assertions

| Assertion | Status | Evidence |
| --- | --- | --- |
| `route_contract` | `PASS` | Shared private result route is mapped through `/[locale]/result/[id]`. |
| `report_api_contract` | `PASS` | Report API is mapped through `/api/v0.3/attempts/{attempt_id}/report`. |
| `report_access_api_contract` | `PASS` | Report-access API remains the access-state boundary and must not expose token/account/private payload fields. |
| `renderer_dispatch` | `PASS` | Big Five dispatch remains `ResultClient -> RichResultReport -> Big5ResultPageV2Shell`. |
| `pdf_private_print_boundary` | `PASS` | Existing Big Five PDF rendered QA and shared private print/redaction contracts remain the PDF boundary. |
| `share_public_private_boundary` | `PASS` | Share surface is public-summary only; sanitized fap-api evidence clears the prior missing safety count. |
| `private_result_noindex_boundary` | `PASS` | Private result surfaces remain noindex and private-print scoped. |
| `leak_boundary` | `PASS` | Runtime QA must fail closed on raw OCEAN scores, score vectors, percentiles, private payloads, tokens, or fallback authority. |
| `claim_privacy_safety_gate` | `PASS` | Unsupported fixed-type, official 32-type, diagnosis, hiring, success, salary, performance, admission, ability, and life-outcome claims remain forbidden. |
| `analytics_smoke_exclusion_gate` | `PASS` | Analytics handoff excludes smoke/test/QA/synthetic artifacts and private fields. |

## Holds

Big Five remains `HOLD` for:

- pilot activation
- runtime enablement
- production rollout
- CMS write/import/publish/media upload
- search submission, indexing request, Search Channel Queue mutation, or provider call
- private result data access
- generated readiness artifact writes
- renderer changes
- runtime instrumentation changes
- Big Five content changes
- fap-api mutation

## Runtime QA Output Boundary

The next safe Runtime QA output for this packet is a future read-only Runtime QA report. That report may cite the packet and assert public-safe coverage. It still must not fetch raw private attempts, write generated readiness artifacts, trigger deploys, mutate CMS/search/provider state, or promote Big Five to pilot/runtime/production.
