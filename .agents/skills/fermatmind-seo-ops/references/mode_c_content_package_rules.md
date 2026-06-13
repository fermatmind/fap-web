# Mode C Content Package Rules

Use when validating GPT/Mode C bilingual SEO article content packages before import, preview, publish, or release.

## Body Visual Rule

Mode C must not hardcode nonexistent Media Library asset keys. If a body visual is desired but the asset is not verified public/published/CDN reachable, the package must output:

- `body_visual_status: requires_media_library_resolution_before_preview`
- `desired_body_visual_concept`
- `fallback_asset_candidates`
- `operator_resolution_required`

Active import surfaces must not contain unresolved placeholders such as:

`{{ media_library_visual:career_exploration_funnel.v1 }}`

Fallback may be written only when:

- the package contract explicitly allows the fallback, or
- the operator explicitly authorizes the fallback asset.

## Social Image And Body Visual Separation

Social/cover image readiness does not imply body visual readiness. Check separately:

- `cover_media_asset_key`
- `social_og_asset_key`
- `body_visual_asset_key`
- `body_visual_required`
- `body_visual_fallback_authorized`

If `body_visual_required=true` and no verified or authorized fallback exists, stop before preview/import.

## Active Import Surfaces

Active surfaces include:

- page frontmatter active fields.
- page body markdown.
- CMS field JSON.
- CMS import draft JSON.
- CTA targets.
- internal link targets.
- canonical draft URLs.
- SEO title/meta/excerpt/body fields.

Active surfaces must not contain:

- private routes.
- unresolved placeholders.
- old route aliases.
- sensitive query keys.
- unverified Media Library asset keys marked as selected.

## Contract / Review Surfaces

Contract and review surfaces may contain forbidden examples only in clearly labeled policy fields:

- `contracts/PRIVATE_URL_GUARD.json`
- `contracts/ROUTE_ALIAS_CONTRACT.json`
- claim/review notes.
- QA checklists.

Alias keys, private URL examples, forbidden query keys, and claim-risk examples must not leak into active CMS/page/import fields.

## Schema Candidate Metadata

Mode C should declare schema candidates separately:

- `article_schema_candidate`
- `breadcrumb_schema_candidate`
- `faq_schema_candidate`

FAQ schema defaults to false unless explicitly approved. Schema readiness must be blocked if title, description, canonical, image, published/modified time, author, or publisher cannot be resolved.

## Article Identity Handoff

Before downstream rollout, the handoff must include or request:

- article IDs.
- revision IDs.
- translation group ID.
- locale.
- slug.
- public canonical URLs.

When article IDs are not yet known, use placeholders and require a later `ARTICLE_IDENTITY_LOCK` before any downstream action.
