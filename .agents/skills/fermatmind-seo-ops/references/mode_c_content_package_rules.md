# Mode C Content Package Rules

Use when validating GPT/Mode C bilingual SEO article content packages before import, preview, publish, or release.

## Image Asset Bundle Rule

Mode C must support a `media/` directory for daily SEO packages:

```text
media/
  IMAGE_ASSET_MANIFEST.json
  cover_source_1600x900.png
  body_visual_source_1600x900.png
  og_1200x630.png
  IMAGE_PROMPTS.md
```

Minimum daily requirement:

- `media/IMAGE_ASSET_MANIFEST.json`.
- `media/cover_source_1600x900.*`.
- `media/IMAGE_PROMPTS.md`.

Conditional files:

- `body_visual_source_1600x900.*` is required only when the article body references a body visual or `body_visual_required=true`.
- `og_1200x630.*` is optional. If absent, backend variants may generate OG.
- card and thumbnail source files are not required from GPT; backend variants generate them.

`IMAGE_ASSET_MANIFEST.json` must declare:

- `schema_version=image_asset_manifest_v1`.
- `package_id`.
- `translation_group_id`.
- `locale_scope`.
- `assets[]`.
- `qa_gates`.

Each asset must include:

- `asset_key`.
- `role`.
- `source_file`.
- `alt_text`.
- `locale_strategy`.
- `intended_usage`.
- `dimensions_expected`.
- `format_allowed`.
- `max_bytes`.
- `fallback_allowed`.
- `provenance`.

Supported roles:

- `cover`.
- `body_visual`.
- `og_override`.
- `card_override`.
- `thumbnail_override`.

Allowed source formats: `jpg`, `jpeg`, `png`, `webp`.

Forbidden: SVG, animated image, transparent-background dependent design, competitor image, private asset, fake URL, and unresolved placeholder.

Dimension and size rules:

- cover source: 1600x900 minimum, 2400x1350 preferred.
- body visual: 1600x900 or 1200x675.
- hard max: 10 MB.
- recommended max: 3 MB warning.

Mode C must not invent Media Library URLs. CMS JSON may carry proposed asset keys and local source filenames, but publishable CMS image fields must be filled only after `media-assets:import-seo-image-bundle` returns verified resolved metadata.

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

If a package includes a body visual placeholder or image asset manifest but no resolved CMS image metadata, the downstream decision is `BLOCKED_NEEDS_MEDIA_LIBRARY_IMPORT` until the image importer dry-run/import and metadata backfill pass.

## Social Image And Body Visual Separation

Social/cover image readiness does not imply body visual readiness. Check separately:

- `cover_media_asset_key`
- `social_og_asset_key`
- `article_card_asset_key`
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
- fake Media Library URLs.
- local image file paths presented as public URLs.

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
