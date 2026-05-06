# CMS-Backed Fallback SEO Authority Inventory

Scope: PR-UG-07, URL Truth & SEO Governance.

This is a read-only governance inventory. It does not remove fallbacks, change runtime SEO behavior, widen sitemap/llms exposure, or change public URLs.

## Summary

The current frontend contains several compatibility fallbacks around CMS-backed surfaces. Most are acceptable because CMS absence leads to `noindex`, `notFound`, empty state, or minimal-shell behavior. Two surfaces need migration before large SEO/GEO expansion:

- Article detail pages can build Article JSON-LD in the frontend when CMS Article SEO JSON-LD is absent.
- `llms.txt` and `llms-full.txt` can fall back to a stable public topic set when the topics CMS is unavailable.

## Classification

- `acceptable_product_code`: Product-code SEO for non-CMS editorial surfaces.
- `safe_cms_backed_fallback`: CMS-backed fallback that does not create indexable frontend editorial SEO authority.
- `watchlist`: Deterministic frontend rendering from CMS visible content that can become authority drift if backend coverage weakens.
- `migration_required`: Fallback that can affect indexable SEO/GEO exposure and should be governed before expansion.

## Current Inventory

| Surface | Route family | Classification | Risk | Required action |
| --- | --- | --- | --- | --- |
| Home landing surface | home | safe_cms_backed_fallback | P2 | Keep noindex/minimal-shell fallback only. |
| Tests hub/category | tests_hub_and_category | watchlist | P2 | Verify backend metadata authority before expanding category SEO. |
| Career landing surface | career_hub | safe_cms_backed_fallback | P2 | Keep fallback noindex-only. |
| Article detail | articles_detail | migration_required | P1 | Move Article JSON-LD completeness into backend `seo.surface.v1`. |
| Articles index | articles_hub | safe_cms_backed_fallback | P2 | Keep empty-state fallback; do not add local article lists. |
| Topic detail | topics_detail | watchlist | P1 | Define structured-data key ownership before Topic Graph. |
| Topics hub | topics_hub | watchlist | P2 | Keep read-only until Topic Graph readiness rules exist. |
| Career guide detail | career_guides_detail | watchlist | P1 | Require backend schema completeness before career guide expansion. |
| Content/help pages | content_pages | safe_cms_backed_fallback | P2 | Keep static policy/help content in backend content pages. |
| llms topic fallback set | llms_topics | migration_required | P1 | Replace with backend exposure authority or versioned compatibility fixture before Topic Graph. |
| Personality product code | personality_profiles | acceptable_product_code | P2 | Keep as compatibility; do not expand profile SEO graph yet. |

## Expansion Blockers

The following must stabilize before Topic Graph or GEO expansion:

- Article detail JSON-LD fallback must reconcile with backend `seo.surface.v1`.
- llms topic fallback enumeration must become backend-authoritative or explicitly versioned.
- Topic detail schema ownership must define which keys are backend-owned versus deterministic visible-content render keys.

## Non-Goals

- No fallback removal in this PR.
- No runtime metadata or JSON-LD changes.
- No Topic Graph rollout.
- No pSEO expansion.
- No CMS UI change.
