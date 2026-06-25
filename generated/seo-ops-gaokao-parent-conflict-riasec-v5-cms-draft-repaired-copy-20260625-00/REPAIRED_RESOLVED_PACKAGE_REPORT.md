# Repaired Resolved Package Report

## Scope

- Source package: `/Users/rainie/Desktop/GitHub/fap-web/generated/seo-ops-gaokao-parent-conflict-riasec-v5-media-import-register-20260625-05/resolved-package`
- Repaired copy: `/Users/rainie/Desktop/GitHub/fap-web/generated/seo-ops-gaokao-parent-conflict-riasec-v5-cms-draft-repaired-copy-20260625-00/resolved-package-repaired`
- Target slug: `gaokao-major-choice-parent-conflict-riasec-course-checklist`
- Scope honored: repaired copy only under `generated/`; no CMS write/import/draft creation; no publish; no URL Truth, sitemap/llms, schema/hreflang, search submission, revalidation, deploy, PR, or business-code mutation.

## Repairs Applied

1. Added `contracts/ROUTE_ALIAS_CONTRACT.json`
   - Declares active public routes for the target article, CTAs, required internal links, and `/zh/method-boundaries`.
   - Keeps private-route examples only under `forbidden_private_routes`.

2. Added `contracts/SOCIAL_IMAGE_METADATA_REQUIREMENTS.json`
   - Uses resolved Media Library metadata from the prior local/test import/register output.
   - Records the media caveat that OSS/CDN HTTP-200 verification was skipped in local/test.

3. Added `contracts/DYNAMIC_CTA_CONTRACT.json`
   - Primary CTA: `/zh/tests/holland-career-interest-test-riasec`
   - Secondary CTA: `/zh/tests/mbti-personality-test-16-personality-types`
   - Sensitive params are contained only under `forbidden_tracking_params`.

4. Normalized `contracts/PRIVATE_URL_GUARD.json`
   - Replaced the importer-invalid `private_urls_forbidden` shape with allowed guard keys:
     - `forbidden_private_routes`
     - `forbidden_sensitive_query_keys`
     - `forbidden_substrings`

5. Added reader-facing zh-CN category metadata
   - `category`: `高考志愿`
   - `category_name`: `高考志愿`
   - `category_slug`: `gaokao-major-choice`
   - Applied to:
     - `article.md` frontmatter
     - `pages/zh-CN-gaokao-major-choice-parent-conflict-riasec-course-checklist.md` frontmatter
     - `cms/CMS_FIELDS_zh-CN_gaokao-major-choice-parent-conflict-riasec-course-checklist.json`
     - `cms/CMS_IMPORT_DRAFT_zh-CN_gaokao-major-choice-parent-conflict-riasec-course-checklist.json`
     - `cms_fields.json`
     - `manifest.json`

## Static Validation

- Added contract files exist.
- Repaired JSON files parse.
- Category fields are present in importer-readable active surfaces.
- The previous 5 package blocker fields are repaired in the generated package copy.

## Boundary

This repair did not change article body claims, image assets, Media Library DB rows, CMS state, route truth, sitemap/llms, schema/hreflang, or code.
