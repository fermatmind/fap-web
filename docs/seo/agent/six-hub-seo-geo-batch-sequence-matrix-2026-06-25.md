# Six Hub SEO/GEO Batch Sequence Matrix

Task: `SIX-HUB-SEO-GEO-BATCH-SEQUENCE-MATRIX-01`

Verdict: `BATCH_SEQUENCE_MATRIX_READY_NO_RUNTIME_CHANGES`

This matrix sequences the six public assessment hub SEO/GEO package work into Batch 1, Batch 2, Batch 3, and cross-hub support guardrails. It consumes the readiness, claim/copy risk, and AEO/internal-link packets as evidence only. It does not authorize CMS package generation, CMS dry-run, CMS write, publish, runtime copy repair, frontend changes, backend API repair, search submission, provider calls, private result access, attempt creation, answer submission, deploy, or SEO artifact mutation.

## Batch Sequence

| Batch | Rank | Scales | Purpose |
| --- | ---: | --- | --- |
| `BATCH_1_REVIEW_FIRST_CORE_HUBS` | 1 | `MBTI, RIASEC, ENNEAGRAM` | Prepare review-first SEO/GEO/AEO architecture only for active free core hubs after claim/copy authority review. |
| `BATCH_2_BIG5_AUTHORITY_REPAIR` | 2 | `BIG5_OCEAN` | Resolve Big Five P1 commercial field authority conflict before any package or traffic amplification. |
| `BATCH_3_IQ_EQ_MANUAL_REVIEW` | 3 | `IQ_RAVEN, EQ_60` | Hold IQ and EQ until form authority and manual claim review are completed. |
| `CROSS_HUB_SUPPORT_GUARDRAILS` | 4 | `MBTI, BIG5_OCEAN, RIASEC, ENNEAGRAM, IQ_RAVEN, EQ_60` | Keep shared guardrails for visible FAQ/schema parity, link graph containment, analytics privacy, and indexability no-widening. |

## Scale Matrix

| Scale | Locales | Batch | Highest risk | Current package action | Exit gate |
| --- | --- | --- | --- | --- | --- |
| `MBTI` | `en, zh` | `BATCH_1_REVIEW_FIRST_CORE_HUBS` | `P2` | `REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE` | `FREE_FULL_REPORT_AUTHORITY_REVIEW_PASSED_WITH_VISIBLE_NON_CLINICAL_BOUNDARY` |
| `BIG5_OCEAN` | `en, zh` | `BATCH_2_BIG5_AUTHORITY_REPAIR` | `P1` | `HOLD_FOR_COMMERCIAL_FIELD_AUTHORITY_RECONCILIATION` | `BACKEND_COMMERCIAL_FIELD_AND_PUBLIC_FREE_FULL_REPORT_COPY_RECONCILED` |
| `RIASEC` | `en, zh` | `BATCH_1_REVIEW_FIRST_CORE_HUBS` | `P2` | `REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE` | `PAID_UNLOCK_EXAMPLES_ONLY_BOUNDARY_REVIEW_PASSED_WITH_NO_OUTCOME_GUARANTEE` |
| `ENNEAGRAM` | `en, zh` | `BATCH_1_REVIEW_FIRST_CORE_HUBS` | `P2` | `REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE` | `NON_DIAGNOSTIC_TYPE_PROBABILITY_BOUNDARY_REVIEW_PASSED` |
| `IQ_RAVEN` | `en, zh` | `BATCH_3_IQ_EQ_MANUAL_REVIEW` | `P2` | `HOLD_FOR_FORM_AUTHORITY_AND_MANUAL_CLAIM_REVIEW` | `FORM_AUTHORITY_PRESENT_AND_IQ_MANUAL_REVIEW_BOUNDARY_APPROVED` |
| `EQ_60` | `en, zh` | `BATCH_3_IQ_EQ_MANUAL_REVIEW` | `P2` | `HOLD_FOR_FORM_AUTHORITY_AND_MANUAL_CLAIM_REVIEW` | `FORM_AUTHORITY_PRESENT_AND_EQ_OUTCOME_CLAIM_BOUNDARY_APPROVED` |

## Route Matrix

