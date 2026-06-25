# Six Hub SEO/GEO Claim Copy Risk Packet

Task: `SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01`

Verdict: `CLAIM_COPY_RISK_PACKET_READY_NO_RUNTIME_CHANGES`

This packet records claim/copy risk boundaries for the six public assessment hubs across zh/en routes. It consumes the common contract and readiness packet only. It does not authorize CMS dry-run, CMS write, runtime copy repair, frontend changes, backend API repair, search submission, provider calls, private result access, attempt creation, answer submission, deploy, or SEO artifact mutation.

## Risk Summary

| Scale | Locales | Highest risk | Risk category | Copy gate | Owner lane |
| --- | --- | --- | --- | --- | --- |
| `MBTI` | `en, zh` | `P2` | `FREE_FULL_REPORT_AUTHORITY_REVIEW` | `ALLOW_WITH_AUTHORITY_REVIEW_BEFORE_AMPLIFICATION` | `SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01` |
| `BIG5_OCEAN` | `en, zh` | `P1` | `COMMERCIAL_FIELD_AUTHORITY_CONFLICT_PLUS_PAID_UNLOCK_COPY` | `HOLD_FOR_SOURCE_AUTHORITY_RECONCILIATION_BEFORE_COPY_PACKAGE` | `BIG5-HUB-COMMERCIAL-FIELD-AUTHORITY-FIX-SCAN-01_AFTER_PACKAGE_TRAIN` |
| `RIASEC` | `en, zh` | `P2` | `FULL_RESULT_AND_PAID_UNLOCK_EXAMPLES_ONLY_BOUNDARY` | `ALLOW_ONLY_IF_PAID_UNLOCK_COPY_IS_EXAMPLE_BOUNDARY_NOT_PAYWALL_PROMISE` | `SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01` |
| `ENNEAGRAM` | `en, zh` | `P2` | `PAID_UNLOCK_COPY_AND_TYPE_CERTAINTY_BOUNDARY` | `ALLOW_ONLY_WITH_NON_DIAGNOSTIC_TYPE_PROBABILITY_BOUNDARY` | `SIX-HUB-SEO-GEO-CLAIM-COPY-RISK-PACKET-01` |
| `IQ_RAVEN` | `en, zh` | `P2` | `MANUAL_REVIEW_AND_FORM_AUTHORITY_GAP` | `HOLD_CLAIM_COPY_FIX_FOR_MANUAL_REVIEW_AND_FORM_AUTHORITY` | `IQ-EQ-HUB-CLAIM-MANUAL-REVIEW-PACKET-01_AFTER_PACKAGE_TRAIN` |
| `EQ_60` | `en, zh` | `P2` | `FORM_AUTHORITY_AND_OUTCOME_CLAIM_BOUNDARY` | `HOLD_CLAIM_COPY_FIX_FOR_FORM_AUTHORITY_AND_OUTCOME_CLAIM_BOUNDARY` | `IQ-EQ-HUB-CLAIM-MANUAL-REVIEW-PACKET-01_AFTER_PACKAGE_TRAIN` |

## Route Matrix

