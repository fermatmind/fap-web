# RIASEC Runtime QA Consumption Packet

Date: 2026-06-23

Task: `RIASEC-RUNTIME-QA-CONSUMPTION-PACKET-01`

Verdict: `READY_TO_CONSUME_BY_RUNTIME_QA`

Run mode: docs/contracts only.

## Scope

This packet converts merged RIASEC read-only evidence into a Runtime QA-consumable packet in fap-web. fap-api remains a read-only evidence source only.

No runtime QA code, renderer behavior, CMS write, publish action, search submission, provider call, deploy, generated readiness artifact write, RIASEC import command, runtime wrapper enablement, career graph runtime mutation, or private result access was performed.

## Consumed Evidence

| Evidence | Status | Source |
| --- | --- | --- |
| Common Runtime QA contract | `MERGED` | `docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json` |
| RIASEC standard alignment | `RIASEC_RESULT_PAGE_AGENT_STANDARD_ALIGNED` | `docs/result-page-agents/riasec-result-page-agent-readiness.proposal.json` |
| Route/API/PDF/share review | `RIASEC_READONLY_ROUTE_API_PDF_SHARE_REVIEW_READY_WITH_RUNTIME_PRODUCTION_HOLDS` | `docs/result-page-agents/riasec-result-page-agent-readonly-route-api-pdf-share-review.v1.json` |
| Runtime QA handoff | `PRIORITY_HANDOFF_READY_READONLY` | `docs/result-page-agents/result-page-agent-runtime-qa-handoff.v1.json` |
| Analytics handoff | `PRIORITY_READONLY_HANDOFF` | `docs/result-page-agents/result-page-agent-analytics-handoff.v1.json` |
| fap-api runtime/career/analytics handoff | planning and handoff only | `fap-api:backend/docs/riasec/riasec-result-page-agent-runtime-career-analytics-handoff-2026-06-23.md` |

## Required Runtime QA Assertions

| Assertion | Status | Boundary |
| --- | --- | --- |
| `route_contract` | `PASS` | RIASEC remains one flagship under `holland-career-interest-test-riasec`; private result route stays `/[locale]/result/[id]`. |
| `report_api_contract` | `PASS` | `/api/v0.3/attempts/{attempt_id}/report` remains backend-authoritative and public-safe by reviewed projection. |
| `report_access_api_contract` | `PASS` | `/api/v0.3/attempts/{attempt_id}/report-access` remains fail-closed. |
| `renderer_dispatch` | `PASS` | `ResultClient -> RichResultReport -> RiasecResultShell`. |
| `pdf_private_print_boundary` | `PASS` | PDF/private print remains report-access governed, backend-authored, private/no-store, and redaction-contract covered. |
| `share_public_private_boundary` | `PASS` | Share is public-summary only: no full report blocks, private URLs, raw scores, vectors, or selector data. |
| `private_result_noindex_boundary` | `PASS` | No sitemap, llms, canonical, JSON-LD, hreflang, or search submit from private result URLs. |
| `leak_boundary` | `PASS` | Fail closed on raw scores, vectors, percentiles, selector traces, source/QA/editor metadata, private IDs, URLs, tokens, or secrets. |
| `claim_privacy_safety_gate` | `PASS` | Career bridge remains examples-only and blocks deterministic recommendation and outcome claims. |
| `analytics_smoke_exclusion_gate` | `PASS` | Public-safe coarse labels and shared result-page event classes only; no raw/private/runtime analytics mutation. |

## One-Flagship / Two-Form Boundary

- canonical landing: `holland-career-interest-test-riasec`
- supported forms: `riasec_60`, `riasec_140`
- parallel RIASEC stack introduced: no
- legacy 36Q surface allowed: no

## Career Graph Bridge Boundary

Allowed bridge language includes:

- examples to explore
- work activities that may be worth comparing
- career areas to learn about first
- majors or roles that often involve similar activity patterns
- use this as a starting point, not a decision

Forbidden bridge claims include:

- deterministic career recommendation
- best career for you
- guaranteed fit
- you should choose
- you will succeed
- hiring screen
- admissions decision
- salary prediction
- performance prediction
- success prediction
- ability measurement
- official Holland type determines your career
- low score means cannot do this

## Holds

- production import
- runtime wrapper enablement
- runtime enablement
- CMS
- search
- career graph runtime mutation
- deterministic career recommendation
- private result access
- generated readiness artifact write
- fap-api mutation
- provider call
- deploy
- rollout

## Negative Guarantees

- runtime code changed: no
- fap-api mutation: none
- RIASEC import command run: no
- runtime wrapper enabled: no
- career graph runtime mutation: none
- deterministic career recommendation added: no
- raw private result accessed: none
- CMS writes: none
- publishing: none
- search submissions: none
- provider calls: none
- deployment triggered: no
- generated readiness artifact written: no

## Next Safe Output

Runtime QA may later produce a read-only runtime QA report from this packet, but that later report requires separate authorization. This packet does not authorize production import, runtime wrapper enablement, CMS/search actions, deploy, provider calls, career graph runtime mutation, generated readiness artifact writes, or private result access.
