# Enneagram Public Personality Claim Safety Packet

Task: `ENNEAGRAM-PUBLIC-PERSONALITY-CLAIM-SAFETY-PACKET-01`

Verdict: `READY_TO_BLOCK_UNSAFE_PUBLIC_PERSONALITY_OUTPUTS`

Mode: fap-web docs/contracts only. This packet creates no public personality content, generated pages, CMS package, CMS write, publish action, search submission, provider call, deployment, backend import, candidate activation, runtime mutation, event emission, production metric backfill, source ledger write, fap-api mutation, or private result access.

Dependency: `ENNEAGRAM-PUBLIC-PERSONALITY-HANDOFF-COMMON-CONTRACT-01` is merged in PR #1386 with merge commit `2f7deb6e3b594267ea1ade7c01bfbe3e8d749f21`.

Source authority dependency: `ENNEAGRAM-PUBLIC-PERSONALITY-SOURCE-AUTHORITY-PACKET-01` is merged in PR #1391 with merge commit `2436073c201f0ba79ae7f4c80c57a708e12dc0c7`; its verdict remains `MAPPED_PARTIAL`.

## Consumed Evidence

- `docs/result-page-agents/enneagram-safety-gate-consumption-packet.v1.json`
- `docs/result-page-agents/enneagram-runtime-qa-consumption-packet.v1.json`
- `docs/result-page-agents/enneagram-analytics-consumption-packet.v1.json`
- `docs/public-personality/enneagram-public-personality-handoff-common-contract.v1.json`
- `docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json`

## Public Personality Scope Assertions

- Hub planning: allowed after source and claim review.
- Nine core type planning: allowed after source and claim review.
- Centers or triads: conditional on backend source authority.
- Wings, instincts, subtypes, and 54 wing x instinct pages: blocked from the first scope.
- Private result profile rewrites and attempt-based profiles: blocked.

## Allowed Claim Classes

Allowed public-safe claim classes are reflective only: `self_understanding`, `personality_reflection`, `motivation_pattern_reflection`, `communication_reflection`, `method_boundary`, `non_diagnostic_note`, `public_summary`, and `public_projection`.

## Forbidden Claims

The Public Personality Content Agent must block final fixed type certainty, official fixed Enneagram type claims, unsupported psychometric superiority claims, diagnosis, treatment, therapy, hiring suitability, salary prediction, performance prediction, success prediction, relationship guarantee, life-outcome guarantee, most accurate type finality, score-based personality ranking, and private report text rewrites.

## Forbidden Inputs

Claim and privacy review must not consume attempt IDs, user IDs, raw scores, display scores, score vectors, dominance gaps, release hashes, registry hashes, content hashes, schema projection internal context, source refs, QA traces, editor notes, private report text, full private result payloads, private PDF or share payloads, report tokens, private result URLs, payment state, order state, benefit state, or hidden repair drafts.

## Safety Gate Authority

Safety Gate can block unsafe public personality outputs and report blocked actions. It cannot approve CMS, publish, search, deploy, runtime mutation, private data access, generated pages, backend import, candidate activation, provider calls, fap-api mutation, or production metric backfill.

## Blocked Public Personality Report Schema

Required fields:

- `blocked_output_type`
- `violated_claim_boundary`
- `evidence_ref`
- `source_classification`
- `replacement_safe_language`
- `required_follow_up`
- `approval_state`

Example blocked report state: `final_fixed_type_certainty_claim` is blocked; replacement safe language is `may_reflect_public_summary`; approval state is `blocked`.

## HOLD Actions

Still held: CMS, publish, search submission, provider calls, deploy, runtime instrumentation, public personality runtime mutation, generated pages, backend import, candidate activation, candidate payload generation, private data, private result text, event emission, production metric backfill, opportunity scoring, source ledger write, and fap-api mutation.

Negative guarantees: runtime code changed: no; CMS writes: none; generated pages: none; source ledger write: none; fap-api mutation: none; raw private result accessed: none.