| Scale | Locale | Batch | Package action | AEO decision |
| --- | --- | --- | --- | --- |
| `MBTI` | `en` | `BATCH_1_REVIEW_FIRST_CORE_HUBS` | `REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE` | `REVIEW_FIRST_ALLOWED_ONLY_AS_ARCHITECTURE_PACKET` |
| `MBTI` | `zh` | `BATCH_1_REVIEW_FIRST_CORE_HUBS` | `REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE` | `REVIEW_FIRST_ALLOWED_ONLY_AS_ARCHITECTURE_PACKET` |
| `BIG5_OCEAN` | `en` | `BATCH_2_BIG5_AUTHORITY_REPAIR` | `HOLD_FOR_COMMERCIAL_FIELD_AUTHORITY_RECONCILIATION` | `HARD_HOLD_NO_AEO_PACKAGE_UNTIL_CLAIM_COPY_REPAIR` |
| `BIG5_OCEAN` | `zh` | `BATCH_2_BIG5_AUTHORITY_REPAIR` | `HOLD_FOR_COMMERCIAL_FIELD_AUTHORITY_RECONCILIATION` | `HARD_HOLD_NO_AEO_PACKAGE_UNTIL_CLAIM_COPY_REPAIR` |
| `RIASEC` | `en` | `BATCH_1_REVIEW_FIRST_CORE_HUBS` | `REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE` | `REVIEW_FIRST_ALLOWED_ONLY_AS_ARCHITECTURE_PACKET` |
| `RIASEC` | `zh` | `BATCH_1_REVIEW_FIRST_CORE_HUBS` | `REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE` | `REVIEW_FIRST_ALLOWED_ONLY_AS_ARCHITECTURE_PACKET` |
| `ENNEAGRAM` | `en` | `BATCH_1_REVIEW_FIRST_CORE_HUBS` | `REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE` | `REVIEW_FIRST_ALLOWED_ONLY_AS_ARCHITECTURE_PACKET` |
| `ENNEAGRAM` | `zh` | `BATCH_1_REVIEW_FIRST_CORE_HUBS` | `REVIEW_FIRST_ARCHITECTURE_ONLY_NO_CMS_PACKAGE` | `REVIEW_FIRST_ALLOWED_ONLY_AS_ARCHITECTURE_PACKET` |
| `IQ_RAVEN` | `en` | `BATCH_3_IQ_EQ_MANUAL_REVIEW` | `HOLD_FOR_FORM_AUTHORITY_AND_MANUAL_CLAIM_REVIEW` | `HARD_HOLD_NO_AEO_PACKAGE_UNTIL_CLAIM_COPY_REPAIR` |
| `IQ_RAVEN` | `zh` | `BATCH_3_IQ_EQ_MANUAL_REVIEW` | `HOLD_FOR_FORM_AUTHORITY_AND_MANUAL_CLAIM_REVIEW` | `HARD_HOLD_NO_AEO_PACKAGE_UNTIL_CLAIM_COPY_REPAIR` |
| `EQ_60` | `en` | `BATCH_3_IQ_EQ_MANUAL_REVIEW` | `HOLD_FOR_FORM_AUTHORITY_AND_MANUAL_CLAIM_REVIEW` | `HARD_HOLD_NO_AEO_PACKAGE_UNTIL_CLAIM_COPY_REPAIR` |
| `EQ_60` | `zh` | `BATCH_3_IQ_EQ_MANUAL_REVIEW` | `HOLD_FOR_FORM_AUTHORITY_AND_MANUAL_CLAIM_REVIEW` | `HARD_HOLD_NO_AEO_PACKAGE_UNTIL_CLAIM_COPY_REPAIR` |

## Batch Rules

- Batch 1 is review-first architecture only for MBTI, RIASEC, and Enneagram; it is not CMS package generation.
- Batch 2 keeps Big Five held until commercial field authority and public free/full-report copy are reconciled.
- Batch 3 keeps IQ and EQ held until form authority and manual non-diagnostic claim review are complete.
- Cross-hub support is a guardrail overlay for visible FAQ/schema parity, internal-link containment, analytics privacy, and indexability no-widening.
- No batch may widen sitemap, llms, schema, hreflang, canonical, robots, noindex, or public route behavior inside this train.

## HOLD

No CMS package generation, CMS dry-run, CMS write, publish, runtime copy change, frontend runtime change, backend API repair, search submission, provider call, deploy, sitemap/llms/schema/hreflang/canonical/noindex mutation, private result or attempt access, attempt creation, or answer submission is authorized by this matrix.

## Repository Rule Impact

Docs/contracts-only. This PR records package sequencing and ledger state. It does not change content ownership, frontend runtime authority, CMS/backend authority, SEO/GEO enumeration, generated SEO artifacts, runtime behavior, deploy readiness, payment/order flows, or private result access.
