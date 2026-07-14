# Fallback Owner Gates

Scope: PR-PRA1B-01

Runtime behavior changed: no

## No Runtime Change Statement

This artifact adds governance, inventory, and contract gates only. It does not
delete fallback, change page rendering, change metadata output, change JSON-LD
output, change sitemap or llms output, or change recommendation runtime.

## Current Remediation Update

`PUBLIC-STABILITY-WEB-09` removes `test_catalog_seed_fallback` from runtime and
makes the backend scale catalog and lookup the only public catalog authority.
The generated Phase 1B artifact remains the historical inventory baseline; its
contract now requires the recorded seed tokens to stay absent and the classified
public-read/cache adapter tokens to stay present in `lib/content.ts`.

`PUBLIC-STABILITY-WEB-10` completes the runtime remediation for
`personality_fallback_projection`. Backend/CMS personality detail remains the
content authority, the backend selects current versus LKG data, transient reads
reach the shared public error boundary, and authoritative absence remains
not-found. The generated Phase 1B artifact stays as the historical owner-gate
baseline; its contract now prevents the old fallback tokens from returning.

## Why This Exists

Phase 1A made frontend fallback authority visible in
`docs/runtime/generated/frontend-fallback-authority-inventory.v1.json`. Phase 1B
starts by making fallback expansion fail-closed for future tests, topics,
personalities, articles, recommendation surfaces, and Universal Assessment
Signal Platform surfaces.

Fallback additions must include owner, risk, intended replacement, and allowed
duration before they can be treated as an accepted compatibility risk.

## Owner Gate Rules

- Every fallback pattern must be classified.
- `migration_required` fallback cannot expand to new tests, scales, page
  families, topics, personalities, articles, or recommendation surfaces.
- `forbidden` fallback fails contract if it can become public SEO, graph,
  recommendation, or claim authority.
- Local recommendation placeholder cannot become public authority.
- Future Universal Assessment Signal Platform surfaces cannot use unclassified
  fallback.
- `compatibility_wrapper` fallback cannot be treated as permanent authority.
- Frontend fallback cannot become SEO truth, graph truth, or recommendation
  truth.

## Fallback Owner Gate Matrix

| Fallback ID | Classification | Status | Priority | Current owner | Desired owner | Gate |
| --- | --- | --- | --- | --- | --- | --- |
| `test_metadata_faq_cta_fallback` | `migration_required` | `dangerous_if_expanded` | `P0` | frontend compatibility code | backend scale lookup, `landing_surface_v1`, `answer_surface_v1`, `seo.surface.v1` | `no_new_test_or_scale_fallback_without_backend_authority` |
| `topic_cta_fallback` | `migration_required` | `dangerous_if_expanded` | `P0` | frontend topic page compatibility code | CMS topic landing surface / public API | `no_topic_expansion_with_frontend_cta_truth` |
| `llms_topic_fallback` | `migration_required` | `dangerous_if_expanded` | `P0` | frontend llms route fallback constants | backend/CMS topic discoverability authority | `no_silent_llms_topic_exposure_widening` |
| `personality_fallback_projection` | `migration_required` | `dangerous_if_expanded` | `P0` | frontend personality fallback projection | CMS personality projection and public surface bundle | `no_personality_or_career_claim_expansion_on_fallback_projection` |
| `article_jsonld_fallback` | `migration_required` | `ready_for_remediation` | `P0` | frontend article schema bridge | CMS article SEO / answer surface / visible content | `no_article_or_geo_expansion_until_backend_jsonld_authority` |
| `static_sitemap_layer` | `compatibility_wrapper` | `partial` | `P1` | frontend sitemap generation compatibility layer | backend sitemap-source plus fixtures | `no_static_sitemap_expansion_without_backend_fixture` |
| `local_recommendation_engine_placeholder` | `forbidden` | `dangerous_if_expanded` | `P0` | frontend placeholder | backend recommendation snapshot or future governed runtime | `must_not_become_public_authority` |
| `frontend_graph_hardcode` | `forbidden` | `dangerous_if_expanded` | `P0` | documentation-only examples | backend/CMS graph edge authority | `must_not_invent_frontend_graph_authority` |
| `homepage_forced_items` | `product_code_only` | `safe_to_defer` | `P2` | frontend CMS-filtered product shell | CMS landing surface for editorial truth | `do_not_reclassify_as_seo_or_graph_authority` |
| `test_catalog_seed_fallback` | `watchlist` | `ready_for_remediation` | `P1` | frontend public test catalog seed | backend scale catalog and lookup | `no_new_scale_or_test_from_frontend_seed` |

## Source Anchors

- Test detail metadata/FAQ/CTA: `app/(localized)/[locale]/tests/[slug]/page.tsx`
- Topic CTA: `app/(localized)/[locale]/topics/[slug]/page.tsx`
- llms topic fallback: `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`
- Personality fallback projection: `app/(localized)/[locale]/personality/[type]/page.tsx`
- Article JSON-LD fallback: `app/(localized)/[locale]/articles/[slug]/page.tsx`
- Static sitemap layer: `next-sitemap.config.js`
- Local recommendation placeholder: `lib/career/recommendationEngine.ts`
- Test catalog seed fallback: `lib/content.ts`
- Homepage forced items: `lib/marketing/homepageContent.ts`

## Residual Risk

This PR does not remediate fallback. It blocks unclassified expansion and records
owners, replacement targets, allowed duration, and blocking conditions. Actual
runtime remediation remains in PR-PRA1B-02 through PR-PRA1B-06.
