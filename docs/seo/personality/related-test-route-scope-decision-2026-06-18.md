# MBTI64 Related Test Route Scope Decision

## Summary
- Artifact: MBTI64-RELATED-TEST-ROUTE-SCOPE-DECISION-01
- Source PR: #1186
- V2 QA status: conditional
- Warning under review: Big Five / RIASEC related_test links omitted
- Final status: pass
- Operator decision needed: false
- Recommended resolution: Use verified safe public related_test routes in a V2.1 content package patch.
- Recommended next task: MBTI64-CONTENT-PACKAGE-V2.1-RELATED-TEST-LINK-PATCH-01-GPT55

This PR did not import CMS drafts, publish pages, change sitemap, change llms, change llms-full, change frontend rendering, or submit search URLs.

## Route Candidates
| route | locale | route_type | public | test | sitemap | llms | safe |
| --- | --- | --- | --- | --- | --- | --- | --- |
| /en/tests/big-five-personality-test | en | big_five | yes | yes | no | unknown | unknown |
| /en/tests/big-five-personality-test-ocean-model | en | big_five | yes | yes | yes | unknown | yes |
| /en/tests/big-five-personality-test-ocean-model/take | en | big_five | yes | yes | no | unknown | unknown |
| /en/tests/big-five-personality-test-ocean-model/take?form=big5_90&utm_source=organic | en | big_five | yes | yes | no | unknown | unknown |
| /en/tests/big-five-personality-test-ocean-model/technical-note | en | big_five | yes | yes | no | unknown | unknown |
| /en/tests/big-five-personality-test/take | en | big_five | yes | yes | no | unknown | unknown |
| /en/tests/big-five-personality-test/take?utm_source=google | en | big_five | yes | yes | no | unknown | unknown |
| /en/tests/career-riasec | en | riasec | yes | yes | no | unknown | unknown |
| /en/tests/holland-career-interest-test-riasec | en | riasec | yes | yes | yes | unknown | yes |
| /en/tests/holland-career-interest-test-riasec/take | en | riasec | yes | yes | no | unknown | unknown |
| /en/tests/holland-career-interest-test-riasec/take?form=riasec_140 | en | riasec | yes | yes | no | unknown | unknown |
| /en/tests/holland-career-interest-test-riasec/take?form=riasec_60 | en | riasec | yes | yes | no | unknown | unknown |
| /en/tests/holland-career-interest-test-riasec/technical-note | en | riasec | yes | yes | no | unknown | unknown |
| /tests/${CAREER_DISPLAY_RIASEC_TEST_SLUG} | unknown | riasec | yes | yes | no | unknown | unknown |
| /tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}/take | unknown | big_five | yes | yes | no | unknown | unknown |
| /tests/big-five-personality-test | unknown | big_five | yes | yes | no | unknown | unknown |
| /tests/big-five-personality-test-ocean-model | unknown | big_five | yes | yes | yes | unknown | unknown |
| /tests/big5-ocean | unknown | big_five | yes | yes | no | unknown | unknown |
| /tests/big5-ocean-test | unknown | big_five | yes | yes | no | unknown | unknown |
| /tests/career-interest-test | unknown | career | yes | yes | no | unknown | unknown |
| /tests/career-riasec | unknown | riasec | yes | yes | no | unknown | unknown |
| /tests/career-tests-riasec | unknown | riasec | yes | yes | no | unknown | unknown |
| /tests/holland-career-interest-test-riasec | unknown | riasec | yes | yes | yes | unknown | unknown |
| /tests/holland-career-interest-test-riasec/take | unknown | riasec | yes | yes | no | unknown | unknown |
| /tests/holland-career-interest-test-riasec/technical-note | unknown | riasec | yes | yes | no | unknown | unknown |
| /tests/holland-code-career-test | unknown | holland | yes | yes | no | unknown | unknown |
| /tests/riasec | unknown | riasec | yes | yes | no | unknown | unknown |
| /tests/riasec-test | unknown | riasec | yes | yes | no | unknown | unknown |
| /tests/RiasecLandingSurfaceSections | unknown | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/big-five-personality-test | zh | big_five | yes | yes | no | unknown | unknown |
| /zh/tests/big-five-personality-test-ocean-model | zh | big_five | yes | yes | yes | unknown | yes |
| /zh/tests/big-five-personality-test-ocean-model/take | zh | big_five | yes | yes | no | unknown | unknown |
| /zh/tests/big-five-personality-test-ocean-model/take?form=big5_120 | zh | big_five | yes | yes | no | unknown | unknown |
| /zh/tests/big-five-personality-test-ocean-model/take?form=big5_90 | zh | big_five | yes | yes | no | unknown | unknown |
| /zh/tests/big-five-personality-test-ocean-model/technical-note | zh | big_five | yes | yes | no | unknown | unknown |
| /zh/tests/career-riasec | zh | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/holland-career-interest-test-riasec | zh | riasec | yes | yes | yes | unknown | yes |
| /zh/tests/holland-career-interest-test-riasec? | zh | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/holland-career-interest-test-riasec?token=redacted | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec?token=secret | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec/history | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec/orders | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec/pay | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec/payment | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec/result | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec/share | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec/take | zh | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/holland-career-interest-test-riasec/take? | zh | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/holland-career-interest-test-riasec/take?form=riasec_140 | zh | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/holland-career-interest-test-riasec/take?form=riasec_60 | zh | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/holland-career-interest-test-riasec/take?payment_recovery_token=redacted&utm_source=seo | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec/take?payment_recovery_token=secret&utm_source=seo | zh | riasec | yes | yes | no | unknown | no |
| /zh/tests/holland-career-interest-test-riasec/take?utm_source=baidu | zh | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/holland-career-interest-test-riasec/take?utm_source=codex_qa | zh | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/holland-career-interest-test-riasec/take?utm_source=codex_qa&email=person%40example.com | zh | riasec | yes | yes | no | unknown | unknown |
| /zh/tests/holland-career-interest-test-riasec/technical-note | zh | riasec | yes | yes | no | unknown | unknown |

