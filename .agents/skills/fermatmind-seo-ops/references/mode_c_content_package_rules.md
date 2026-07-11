# Mode C Content Package Rules

Use when validating GPT/Mode C bilingual SEO article content packages before import, preview, publish, or release. Mode C identifies a content-package source or external draft format. SEO Agent run-control review handoffs use Codex review artifacts, not content-package source labels.

## Operation And Identity Rule

Daily SEO Mode C work treats the GPT prompt contract and GPT package-generation contract as one combined handoff. A returned article-only artifact is not a Mode C package, even if it has body markdown, FAQ, internal links, and image prompts.

Mode C must declare:

- `operation_type`: `new_article` or `update_existing_article`.
- `target_article_id` for `update_existing_article`.
- `current_published_revision_id` when known for existing articles.
- `target_working_revision_id` when continuing an existing draft/update.
- `translation_group_id`.
- `locale`.
- slug and canonical.
- whether a new route is forbidden.

For `update_existing_article`, preserve slug and canonical unless a separate route migration task exists. Do not create a new article to avoid an existing-article publish blocker.

For `new_article`, article ID may be `UNKNOWN_UNTIL_CMS_IMPORT`; downstream work must run Article Identity Lock after import.

## Route Cannibalization And Localized Route Rule

Mode C must include a route cannibalization decision:

- existing route checked.
- target canonical selected.
- rejected or forbidden alternate routes.
- forbidden old CTA aliases.
- public test route targets.

Route contracts may store canonical slugs or locale-neutral references, but active surfaces must resolve localized public routes:

- zh-CN article body, CTA hrefs, CMS fields, and public route checks use `/zh/...` routes such as `/zh/tests/...`.
- en article body, CTA hrefs, CMS fields, and public route checks use `/en/...` routes.
- unknown localized route stops with `ROUTE_UNKNOWN_REQUIRES_CODEX_RESOLUTION`.
- known aliases may be autofixed only when the replacement is unambiguous.

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

Role-grouped source files are also valid:

```text
media/
  IMAGE_ASSET_MANIFEST.json
  IMAGE_PROMPTS.md
  cover/
    cover_source_1600x900.png
  body/
    body_visual_source_1600x900.png
```

Minimum daily requirement:

- `media/IMAGE_ASSET_MANIFEST.json`.
- `media/cover_source_1600x900.*` or `media/cover/cover_source_1600x900.*`.
- `media/IMAGE_PROMPTS.md`.

Conditional files:

- `body_visual_source_1600x900.*` or `body/body_visual_source_1600x900.*` is required only when the article body references a body visual or `body_visual_required=true`.
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
- `alt_text` as a string.
- `locale_strategy`.
- `intended_usage`.
- `dimensions_expected`.
- `format_allowed`.
- `max_bytes`.
- `fallback_allowed`.
- `provenance`.

Daily GEO-aware packages should also include:

- `geo_media_role`.
- `answer_block_id`.
- `entity_cluster`.
- `information_gain_role`.
- `body_anchor`.
- `visual_not_decorative`.
- optional `alt_text_i18n`; do not replace string `alt_text` with a localized object.

Supported roles:

- `cover`.
- `body_visual`.
- `og_override`.
- `card_override`.
- `thumbnail_override`.

Allowed source formats: `jpg`, `jpeg`, `png`, `webp`.

Forbidden: SVG, animated image, transparent-background dependent design, competitor image, private asset, fake URL, and unresolved placeholder.

Required daily SEO/GEO image intent:

- cover assets must represent the article's real reader scene and topic, not a
  generic decorative or stock-like visual.
- body visuals must be checklist, flowchart, comparison table, decision tree,
  or entity map assets tied to a section or answer block.

Dimension and size rules:

- cover source: 1600x900 minimum, 2400x1350 preferred.
- body visual: 1600x900 or 1200x675.
- hard max: 10 MB.
- recommended max: 3 MB warning.

Mode C must not invent Media Library URLs. CMS JSON may carry proposed asset keys and local source filenames, but publishable CMS image fields must be filled only after `media-assets:import-seo-image-bundle` returns verified resolved metadata.

