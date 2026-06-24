# Big Five Methodology Claim / Privacy / Safety Packet

Task: `BIG5-METHODOLOGY-CLAIM-PRIVACY-SAFETY-PACKET-01`

Verdict: `SAFETY_PACKET_READY_FOR_PLANNING_ONLY`

This packet converts Big Five Runtime QA, Analytics, Safety Gate, common-contract, and source-authority evidence into a claim/privacy/safety planning gate for future methodology/trust/science work. It is docs/contracts-only. It does not generate methodology pages, trust pages, science articles, CMS packages, publishable body copy, title/meta copy, runtime changes, analytics instrumentation, search actions, provider calls, deploys, private-result access, backend asset-agent commands, or fap-api mutations.

## Dependency

`BIG5-METHODOLOGY-TRUST-SCIENCE-COMMON-CONTRACT-01` is merged through fap-web PR #1408, merge commit `b7f7f42c0bc341d2fa23f63f5bd6241c284d4389`.

## Consumed Evidence

- `docs/methodology-trust-science/big5-methodology-trust-science-common-contract.v1.json`
- `docs/methodology-trust-science/big5-methodology-source-authority-packet.v1.json`
- `docs/result-page-agents/big5-safety-gate-consumption-packet.v1.json`
- `docs/result-page-agents/big5-runtime-qa-consumption-packet.v1.json`
- `docs/result-page-agents/big5-analytics-consumption-packet.v1.json`
- `docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff.v1.json`

The evidence is consumed by reference only. The fap-api evidence remains read-only support and this PR does not run backend asset-agent commands or modify fap-api.

## Safe Claim Posture

Allowed claim families remain bounded to self-understanding, personality reflection, motivation pattern reflection, communication reflection, method boundaries, non-diagnostic notes, public summaries, public projections, and source-supported measurement caveats.

The packet blocks raw OCEAN score claims, score-vector exposure, percentile guarantees, official 32-type claims, fixed-type claims, unsupported psychometric superiority claims, diagnosis, treatment, therapy, hiring-screen claims, employment suitability guarantees, salary prediction, performance prediction, success prediction, admissions guarantees, ability guarantees, life-outcome guarantees, and paid/official/certified guarantees unless backend authority explicitly supports them.

## Privacy Boundary

Private Big Five result data cannot become public methodology/trust/science content. Raw OCEAN scores, score vectors, percentiles, attempt IDs, user/account identifiers, emails, phones, report tokens, private URLs, private result payloads, full report body text, selector traces, source refs, QA traces, editor notes, order/payment/benefit identifiers, access tokens, cookies, and sessions remain forbidden.

Share surfaces remain `PUBLIC_SUMMARY_ONLY`. The historical share-safety blocker is cleared only at the sanitized read-only evidence layer; that clearance does not authorize CMS, runtime, production, search, analytics emission, opportunity scoring, or metric backfill.

## Safety Gate Matrix

| Gate | Status | Required action |
| --- | --- | --- |
| `unsupported_claim_gate` | `PASS_FOR_PLANNING` | Block fixed type, official 32-type, unsupported superiority, diagnostic, treatment, therapy, hiring, salary, performance, success, admission, ability, and life-outcome claims. |
| `private_result_boundary_gate` | `PASS_FOR_PLANNING` | Block raw OCEAN scores, score vectors, percentiles, identifiers, report tokens, private URLs, private payloads, and full report body text. |
| `runtime_qa_leak_boundary_gate` | `PASS_FOR_PLANNING` | Treat route/API/renderer/PDF/share/noindex evidence as read-only QA boundary evidence, not runtime approval. |
| `analytics_payload_privacy_gate` | `PASS_FOR_PLANNING` | Allow analytics quality-report vocabulary only; block event emission, backfill, opportunity scoring, provider calls, and private payload fields. |
| `source_authority_gate` | `PASS_FOR_PLANNING` | Use source authority mapping for boundaries only; require CMS/backend ContentPage review before any public methodology/trust/science body or schema/search exposure. |
| `share_public_summary_gate` | `PASS_FOR_PLANNING` | Keep share surfaces public-summary only; sanitized share-safety clearance does not authorize CMS, runtime, production, or search. |
| `cms_contentpage_gate` | `HOLD` | Public ContentPage copy, FAQPage schema, title/meta, sitemap, llms, canonical, hreflang, and indexability remain held until separately approved. |

## Route Safety Policy

The six public routes remain CMS/backend ContentPage-authoritative:

- `/science`
- `/method-boundaries`
- `/item-design-notes`
- `/reliability-validity`
- `/data-privacy`
- `/common-misconceptions`

Each route stays `HOLD_FOR_CMS_REVIEW`. `FAQPage` remains disabled unless a visible CMS FAQ gate passes. This PR does not change route rendering, ContentPage behavior, schema, sitemap, llms, hreflang, canonical, noindex, or indexability.

## Negative Guarantees

No methodology pages were generated. No publishable body copy, final title/meta, CMS package, CMS write, CMS import, publish action, search submission, provider call, deploy, runtime mutation, analytics instrumentation, event emission, production metric backfill, opportunity scoring, private result access, backend asset-agent command, fap-api mutation, schema change, route change, sitemap change, llms change, hreflang change, canonical change, noindex change, or indexability change was performed.
