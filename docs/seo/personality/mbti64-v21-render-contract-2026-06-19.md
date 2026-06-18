# MBTI64 V2.1 Render Contract Review

Date: 2026-06-19

This is a frontend render-contract note for `MBTI64-FRONTEND-PERSONALITY-V2.1-RENDER-CONTRACT-01`.
It does not publish, index, import, submit search, or change CMS authority.

## Live Evidence

- `/api/v0.5/personality/comparisons/intj-a-vs-intj-t?locale=en` returns `comparison_contract_version=mbti.at_comparison.v1.mbti64_overlay`.
- The comparison API exposes promoted V2.1 `title`, `description`, `comparison_blocks`, `faq`, and `internal_links`.
- Variant APIs expose promoted V2.1 SEO fields and top-level CMS sections such as `quick_answer`, `meaning`, `core_traits`, `a_t_difference`, `careers_work_style`, `relationships_communication`, `faq`, and `related_content`.
- zh variant `mbti_public_projection_v1.sections` still contains the older projection body. The promoted zh body is present in top-level CMS `sections`, not in the projection section array.

## Contract Decision

- Frontend must keep backend/CMS as content authority.
- Frontend may consume top-level CMS sections returned by the personality detail API.
- Frontend must not invent or hardcode V2.1 body text if the backend does not return it.
- Variant H1 should use backend public JSON-LD `name` when present, because promoted V2.1 uses that field for the reader-facing H1.
- Comparison page H1 should use `comparison.title`; SEO title remains available for metadata.
- `quick_answer` should be rendered from projection sections first, then from top-level CMS `quick_answer` sections.

## Deferred Backend Note

The zh projection-body mismatch should remain a backend/API follow-up if the product requires `mbti_public_projection_v1.sections` itself to become the V2.1 body source. This frontend PR only ensures the existing promoted top-level CMS sections are visible.