If real source images are missing, the package may continue only as a review artifact and must declare `BLOCKED_NEEDS_IMAGE_GENERATION_BEFORE_MEDIA_LIBRARY_IMPORT`. It must not claim Media Library import/register, CMS draft import, preview QA, or release readiness.

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

Body visual metadata is not enough. When a body visual is required, the package must include a body placeholder or markdown image reference that causes the visual to render in the public article body after resolved metadata is backfilled.

When the package declares GEO media fields, body visual readiness also requires
evidence that the visual maps to the intended `answer_block_id`, `body_anchor`,
and entity cluster. These package fields are context for Codex/SEO agent QA;
they do not enable runtime schema, hreflang, CMS publish, Media Library import,
or search submission by themselves.

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

Schema and hreflang candidates must remain metadata in the content package; the package must not self-enable them. In daily article release, schema and hreflang may run only through the downstream SEO agent's independent rollout gates when its Authorization Profile explicitly allows them. Search Channel queue/search live, GSC Request Indexing, IndexNow live, and Baidu live must be marked as held unless the downstream SEO agent goal uses `authorization_mode=full_chain_preapproved` with exact target canonical URLs, queue item IDs generated by the same run, queue channels, and provider holds.

## Claim Gate And Unknown Fields

Mode C must include topic-specific forbidden claims and preserve `Unknown` for unsupported psychometric fields such as validity coefficients, norm samples, test-retest reliability, official instrument equivalence, percentile mappings, clinical use, hiring fit, salary, promotion, or success prediction.

Psychometric topics must not assert diagnosis, treatment, hiring fit, salary, career success, relationship success, official equivalence, or deterministic outcome claims without approved source and operator review.

GPT-generated self-checks are author assertions, not validation results. Use statuses such as `AUTHOR_ASSERTED`, `REQUIRES_CODEX_VERIFICATION`, `REQUIRES_OPERATOR_REVIEW`, `BLOCKED`, or `Unknown`. Reserve `PASS` for Codex/operator checks that have actually executed against the package, routes, images, CMS surfaces, or preview.

## Structured Metadata Requirements

Mode C should provide or explicitly mark pending:

- existing category recommendation.
- existing tag recommendations.
- structured CTA slots.
- FAQ items.
- references count/status.
- graph/internal link status.
- internal link plan using public routes only.
- social image metadata requirements.

## Article Identity Handoff

Before downstream rollout, the handoff must include or request:

- article IDs.
- revision IDs.
- translation group ID.
- locale.
- slug.
- public canonical URLs.
- operation type.
- target public test routes.
- image asset requirements.
- import/update mode.
- publish gate requirements.
- post-publish discoverability batch note.
- search batch hold note.

When article IDs are not yet known, use placeholders and require a later `ARTICLE_IDENTITY_LOCK` before any downstream action.

## Daily Importer-Compatible Projection Rule

Daily packages include locale-and-slug importer projections in addition to
generic authoring files. Page markdown, CMS fields, and CMS import draft are
one synchronized contract: FAQ, CTA, internal links, media references, slug,
canonical, and translation-group identity must agree across all three.

Map `seo_title -> meta_title`, `canonical_url -> canonical_path`,
`category_suggestion -> category_name`, and the selected CTA to
`primary_cta.href` / `primary_cta.label`. `body_markdown_file` resolves to the
derived locale page. Translation group IDs fit the 64-character backend field.

## Metadata Length And Single Derived Package Rule

Validate metadata before Media Library or CMS work. A deterministic length
repair may only shorten the affected projection without changing topic,
claims, FAQ, CTA, links, identity, media, or release holds.

Stage 4 produces one `FINAL_DERIVED_IMPORT_READY_PACKAGE` with source/derived
hashes and a deterministic change ledger. Stage 5 must not create serial media,
compatibility, and metadata repair packages. If normalization is ambiguous,
stop with `BLOCKED_IMPORTER_COMPATIBILITY`.

## Body Visual Projection Rule

When required, manifest entry, CMS metadata, markdown reference, body anchor,
and answer-block identity must agree. A verified Media Library asset without a
rendered body projection returns `BLOCKED_BODY_VISUAL_PROJECTION`.
