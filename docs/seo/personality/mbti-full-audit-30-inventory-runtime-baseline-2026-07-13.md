# MBTI-FULL-AUDIT-30 Chinese Asset Inventory And Runtime Baseline

- Final decision: `PASS_MBTI_FULL_AUDIT_30_BASELINE_READY`
- Generated at: `2026-07-13T03:18:42.845Z`
- Scope: 52 zh-CN public URLs (32 Profile, 16 A/T comparison, 4 hot cross-type comparison).
- Content repair: 43
- Verify-only: 9
- Runtime repair attention: 52
- API reads above 10 seconds: 39
- Existing GSC evidence: 9; external evidence pending: 43.

## Routing

| Group | Next task | URL count |
| --- | --- | ---: |
| NT Profile | MBTI-PROFILE-NT-31 | 8 |
| NF Profile | MBTI-PROFILE-NF-32 | 8 |
| SJ Profile | MBTI-PROFILE-SJ-33 | 8 |
| SP Profile | MBTI-PROFILE-SP-34 | 8 |
| A/T comparison | MBTI-COMP-AT-35 | 16 |
| Hot cross-type | MBTI-FULL-QA-36 verify-only | 4 |

## Records

| URL | Kind | Content status | Runtime status | API ms | GSC evidence |
| --- | --- | --- | --- | ---: | --- |
| /zh/personality/intj-a | profile | needs_content_repair | needs_runtime_repair | 22883 | external_evidence_pending |
| /zh/personality/intj-t | profile | needs_content_repair | needs_runtime_repair | 6359 | external_evidence_pending |
| /zh/personality/intp-a | profile | needs_content_repair | needs_runtime_repair | 13939 | external_evidence_pending |
| /zh/personality/intp-t | profile | needs_content_repair | needs_runtime_repair | 25066 | external_evidence_pending |
| /zh/personality/entj-a | profile | needs_content_repair | needs_runtime_repair | 25705 | external_evidence_pending |
| /zh/personality/entj-t | profile | needs_content_repair | needs_runtime_repair | 12990 | external_evidence_pending |
| /zh/personality/entp-a | profile | needs_content_repair | needs_runtime_repair | 12448 | external_evidence_pending |
| /zh/personality/entp-t | profile | needs_content_repair | needs_runtime_repair | 6162 | external_evidence_pending |
| /zh/personality/infj-a | profile | needs_content_repair | needs_runtime_repair | 11538 | external_evidence_pending |
| /zh/personality/infj-t | profile | needs_content_repair | needs_runtime_repair | 17907 | external_evidence_pending |
| /zh/personality/infp-a | profile | needs_content_repair | needs_runtime_repair | 16295 | external_evidence_pending |
| /zh/personality/infp-t | profile | needs_content_repair | needs_runtime_repair | 21717 | external_evidence_pending |
| /zh/personality/enfj-a | profile | needs_content_repair | needs_runtime_repair | 18527 | external_evidence_pending |
| /zh/personality/enfj-t | profile | needs_content_repair | needs_runtime_repair | 28080 | external_evidence_pending |
| /zh/personality/enfp-a | profile | needs_content_repair | needs_runtime_repair | 17320 | external_evidence_pending |
| /zh/personality/enfp-t | profile | needs_content_repair | needs_runtime_repair | 18238 | external_evidence_pending |
| /zh/personality/istj-a | profile | verify_only | needs_runtime_repair | 19323 | captured_existing_cohort |
| /zh/personality/istj-t | profile | needs_content_repair | needs_runtime_repair | 20359 | external_evidence_pending |
| /zh/personality/isfj-a | profile | needs_content_repair | needs_runtime_repair | 12236 | external_evidence_pending |
| /zh/personality/isfj-t | profile | needs_content_repair | needs_runtime_repair | 17296 | external_evidence_pending |
| /zh/personality/estj-a | profile | needs_content_repair | needs_runtime_repair | 14182 | external_evidence_pending |
| /zh/personality/estj-t | profile | needs_content_repair | needs_runtime_repair | 17993 | external_evidence_pending |
| /zh/personality/esfj-a | profile | verify_only | needs_runtime_repair | 16220 | captured_existing_cohort |
| /zh/personality/esfj-t | profile | needs_content_repair | needs_runtime_repair | 20092 | external_evidence_pending |
| /zh/personality/istp-a | profile | verify_only | needs_runtime_repair | 15608 | captured_existing_cohort |
| /zh/personality/istp-t | profile | needs_content_repair | needs_runtime_repair | 22769 | external_evidence_pending |
| /zh/personality/isfp-a | profile | verify_only | needs_runtime_repair | 22561 | captured_existing_cohort |
| /zh/personality/isfp-t | profile | needs_content_repair | needs_runtime_repair | 15537 | external_evidence_pending |
| /zh/personality/estp-a | profile | needs_content_repair | needs_runtime_repair | 18515 | external_evidence_pending |
| /zh/personality/estp-t | profile | needs_content_repair | needs_runtime_repair | 11789 | external_evidence_pending |
| /zh/personality/esfp-a | profile | needs_content_repair | needs_runtime_repair | 21619 | external_evidence_pending |
| /zh/personality/esfp-t | profile | needs_content_repair | needs_runtime_repair | 27654 | external_evidence_pending |
| /zh/personality/intj-a-vs-intj-t | at_comparison | needs_content_repair | needs_runtime_repair | 43144 | external_evidence_pending |
| /zh/personality/intp-a-vs-intp-t | at_comparison | verify_only | needs_runtime_repair | 40854 | captured_existing_cohort |
| /zh/personality/entj-a-vs-entj-t | at_comparison | needs_content_repair | needs_runtime_repair | 23704 | external_evidence_pending |
| /zh/personality/entp-a-vs-entp-t | at_comparison | needs_content_repair | needs_runtime_repair | 16655 | external_evidence_pending |
| /zh/personality/infj-a-vs-infj-t | at_comparison | needs_content_repair | needs_runtime_repair | 7163 | external_evidence_pending |
| /zh/personality/infp-a-vs-infp-t | at_comparison | needs_content_repair | needs_runtime_repair | 15271 | external_evidence_pending |
| /zh/personality/enfj-a-vs-enfj-t | at_comparison | needs_content_repair | needs_runtime_repair | 9804 | external_evidence_pending |
| /zh/personality/enfp-a-vs-enfp-t | at_comparison | needs_content_repair | needs_runtime_repair | 9059 | external_evidence_pending |
| /zh/personality/istj-a-vs-istj-t | at_comparison | needs_content_repair | needs_runtime_repair | 9212 | external_evidence_pending |
| /zh/personality/isfj-a-vs-isfj-t | at_comparison | needs_content_repair | needs_runtime_repair | 6454 | external_evidence_pending |
| /zh/personality/estj-a-vs-estj-t | at_comparison | needs_content_repair | needs_runtime_repair | 6704 | external_evidence_pending |
| /zh/personality/esfj-a-vs-esfj-t | at_comparison | needs_content_repair | needs_runtime_repair | 7828 | external_evidence_pending |
| /zh/personality/istp-a-vs-istp-t | at_comparison | needs_content_repair | needs_runtime_repair | 11479 | external_evidence_pending |
| /zh/personality/isfp-a-vs-isfp-t | at_comparison | needs_content_repair | needs_runtime_repair | 12154 | external_evidence_pending |
| /zh/personality/estp-a-vs-estp-t | at_comparison | needs_content_repair | needs_runtime_repair | 13800 | external_evidence_pending |
| /zh/personality/esfp-a-vs-esfp-t | at_comparison | needs_content_repair | needs_runtime_repair | 10328 | external_evidence_pending |
| /zh/personality/intj-vs-intp | cross_type_comparison | verify_only | needs_runtime_repair | 7973 | captured_existing_cohort |
| /zh/personality/entj-vs-intj | cross_type_comparison | verify_only | needs_runtime_repair | 5247 | captured_existing_cohort |
| /zh/personality/infj-vs-infp | cross_type_comparison | verify_only | needs_runtime_repair | 7369 | captured_existing_cohort |
| /zh/personality/istj-vs-isfj | cross_type_comparison | verify_only | needs_runtime_repair | 2966 | captured_existing_cohort |

This is a read-only baseline. It does not write CMS content, alter indexability, change sitemap/LLMS runtime output, deploy, submit to GSC, or store credentials.
