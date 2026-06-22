# Result Page Agent Platform Standard

Status: v1 docs/contracts proposal.

Scope: mandatory result-page agent standard for `MBTI`, `BIG5_OCEAN`, `RIASEC`, `IQ_RAVEN`, `EQ_60`, and `ENNEAGRAM`.

This standard is docs/contracts only. It does not implement result-page runtime code, write CMS, publish, submit search URLs, request indexing, change sitemap/robots/llms/schema/hreflang/generated SEO artifacts, mutate production DB/env/payment/order data, or access private result data.

## Why This Exists

Free Full Report Mode makes all six assessment result pages first-class product surfaces. The platform cannot treat only Big Five, Enneagram, and RIASEC as agent-operated result pages. MBTI, IQ Raven, and EQ60 also need dedicated result-page agents so result rendering, report access, PDF/share, analytics, privacy, and launch gates are operated uniformly.

## Required Scale Agents

| Scale | Agent ID | Frontend surface evidence | Current stack state |
|---|---|---|---|
| MBTI | `mbti_result_page` | `components/result/mbti/MbtiResultShell.tsx` | missing dedicated agent stack |
| BIG5_OCEAN | `big_five_result_page` | `components/result/big5/Big5ResultPageV2Shell.tsx` | existing backend asset agent; needs shared-standard alignment |
| RIASEC | `riasec_result_page` | `components/result/riasec/RiasecResultShell.tsx` | existing backend asset/ops agent; needs shared-standard alignment |
| IQ_RAVEN | `iq_raven_result_page` | `components/result/iq/IqResultShell.tsx` | missing dedicated agent stack |
| EQ_60 | `eq60_result_page` | `components/result/eq/EQResultV5.tsx` | missing dedicated agent stack |
| ENNEAGRAM | `enneagram_result_page` | `components/result/enneagram/EnneagramResultShell.tsx` | existing backend readiness/ops agent; needs shared-standard alignment |

Shared result route evidence:

- `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`
- `components/result/RichResultReport.tsx`
- `lib/api/v0_3.ts`

## Minimum Agent Contract

Every result-page agent must define:

- `agent_id`
- `scale_code`
- `canonical_test_slug`
- `result_route`
- `report_api`
- `report_access_api`
- `pdf_behavior`
- `share_behavior`
- `frontend_renderer`
- `backend_authority`
- `source_of_truth`
- `allowed_inputs`
- `allowed_outputs`
- `forbidden_actions`
- `evidence_labels`
- `output_artifacts`
- `checks`
- `stop_conditions`
- `human_approval_required`
- `current_readiness`
- `next_goal`

## Source-Of-Truth Rules

Use backend report payloads, content packs, scale registries, scoring/report services, and public projections as authority. fap-web renderers consume those contracts. Frontend fallback copy, local fixtures, screenshots, and generated artifacts are supporting evidence only.

Private result data, raw attempts, raw result IDs, payment/order data, account identifiers, and report tokens cannot be placed in public docs, SEO packages, search queues, sitemap/llms artifacts, or public profile assets.

## Required Checks

Each scale readiness artifact must include:

- JSON/schema validation for the readiness artifact.
- Route contract check for localized result route.
- Report API and report-access API contract check.
- Frontend renderer contract check.
- PDF/print private URL redaction check where PDF/print exists.
- Share surface public/private boundary check.
- Noindex/private indexing check for private result pages.
- Analytics event contract check with smoke-test exclusions.
- Claim/privacy/safety gate check.
- Source classification check: live public, backend authority, generated artifact, fixture, mock, unknown, or access-required.

## Readiness States

- `ready_readonly`: agent stack exists and can produce read-only readiness evidence.
- `existing_agent_stack_align_required`: agent stack exists but must align to this platform standard.
- `missing_agent_stack`: renderer/report foundations exist but no dedicated result-page agent stack exists.
- `blocked_missing_backend_authority`: cannot proceed because backend authority is missing or contradictory.
- `blocked_private_data_required`: cannot proceed without raw private result/order/payment data.
- `hold_exact_approval_required`: would need default-denied mutation.

## Hard HOLD Actions

Result-page agents must not perform:

- private result indexing
- raw private result access
- CMS write, import, publish, or media upload
- Search Channel enqueue, approve, or submit
- GSC Request Indexing
- Google Indexing API
- Baidu push
- IndexNow submit
- sitemap, robots, llms, schema, hreflang, canonical, redirect, or noindex mutation
- production DB/env change
- payment/order mutation
- deterministic career recommendation
- IQ/EQ diagnostic guarantee

## First-Week Result-Page Order

1. Freeze this shared standard.
2. Scaffold `mbti_result_page`.
3. Scaffold `iq_raven_result_page`.
4. Scaffold `eq60_result_page`.
5. Align `big_five_result_page`.
6. Align `enneagram_result_page`.
7. Align `riasec_result_page`.
8. Run six-scale read-only route/API/PDF/share/render/leak readiness review.

## Output Artifact

Each scale agent should emit a `result_page_agent_readiness` artifact matching `docs/result-page-agents/six-scale-result-agent-readiness.template.json`. The artifact must stay private or sanitized if it references live attempts, report URLs, account context, PDF URLs, or raw API payloads.

## Repository Rule Impact

This document defines a result-page agent contract only. It does not change frontend result rendering, backend report generation, CMS ownership, SEO enumeration, sitemap/llms output, schema/hreflang, or publishing behavior.
