# Attribution parameter canonical audit

## Inputs

Twenty synthetic observations cover homepage, Test Hub, MBTI, RIASEC, Big Five, personality and article surfaces across EN/ZH and mobile/desktop. Candidate parameters:

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `gclid`, `fbclid`, `msclkid`
- `ref`, `source`

The only value used was `technical_audit`; no user or private identifier appeared.

## Result

- **20/20 SSR samples passed.**
- **20/20 hydrated DOM samples passed after selector-bounded observation.**
- HTTP status remained 200 without parameter-cleanup redirects.
- Canonical and `og:url` pointed to the same-locale public base URL.
- No schema block contained the parameter or synthetic value.
- No sampled parameter URL appeared in sitemap, llms or llms-full.

The current approved tracking contract explicitly accepts the five UTM keys plus `gclid`, `msclkid` and `fbclid` with safe non-personal values. `ref` and `source` were audit candidates only; their business retention remains UNKNOWN.

## Root-cause classification

No canonical regression was observed, so no metadata/middleware/redirect/API/hydration repair PR is proposed. CTA attribution safety is supported by the current allowlist contract for the eight approved parameters, not by clicking or submitting a private flow.

## Limits

GSC parameter observations and URL Inspection are UNKNOWN. A correct canonical today does not prove historical parameter URLs have left the search index. The audit does not make an index-cleared claim.

## V2 evidence completion — 2026-08-10

`NONCAREER-ATTRIBUTION-CANONICAL-EVIDENCE-COMPLETION-01` reran the exact 20 synthetic definitions and separately classified internal-link propagation, public shared-cache risk and live CTA attribution. V1 remains unchanged; V2 is frozen in `attribution_canonical_samples_v2.csv` and `canonical_audit_manifest_v2.json`.

| V2 dimension | Result | Boundary |
| --- | --- | --- |
| HTTP and hydrated canonical | 20/20 pass | parameter-free same-locale public base |
| Unexpected cross-document parameter propagation | 20/20 pass; zero unexpected and zero private links | intended public test CTAs counted separately |
| Same-document fragment retention | 5/20 samples | retained as an observation; it does not create a different document request |
| Shared public proxy cache boundary | 20/20 pass | `private` plus `no-cache`/`no-store`, `X-Proxy-Cache: BYPASS` |
| Exact upstream/application cache-key composition | 0/20 known | `UNKNOWN_NOT_EXPOSED`; not inferred from response headers |
| Repository attribution contract | 16 pass / 4 unknown | eight approved keys pass; `ref`/`source` remain candidate-only |
| Live public CTA propagation | 8 pass / 8 fail / 4 unknown | fail on sampled homepage, Tests Hub and personality contexts; unknown for `ref`/`source` |

The live PASS group is the sampled MBTI/RIASEC landing and Article CTA context. The live FAIL group contains approved parameters on sampled homepage, Tests Hub and personality pages where public test-link candidates did not retain the exact synthetic value. This is an observed attribution-continuity gap, not a canonical failure. It is recorded as sidecar work because this evidence-only PR forbids CTA/runtime changes.

No click, answer, submit, result, attempt, order, payment, private token or user identifier was used. The runtime did not expose an exact application revision, so repository-contract evidence and live observations are not asserted to share an exact SHA.
