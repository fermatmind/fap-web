# MBTI-CMS-16 Profile Dry-Run Approval Package

This is a non-production backend/CMS review packet derived from CONTENT-15 profile assets.

- Final decision: `PASS_PROFILE_DRY_RUN_APPROVAL_PACKAGE_READY`
- Profile records: 5
- Import candidates: 4
- Verify-only records: 1
- Validation failures: 0

## Scope Boundary

- No CMS write.
- No production import.
- No frontend runtime or editorial fallback change.
- No sitemap, llms, GSC, search submission, or deploy action.

## Approval Queue

| Path | Code | Operation | Approval state | Sections | FAQ | Links |
| --- | --- | --- | --- | ---: | ---: | ---: |
| /zh/personality/istj-a | ISTJ-A | upsert_profile_content_draft | pending_operator_review | 8 | 9 | 5 |
| /zh/personality/istp-a | ISTP-A | upsert_profile_content_draft | pending_operator_review | 8 | 9 | 5 |
| /zh/personality/isfp-a | ISFP-A | upsert_profile_content_draft | pending_operator_review | 8 | 9 | 5 |
| /zh/personality/esfj-a | ESFJ-A | upsert_profile_content_draft | pending_operator_review | 8 | 9 | 5 |
| /zh/personality/intp-a | INTP-A | verify_existing_profile_projection_only | verify_only_not_import_candidate | 0 | 0 | 5 |

## Field Mapping

- `title` -> `seo.title`
- `meta_description` -> `seo.meta_description`
- `h1` -> `display.heading`
- `summary` -> `summary`
- `canonical` -> `seo.canonical_url`
- `robots` -> `seo.robots`
- `sections` -> `content_sections[]`
- `faq` -> `faq_items[]`
- `internal_links` -> `related_links[]`
- `method_boundary` -> `safety.method_boundary`
- `schema` -> `seo.structured_data_recommendations`
- `evidence_notes` -> `editorial.evidence_notes`

## Blockers

- None.