## Safe Public Routes
| route | locale | route_type | sitemap | llms |
| --- | --- | --- | --- | --- |
| /en/tests/big-five-personality-test-ocean-model | en | big_five | yes | unknown |
| /en/tests/holland-career-interest-test-riasec | en | riasec | yes | unknown |
| /zh/tests/big-five-personality-test-ocean-model | zh | big_five | yes | unknown |
| /zh/tests/holland-career-interest-test-riasec | zh | riasec | yes | unknown |

## Blocked / Unsafe / Unknown Routes
| route | locale | reason |
| --- | --- | --- |
| /en/tests/big-five-personality-test | en | Not enough repository evidence for safe related_test use. |
| /en/tests/big-five-personality-test-ocean-model/take | en | Not enough repository evidence for safe related_test use. |
| /en/tests/big-five-personality-test-ocean-model/take?form=big5_90&utm_source=organic | en | Not enough repository evidence for safe related_test use. |
| /en/tests/big-five-personality-test-ocean-model/technical-note | en | Not enough repository evidence for safe related_test use. |
| /en/tests/big-five-personality-test/take | en | Not enough repository evidence for safe related_test use. |
| /en/tests/big-five-personality-test/take?utm_source=google | en | Not enough repository evidence for safe related_test use. |
| /en/tests/career-riasec | en | Not enough repository evidence for safe related_test use. |
| /en/tests/holland-career-interest-test-riasec/take | en | Not enough repository evidence for safe related_test use. |
| /en/tests/holland-career-interest-test-riasec/take?form=riasec_140 | en | Not enough repository evidence for safe related_test use. |
| /en/tests/holland-career-interest-test-riasec/take?form=riasec_60 | en | Not enough repository evidence for safe related_test use. |
| /en/tests/holland-career-interest-test-riasec/technical-note | en | Not enough repository evidence for safe related_test use. |
| /tests/${CAREER_DISPLAY_RIASEC_TEST_SLUG} | unknown | Not enough repository evidence for safe related_test use. |
| /tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}/take | unknown | Not enough repository evidence for safe related_test use. |
| /tests/big-five-personality-test | unknown | Not enough repository evidence for safe related_test use. |
| /tests/big-five-personality-test-ocean-model | unknown | Not enough repository evidence for safe related_test use. |
| /tests/big5-ocean | unknown | Not enough repository evidence for safe related_test use. |
| /tests/big5-ocean-test | unknown | Not enough repository evidence for safe related_test use. |
| /tests/career-interest-test | unknown | Not enough repository evidence for safe related_test use. |
| /tests/career-riasec | unknown | Not enough repository evidence for safe related_test use. |
| /tests/career-tests-riasec | unknown | Not enough repository evidence for safe related_test use. |
| /tests/holland-career-interest-test-riasec | unknown | Not enough repository evidence for safe related_test use. |
| /tests/holland-career-interest-test-riasec/take | unknown | Not enough repository evidence for safe related_test use. |
| /tests/holland-career-interest-test-riasec/technical-note | unknown | Not enough repository evidence for safe related_test use. |
| /tests/holland-code-career-test | unknown | Not enough repository evidence for safe related_test use. |
| /tests/riasec | unknown | Not enough repository evidence for safe related_test use. |
| /tests/riasec-test | unknown | Not enough repository evidence for safe related_test use. |
| /tests/RiasecLandingSurfaceSections | unknown | Not enough repository evidence for safe related_test use. |
| /zh/tests/big-five-personality-test | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/big-five-personality-test-ocean-model/take | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/big-five-personality-test-ocean-model/take?form=big5_120 | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/big-five-personality-test-ocean-model/take?form=big5_90 | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/big-five-personality-test-ocean-model/technical-note | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/career-riasec | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/holland-career-interest-test-riasec? | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/holland-career-interest-test-riasec?token=redacted | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec?token=secret | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec/history | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec/orders | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec/pay | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec/payment | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec/result | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec/share | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec/take | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/holland-career-interest-test-riasec/take? | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/holland-career-interest-test-riasec/take?form=riasec_140 | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/holland-career-interest-test-riasec/take?form=riasec_60 | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/holland-career-interest-test-riasec/take?payment_recovery_token=redacted&utm_source=seo | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec/take?payment_recovery_token=secret&utm_source=seo | zh | Unsafe: forbidden route pattern detected. |
| /zh/tests/holland-career-interest-test-riasec/take?utm_source=baidu | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/holland-career-interest-test-riasec/take?utm_source=codex_qa | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/holland-career-interest-test-riasec/take?utm_source=codex_qa&email=person%40example.com | zh | Not enough repository evidence for safe related_test use. |
| /zh/tests/holland-career-interest-test-riasec/technical-note | zh | Not enough repository evidence for safe related_test use. |

## Decision
- V2.1 patch recommended: yes
- Operator can accept narrower V2 internal-link scope: not necessary; safe routes are verified

## Evidence Notes
- Safe routes require repository evidence, public `/en/tests/*` or `/zh/tests/*` shape, no forbidden route pattern, and Big Five / RIASEC / Holland route type.
- Static `llms.txt` / `llms-full.txt` files are not committed in this repo snapshot. `appears_in_llms` is evidence-based and remains `unknown` unless exact route evidence appears in llms generator or llms artifact files.
- `appears_in_sitemap` is exact-route evidence from sitemap source or `public/sitemap.xml`.

## Blockers
- None

## Warnings
- Forbidden-pattern route examples were found in tests/docs and classified unsafe; they are not safe related_test landing routes.
