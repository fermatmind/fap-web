# Active Result Page Agents Runtime QA Common Contract

Task id: `ACTIVE-RESULT-PAGE-AGENTS-RUNTIME-QA-COMMON-CONTRACT-01`

Verdict: `READY_TO_CONSUME_COMMON_CONTRACT`

This contract defines how the Runtime QA Agent may consume already-merged read-only handoff evidence for the three active result-page agents: Big Five, Enneagram, and RIASEC. It is a docs/contracts-only integration layer. It does not implement runtime QA code, change public runtime behavior, deploy, publish, write CMS, submit search URLs, call providers, access private result payloads, or write generated readiness artifacts.

## Agent Boundary

| Role | Agent |
| --- | --- |
| Receiving agent | `runtime_qa` |
| Producing agent | `big_five_result_page` |
| Producing agent | `enneagram_result_page` |
| Producing agent | `riasec_result_page` |

`MBTI`, `IQ_RAVEN`, and `EQ_60` remain `PARKED_PLACEHOLDER`. They may appear only as parked references in aggregate Runtime QA planning and must not be promoted into the active Runtime QA integration train.

## Runtime QA Input Contract

Runtime QA may consume only public-safe, read-only evidence that is already represented by repository docs/contracts:

- result-page agent readiness and handoff artifacts
- route matrix evidence
- report API and report-access API contract evidence
- renderer dispatch evidence
- PDF/private print boundary evidence
- share public/private boundary evidence
- private result noindex evidence
- leak boundary evidence
- claim/privacy/safety gate evidence
- analytics smoke exclusion evidence
- sanitized fixture-render evidence
- fap-api authority references for RIASEC, read-only only

Runtime QA must not consume raw private attempts, private report URLs/tokens, account payloads, raw score vectors, answer keys, payment/order data, CMS drafts, provider responses, deploy state, or production database state.

## Assertion Vocabulary

| Assertion | Meaning |
| --- | --- |
| `route_contract` | The result-page route is mapped to the reviewed result-page agent and does not create a parallel public surface. |
| `report_api_contract` | The report API contract is represented by existing public-safe contract evidence and does not expose private payloads. |
| `report_access_api_contract` | The report-access API contract keeps token/account/private fields out of public artifacts. |
| `renderer_dispatch` | The result renderer dispatches only through the reviewed agent shell/component path. |
| `pdf_private_print_boundary` | PDF and private print behavior keeps private URLs, tokens, and raw data out of public/exported surfaces. |
| `share_public_private_boundary` | Share surfaces remain public-summary only and block private/internal fields. |
| `private_result_noindex_boundary` | Private result surfaces remain non-indexable and must not add canonical/schema/hreflang/search exposure. |
| `leak_boundary` | Runtime QA must fail closed if raw scores, private IDs, tokens, traces, payloads, or fallback content appear. |
| `claim_privacy_safety_gate` | Unsupported deterministic, diagnostic, hiring, salary, success, admission, ability, or life-outcome claims remain forbidden. |
| `analytics_smoke_exclusion_gate` | Analytics smoke evidence may record public-safe event classes only and must exclude private payloads. |

## Status Vocabulary

- `PASS`
- `PARTIAL`
- `HOLD`
- `BLOCKED`
- `READY_TO_CONSUME`
- `PARKED_PLACEHOLDER`

`READY_TO_CONSUME` means Runtime QA may read the packet as input for a future read-only Runtime QA report. It does not authorize runtime implementation, pilot activation, production rollout, CMS work, publish actions, search submission, provider calls, deployment, generated readiness artifacts, or private data access.

## Active Agent Rules

| Agent | Scale | Runtime QA common status | Required packet |
| --- | --- | --- | --- |
| `big_five_result_page` | `BIG5_OCEAN` | `READY_TO_CONSUME` after its dedicated packet proves the read-only share-safety blocker remains cleared | `BIG5-RUNTIME-QA-CONSUMPTION-PACKET-01` |
| `enneagram_result_page` | `ENNEAGRAM` | `READY_TO_CONSUME` after its dedicated packet proves public-share and public-personality boundaries | `ENNEAGRAM-RUNTIME-QA-CONSUMPTION-PACKET-01` |
| `riasec_result_page` | `RIASEC` | `READY_TO_CONSUME` after its dedicated packet consumes fap-api authority references read-only | `RIASEC-RUNTIME-QA-CONSUMPTION-PACKET-01` |

## Negative Guarantees

- no runtime code change
- no public runtime behavior change
- no CMS write, import, publish, unpublish, or media upload
- no search submission, indexing request, Search Channel Queue mutation, or provider call
- no deploy, production import, rollout, revalidation, or manual server operation
- no sitemap, robots, llms, schema, hreflang, canonical, noindex, generated SEO artifact, or generated readiness artifact mutation
- no raw private attempt, private result payload, private report URL/token/account payload, payment/order data, or env mutation
- no deterministic career recommendation
- no diagnosis, treatment, therapy, hiring, salary, performance, success, admission, ability, or life-outcome claim

## Stop Conditions

Runtime QA consumption must stop and report `BLOCKED` if a packet requires runtime implementation, fap-api mutation, CMS/search/provider/deploy access, private result payload access, generated readiness artifact writes, production data access, or a public authority substitution in fap-web.

## Next Train

The next PR must create the Big Five consumption packet only after this common contract is merged. Enneagram and RIASEC packets may proceed after this common contract, but each remains a separate docs/contracts-only PR.
