# RIASEC Full Deep Content Pack Review Gate

Date: 2026-05-18
PR: `RIASEC-FULL-CONTENT-PACK-01`
Status: governance gate only

## Gate Purpose

This gate prevents RIASEC deep content from becoming runtime authority until every asset has source, ownership, review, versioning, claim-boundary, and fail-closed metadata. It applies before any future import into backend registry, CMS content registry, projection payload, report snapshot, frontend renderer, share, PDF, or history surfaces.

## Gate States

| State | Runtime allowed? | Meaning |
| --- | --- | --- |
| `candidate_external` | no | External asset exists outside repo authority. |
| `repo_docs_only` | no | Asset is documented in repo but not imported as runtime content. |
| `schema_ready` | no | Slot shape exists, but no approved content. |
| `review_pending` | no | Content exists but needs psychometrics/product review. |
| `approved_for_staging` | staging only | Content passed review and may be used in staging fixtures. |
| `approved_for_runtime` | yes | Content can be emitted through backend/CMS authority after tests pass. |
| `blocked` | no | Asset contains unresolved no-go claims or unsupported source assertions. |

## Required Metadata Before Runtime

Every imported content asset must declare:

- `slot_key`
- `slot_group`
- `scale_code=RIASEC`
- `locale`
- `content_version`
- `owner`
- `review_status`
- `source_status`
- `evidence_level`
- `runtime_destination`
- `applicable_form_codes`
- `applicable_profile_shapes`
- `applicable_quality_states`
- `applicable_codes` or `applicable_dimensions`
- `required_boundaries`
- `forbidden_claims`
- `fallback_behavior=omit_module`
- `frontend_fallback_allowed=false`

## Review Requirements By Asset Group

| Asset group | Psychometrics review | Product review | Backend/content governance review | Frontend review |
| --- | --- | --- | --- | --- |
| Six dimension deep copy | required | required | required | renderer contract only |
| Pair blend 15 pairs | required | required | required | renderer contract only |
| Top-3 code strategy | required | required | required | not before backend strategy |
| Career activity families | boundary review | required | required | examples-only display contract |
| 140Q narrative | required | required | required | renderer contract only |
| Low-quality cautious reading | required | required | required | hidden/collapsed module contract |
| Aspirations calibration | boundary review | required | required | overlay display contract only |
| Disagree path | boundary review | required | required | overlay display contract only |
| Feedback / Action Lab copy | boundary review | required | required | no raw feedback exposure |
| Share / PDF / history variants | boundary review | required | required | public-safe display contract |
| Fixture matrix | required for expected states | required for user claims | required for payload shape | required for rendered output |
| Forbidden claims | required | required | required | required |

## Mandatory Checks Before `approved_for_runtime`

1. Backend validator accepts the content payload.
2. Backend validator rejects a negative fixture containing forbidden claims for that asset group.
3. Projection/report snapshot emits only approved, authored slots.
4. Missing, pending, unavailable, unknown, or fallback-enabled content is omitted or hidden.
5. Frontend renders only backend-provided content slots.
6. Rendered output does not contain no-go claims.
7. Share/PDF/history variants are public-safe when relevant.
8. The asset has a rollback path by content version or slot lookup disablement.

## No-Go Claim Rules

Content must be rejected if it introduces any of the following:

- occupation Matches;
- career recommendation;
- occupation match;
- job fit;
- fit score;
- ranking;
- success probability;
- hiring suitability;
- promotion or employment risk;
- O*NET, SOC, or source URL claims without reviewed source rows;
- 140Q as more accurate;
- 60Q wrong or overridden by 140Q;
- 60Q/140Q raw score delta;
- ability, skill, qualification, or credential inference;
- personality identity or subtype claims;
- feedback or aspirations changing measured Holland Code or scores;
- runtime AI-generated formal report text;
- frontend local fallback interpretation copy.

## Runtime Destination Rules

| Destination | Allowed content source | Fail-closed behavior |
| --- | --- | --- |
| Backend registry | approved runtime content only | omit slot |
| CMS/content registry | approved runtime content only | omit slot or minimal backend empty state |
| Projection payload | backend/CMS-authored approved slots only | omit pending/unavailable slots |
| Report snapshot | same backend-governed payload used by projection | snapshot-bound rollback |
| fap-web renderer | backend slot payload only | hidden/omitted, no local copy |
| Share/PDF/history | public-safe backend snapshot only | hide unsafe/private fields |
| Technical Note | method boundary content only | no substitute interpretation copy |

## Repository Rule Impact

This gate preserves the existing content authority rules:

- frontend remains product-code renderer only;
- backend/CMS remains content authority;
- no frontend editorial fallback is allowed;
- baseline or external content may support import validation but must not become runtime page-rendering authority;
- RIASEC remains a career-interest evidence system, not a career recommender, job matcher, hiring screen, or ability test.
