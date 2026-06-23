# Enneagram Runtime QA Consumption Packet

Task id: `ENNEAGRAM-RUNTIME-QA-CONSUMPTION-PACKET-01`

Verdict: `READY_TO_CONSUME_BY_RUNTIME_QA`

This packet lets the `runtime_qa` agent consume Enneagram result-page evidence after the common Runtime QA contract. It is read-only and docs/contracts-only. It does not generate candidate payloads, import, activate, switch runtime, modify public profile content, access raw private results, deploy, write CMS, publish, submit search URLs, call providers, or write generated readiness artifacts.

## Consumed Evidence

| Evidence | Source |
| --- | --- |
| Common Runtime QA contract | `docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json` |
| Enneagram standard alignment | `docs/result-page-agents/enneagram-result-page-agent-readiness.proposal.json` |
| Six-result route/API/PDF/share review | `docs/result-page-agents/six-result-page-agent-readonly-route-api-pdf-share-review.proposal.json` |
| Runtime QA handoff | `docs/result-page-agents/result-page-agent-runtime-qa-handoff.v1.json` |
| Analytics handoff | `docs/result-page-agents/result-page-agent-analytics-handoff.v1.json` |

The Enneagram result-page agent remains `ready_readonly`. Runtime QA may consume the mapped route, report API, report-access API, PDF, share, renderer, private noindex, leak, claim, and analytics boundaries as public-safe evidence only.

## Runtime QA Assertions

| Assertion | Status | Evidence |
| --- | --- | --- |
| `route_contract` | `PASS` | Shared private result route is mapped through `/[locale]/result/[id]`. |
| `report_api_contract` | `PASS` | Report API is mapped through `/api/v0.3/attempts/{attempt_id}/report`. |
| `report_access_api_contract` | `PASS` | Report-access API remains the unlock/PDF action boundary. |
| `renderer_dispatch` | `PASS` | Enneagram dispatch remains `ResultClient -> RichResultReport -> EnneagramResultShell`. |
| `pdf_private_print_boundary` | `PASS` | Existing Enneagram PDF surface and shared private print/redaction contracts remain the PDF boundary. |
| `share_public_private_boundary` | `PASS` | Share view model and telemetry remain public-summary scoped and block private/internal fields. |
| `private_result_noindex_boundary` | `PASS` | Private result surfaces remain noindex and private-print scoped. |
| `leak_boundary` | `PASS` | Runtime QA must fail closed on attempt IDs, scores, dominance gaps, release hashes, raw/internal metadata, private payloads, tokens, or fallback authority. |
| `claim_privacy_safety_gate` | `PASS` | Final type certainty, diagnosis, therapy, treatment, hiring, salary, performance, success, admission, ability, and life-outcome claims remain forbidden. |
| `analytics_smoke_exclusion_gate` | `PASS` | Analytics handoff allows shared public-safe result-page event classes only and keeps private payload/generated readiness analytics blocked. |

## Public Share And Personality Boundary

Enneagram public share surfaces may show public-safe summary language only. They must not expose:

- `attemptId`
- raw score or score vector
- dominance gap
- release hash
- raw/internal metadata
- private report text
- private result payload
- account, user, email, phone, token, order, or payment fields

Private result text must not become public personality content. Public personality follow-up remains separate from this Runtime QA packet.

## Holds

Enneagram remains `HOLD` for:

- candidate generation
- import
- activation
- runtime switch
- public profile content mutation
- CMS write/import/publish/media upload
- search submission, indexing request, Search Channel Queue mutation, or provider call
- private result access
- generated readiness artifact writes
- deploy, revalidation, production import, or rollout

## Runtime QA Output Boundary

The next safe Runtime QA output for this packet is a future read-only Runtime QA report. That report may cite this packet and assert public-safe coverage. It still must not fetch raw private attempts, generate candidate payloads, activate content, mutate runtime/CMS/search/provider state, or promote Enneagram beyond `ready_readonly`.