| Scale | Locale | Backend tier | Forms | Readiness claim risk notes | Copy gate |
| --- | --- | --- | ---: | --- | --- |
| `MBTI` | `en` | `FREE` | 2 | `P2_FULL_RESULT_CLAIM_AUTHORITY_REVIEW` | `ALLOW_WITH_AUTHORITY_REVIEW_BEFORE_AMPLIFICATION` |
| `MBTI` | `zh` | `FREE` | 2 | `P2_FULL_RESULT_CLAIM_AUTHORITY_REVIEW` | `ALLOW_WITH_AUTHORITY_REVIEW_BEFORE_AMPLIFICATION` |
| `BIG5_OCEAN` | `en` | `PAID` | 2 | `P1_COMMERCIAL_FIELD_AUTHORITY_CONFLICT_PLUS_P2_PAID_UNLOCK_COPY` | `HOLD_FOR_SOURCE_AUTHORITY_RECONCILIATION_BEFORE_COPY_PACKAGE` |
| `BIG5_OCEAN` | `zh` | `PAID` | 2 | `P1_COMMERCIAL_FIELD_AUTHORITY_CONFLICT_PLUS_P2_PAID_UNLOCK_COPY` | `HOLD_FOR_SOURCE_AUTHORITY_RECONCILIATION_BEFORE_COPY_PACKAGE` |
| `RIASEC` | `en` | `FREE` | 2 | `P2_FULL_RESULT_AND_PAID_UNLOCK_COPY_WITH_EXAMPLES_ONLY_BOUNDARY` | `ALLOW_ONLY_IF_PAID_UNLOCK_COPY_IS_EXAMPLE_BOUNDARY_NOT_PAYWALL_PROMISE` |
| `RIASEC` | `zh` | `FREE` | 2 | `P2_FULL_RESULT_AND_PAID_UNLOCK_COPY_WITH_EXAMPLES_ONLY_BOUNDARY` | `ALLOW_ONLY_IF_PAID_UNLOCK_COPY_IS_EXAMPLE_BOUNDARY_NOT_PAYWALL_PROMISE` |
| `ENNEAGRAM` | `en` | `FREE` | 2 | `P2_PAID_UNLOCK_COPY_AND_TYPE_CERTAINTY_BOUNDARY` | `ALLOW_ONLY_WITH_NON_DIAGNOSTIC_TYPE_PROBABILITY_BOUNDARY` |
| `ENNEAGRAM` | `zh` | `FREE` | 2 | `P2_PAID_UNLOCK_COPY_AND_TYPE_CERTAINTY_BOUNDARY` | `ALLOW_ONLY_WITH_NON_DIAGNOSTIC_TYPE_PROBABILITY_BOUNDARY` |
| `IQ_RAVEN` | `en` | `FREE` | 0 | `P2_IQ_MANUAL_REVIEW_AND_FORM_AUTHORITY_GAP` | `HOLD_CLAIM_COPY_FIX_FOR_MANUAL_REVIEW_AND_FORM_AUTHORITY` |
| `IQ_RAVEN` | `zh` | `FREE` | 0 | `P2_IQ_MANUAL_REVIEW_AND_FORM_AUTHORITY_GAP` | `HOLD_CLAIM_COPY_FIX_FOR_MANUAL_REVIEW_AND_FORM_AUTHORITY` |
| `EQ_60` | `en` | `FREE` | 0 | `P2_EQ_FORM_AUTHORITY_AND_OUTCOME_CLAIM_BOUNDARY` | `HOLD_CLAIM_COPY_FIX_FOR_FORM_AUTHORITY_AND_OUTCOME_CLAIM_BOUNDARY` |
| `EQ_60` | `zh` | `FREE` | 0 | `P2_EQ_FORM_AUTHORITY_AND_OUTCOME_CLAIM_BOUNDARY` | `HOLD_CLAIM_COPY_FIX_FOR_FORM_AUTHORITY_AND_OUTCOME_CLAIM_BOUNDARY` |

## Decisions

- `BIG5_OCEAN`: hard hold for source-authority reconciliation before any claim package or traffic amplification, because readiness recorded backend commercial tier `PAID` while public copy has free/full-report and paid/unlock signals.
- `IQ_RAVEN` and `EQ_60`: hard hold for manual claim review before copy repair because readiness recorded `backend_forms_count=0` while free/full-report or outcome-language risks remain visible.
- `MBTI`: may proceed only through authority review before AEO/GEO amplification; do not expand full-report claims without confirming free report contract authority.
- `RIASEC`: may proceed only if paid/unlock wording stays examples-only and does not imply guaranteed career outcomes or a parallel RIASEC authority stack.
- `ENNEAGRAM`: may proceed only with non-diagnostic, non-deterministic type language and bounded paid/unlock copy.

## Forbidden Claim Boundaries

### MBTI
- Do not imply every section is unlocked without validating the free report contract.
- Do not introduce paid-feature denial or entitlement copy from frontend assumptions.
- Do not use MBTI as a clinical, hiring, or deterministic identity claim.

### BIG5_OCEAN
- Do not claim the hub is purely free while backend commercial price tier remains PAID.
- Do not promise full free access or unlocked interpretation until source authority is reconciled.
- Do not paper over backend commercial authority with frontend or CMS copy.

### RIASEC
- Do not imply career outcomes, jobs, salaries, or admission/employment decisions are guaranteed.
- Do not turn example-based paid/unlock copy into a promise that all career graph content is free.
- Do not create a parallel RIASEC authority stack or frontend inference copy.

### ENNEAGRAM
- Do not state an Enneagram type as a permanent or medically validated diagnosis.
- Do not imply paid/unlock content is required to know a single certain type.
- Do not use relationship, workplace, or growth advice as deterministic prediction.

### IQ_RAVEN
- Do not claim a certified IQ score, clinical intelligence diagnosis, or official proctored result.
- Do not claim full report authority while backend forms count is zero.
- Do not imply school, employment, or medical decision suitability.

### EQ_60
- Do not guarantee emotional intelligence improvement, workplace success, relationship outcomes, or diagnosis.
- Do not claim full report authority while backend forms count is zero.
- Do not convert self-reflection guidance into mental-health or coaching certification claims.

## HOLD

No CMS package generation, CMS dry-run, CMS write, publish, runtime copy change, frontend runtime change, backend API repair, search submission, provider call, deploy, sitemap/llms/schema/hreflang/canonical/noindex mutation, private result or attempt access, attempt creation, or answer submission is authorized by this packet.

## Repository Rule Impact

Docs/contracts-only. This PR records claim/copy risk boundaries and ledger state. It does not change content ownership, frontend runtime authority, CMS/backend authority, SEO/GEO enumeration, generated SEO artifacts, runtime behavior, deploy readiness, payment/order flows, or private result access.
