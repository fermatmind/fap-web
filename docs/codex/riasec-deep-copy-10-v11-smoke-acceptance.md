# RIASEC-DEEP-COPY-10 V11 Smoke Acceptance

## Executive Summary

Status: conditional GO for the frontend RIASEC V11 deep content runtime acceptance layer.

RIASEC-DEEP-COPY-08A exposed backend-owned `deep_content_slots_v1` through projection/report snapshot. RIASEC-DEEP-COPY-08B taught fap-web to render those backend slots fail-closed. RIASEC-DEEP-COPY-09 froze the deep-copy fixture matrix and forbidden-claim checks. RIASEC-DEEP-COPY-10 adds the final smoke acceptance evidence without changing scoring, question content, runtime UI behavior, career registry matching, share/PDF/history semantics, or analytics runtime.

## Runtime Surfaces Covered

| Surface | Acceptance evidence | Status |
| --- | --- | --- |
| Standard result page | `RiasecResultShell` renders a projection-v2 result with backend deep slots only | Passed |
| Deep content slots | Dimension, pair blend, contextual 140Q cards, structural difference, and aspirations slots render from `deep_content_slots_v1` | Passed |
| State matrix | clear, blended, broad, near-tie, low-quality, contextual 140Q, structural difference, missing-slot, and examples-only cases are frozen in `deep-copy-fixture-matrix.v1.json` | Passed |
| Share safety | Existing smoke contract covers `createAttemptShare` and shared projection payload without raw feedback exposure | Passed |
| PDF boundary | Existing smoke contract covers `fetchAttemptReportPdfWithMeta` with snapshot PDF metadata and no feedback payload | Passed |
| History snapshot consistency | Existing smoke contract covers `getMyAttempts` with RIASEC projection v2 and cross-form numeric compare disabled | Passed |
| Technical Note access | Existing smoke contract covers `fetchRiasecTechnicalNote` for RIASEC | Passed |

## Authority Boundary

- Deep interpretation content source: `riasec_public_projection_v2.deep_content_slots_v1`.
- Frontend fallback: disabled.
- Unknown slots: hidden.
- Missing, pending, or unavailable slots: omitted.
- Formal report expectation: deterministic backend snapshot.
- Occupation examples: examples-only unless a reviewed registry source row exists.
- Feedback and aspirations: exploration overlays only; they do not mutate `measured_holland_code`, scores, report snapshots, share payloads, or PDF payloads.

## No-Go Claim Freeze

The acceptance test blocks no-go claims from runtime source and backend-authority deep fixtures, including career matching, job-fit, ranking, success probability, hiring suitability, unsupported 140Q accuracy claims, and cross-form raw-score delta claims. Test files may mention these phrases only as forbidden assertions.

## Remaining Sidecar Issues

1. Local production build runs the postbuild sitemap generator and may rewrite `public/sitemap.xml`. For this train, the generated diff is restored and is not included in the PR.
2. Earlier PR09 GitHub `contracts` check initially timed out in an unrelated Big Five contract file, then passed on rerun. No RIASEC contract changes were required.

## Rollback

Remove this smoke acceptance document and `riasec-deep-copy-v11-smoke-acceptance.contract.test.tsx`. The DEEP-COPY-08A/08B runtime behavior remains intact.
