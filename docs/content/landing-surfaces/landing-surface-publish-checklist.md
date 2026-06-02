# Landing Surface Draft Publish Checklist

Scope: zh-CN `landing_surface_v1` draft payload proposals for:

- `/zh/tests/mbti-personality-test-16-personality-types`
- `/zh/tests/holland-career-interest-test-riasec`

These files are content proposals only. Do not publish directly to production CMS without review.

## Files

- `docs/content/landing-surfaces/mbti-zh-cn-draft-payload.json`
- `docs/content/landing-surfaces/riasec-zh-cn-draft-payload.json`

## Pre-Publish Gates

- Confirm CMS supports unpublished draft state for `landing_surface_v1` or `page_blocks`.
- If CMS does not support draft state, keep these files as JSON proposals only and do not write production content.
- Confirm target route, locale, slug, and canonical path match CMS routing.
- Confirm every block has a stable `id`, `type`, `title`, `body`, `internal_links`, `cta`, and either `items` or `faq`.
- Confirm all linked URLs resolve or are intentionally planned canonical URLs.
- Confirm no link points to retired `/professions` pages.
- Confirm no claim says or implies medical diagnosis, guaranteed job fit, guaranteed career outcome, or unsupported user volume.
- Confirm the copy frames MBTI and RIASEC as self-understanding and career-interest aids, not deterministic decisions.
- Confirm FAQ text is visibly rendered before enabling FAQPage structured data.
- Confirm schema generation uses only visible FAQ content.
- Confirm zh-CN copy is reviewed before any en/i18n expansion.

## Preview Acceptance

- Load the CMS preview for `/zh/tests/mbti-personality-test-16-personality-types`.
- Verify these MBTI modules render in order or in an approved editorial order:
  - `mbti-landing-types-overview`
  - `mbti-landing-career-direction`
  - `mbti-landing-comparisons`
  - `mbti-landing-type-internal-links`
  - `mbti-landing-faq-updates`
- Load the CMS preview for `/zh/tests/holland-career-interest-test-riasec`.
- Verify these RIASEC modules render in order or in an approved editorial order:
  - `riasec-landing-primary-cta`
  - `riasec-landing-six-types`
  - `riasec-landing-career-direction`
  - `riasec-landing-major-selection`
  - `riasec-landing-transition-scenarios`
  - `riasec-landing-career-internal-links`
  - `riasec-landing-faq-updates`
- Confirm primary CTAs route to `/take` without creating orders or touching payment flows.
- Confirm internal links route to public canonical pages.
- Confirm visible FAQ appears before FAQPage schema is emitted.
- Confirm metadata title and description are previewed but not published until approved.

## Manual Review Notes

- Product/content should confirm naming for all 16 MBTI type labels in zh-CN.
- Product/content should confirm whether `riasec_60` or `riasec_140` is the default public CTA.
- SEO should confirm the final title and description lengths in CMS preview.
- Legal/clinical-risk reviewer should confirm diagnostic and career guarantee boundaries.
- Data/analytics owner should confirm CTA `analytics_key` naming remains aligned with existing event contracts.

## Publish Conditions

Publish only after:

- CMS draft preview renders both pages correctly.
- Product/content approval is recorded.
- SEO approval is recorded.
- Claim-boundary review is recorded.
- No frontend fallback copy is added.
- No production CMS content is overwritten without rollback notes.

## Rollback

- If published content creates layout, claim, schema, or link issues, unpublish or revert the CMS draft version.
- Do not patch frontend runtime copy as rollback.
- Restore the last known good CMS `landing_surface_v1` or remove the draft blocks from the CMS entry.
