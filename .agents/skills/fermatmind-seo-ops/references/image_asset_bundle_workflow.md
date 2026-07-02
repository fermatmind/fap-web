# Image Asset Bundle Workflow

Use this workflow for daily SEO content packages that include local image files under `media/`.

This workflow is the bridge between a Mode C content package and the production-safe fap-api Media Library importer:

```bash
php artisan media-assets:import-seo-image-bundle \
  --package=/path/to/source-package \
  --translation-group-id=<translation_group_id> \
  --dry-run \
  --json
```

The image workflow must run after package preflight and before `articles:import-seo-content-package-draft`.

Mode C must not invent Media Library URLs. CMS image fields may be filled only from verified resolved metadata returned by the importer or a resolved package copy.

## Standard Order

1. package preflight.
2. image asset bundle preflight.
3. Media Library import/register dry-run.
4. Media Library import/register when authorized.
5. CMS image metadata backfill into a resolved package copy.
6. SEO content package draft dry-run.
7. draft import.
8. preview QA.
9. publish, release, and search stages.

## Input Files

Mode C packages may include:

```text
media/
  IMAGE_ASSET_MANIFEST.json
  cover_source_1600x900.png
  body_visual_source_1600x900.png
  og_1200x630.png
  IMAGE_PROMPTS.md
```

Newer Mode C packages may group source files by role:

```text
media/
  IMAGE_ASSET_MANIFEST.json
  IMAGE_PROMPTS.md
  cover/
    cover_source_1600x900.png
  body/
    body_visual_source_1600x900.png
```

Both shapes are acceptable when `source_file` resolves correctly from the
package root or `media/` directory. Do not rewrite a valid role-grouped tree
into the flat shape just for style consistency.

Allowed source image extensions:

- `jpg`
- `jpeg`
- `png`
- `webp`

Disallowed:

- SVG.
- animated images.
- transparent-background dependent designs.
- competitor images.
- private assets.
- fake URLs.
- unresolved placeholders.

## Required Manifest Fields

`media/IMAGE_ASSET_MANIFEST.json` must include:

- `schema_version=image_asset_manifest_v1`.
- `package_id`.
- `translation_group_id`.
- `locale_scope`.
- `assets[]`.
- `qa_gates`.

Each `assets[]` item must include:

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

Each `assets[]` item should also include package-level GEO context fields. These
fields help Codex and the SEO agent validate answer-surface usefulness; they do
not grant runtime schema, CMS, or Media Library authority:

- `geo_media_role`.
- `answer_block_id`.
- `entity_cluster`.
- `information_gain_role`.
- `body_anchor`.
- `visual_not_decorative`.
- optional `alt_text_i18n` for localized alt text, while `alt_text` remains the
  canonical importer-compatible string.

Supported roles:

- `cover`.
- `body_visual`.
- `og_override`.
- `card_override`.
- `thumbnail_override`.

## Required Image Rules

Minimum package requirement:

- `cover_source_1600x900.*` is required for every new daily SEO article package that expects a unique article image.
- `body_visual_source_1600x900.*` is required only when body copy references a body visual or `body_visual_required=true`.
- `og_1200x630.*` is optional. If absent, backend variants may generate OG from the cover source.
- card and thumbnail source files are not required; backend variants generate them.
- the cover image must express the article's actual reader scene and topic, not
  a generic decorative or stock-like setting.
- the body visual must be a checklist, flowchart, comparison table, decision
  tree, or entity relationship map tied to a specific section or answer block.

Dimensions:

- cover source: 1600x900 minimum, 2400x1350 preferred.
- generated hero: 1600x900.
- generated card: 800x450.
- generated thumbnail: 400x225.
- generated OG: 1200x630.
- generated preload: 64x36.
- body visual: 1600x900 or 1200x675.

File size:

- hard max: 10 MB.
- recommended max: 3 MB, warning only unless package policy blocks it.

When a body visual is required, metadata alone is not sufficient. The resolved package must also prove the public article body will render the visual through a body markdown image reference or approved renderer contract.

When a body visual is meant to support GEO, the resolved package must also show
the intended answer block or section anchor through `answer_block_id`,
`body_anchor`, `contracts/GEO_MEDIA_ALIGNMENT.json`, or equivalent package
evidence.

## Authorization Profile Fields

The runner may perform image workflow steps only when the current Authorization Profile allows them:

- `allow_image_bundle_dry_run=true`.
- `allow_media_library_image_import=true`.
- `allow_resolved_package_write=true`.
- `allow_image_metadata_backfill=true`.

Dry-run can be treated as safe local/read-only validation only when it does not write DB, storage, CMS, or package files.

Non-dry-run Media Library import is a production mutation and must be explicitly authorized. It must not create CMS articles, publish, mark sitemap/llms eligible, enable schema/hreflang, submit search channels, or trigger revalidation.

## Importer Calls

Required dry-run:

```bash
php artisan media-assets:import-seo-image-bundle \
  --package=/path/to/source-package \
  --translation-group-id=<translation_group_id> \
  --dry-run \
  --json
```

Optional flags:

- `--write-resolved-package`.
- `--resolved-output-dir=/path/to/generated/resolved-package`.
- `--expected-asset-prefix=article.<topic>`.
- `--allow-update-existing`.
- `--locales=zh-CN,en`.

If `--write-resolved-package` is used, write to a resolved package copy under a safe output directory. Do not directly overwrite the original source package unless the operator explicitly requests that exact operation.

## Required Resolved CMS Fields

The image importer output or resolved package must provide:

- `cover_media_asset_key`.
- `cover_image_url`.
- `cover_image_alt`.
- `cover_image_width`.
- `cover_image_height`.
- `cover_image_variants`.
- `og_image_url`.
- `twitter_image_url`.
- `social_image_metadata`.

When body visual is required:

- `body_visual_asset_key`.
- `body_visual_image_url`.
- `body_visual_fallback_authorized`.

Required variant verification should include:

- `original`.
- `hero`.
- `card`.
- `thumbnail`.
- `og`.
- `preload`.

Social/cover image readiness does not imply body visual readiness. Check cover image, social/OG image, article card image, and body visual image separately.

## Duplicate Recent Cover And Concept Check

Check whether the same cover/card asset key was used by the most recent 5 SEO articles in the same topical lane.

If duplicate:

- default to warning or block according to package policy.
- if the same fallback asset has already been used by more than 2 articles, add the article to the image backlog and stop unless the operator explicitly authorizes reuse.
- also check whether the candidate image concept is semantically the same as a
  recent same-lane article image. A new asset key with the same generic scene
  does not satisfy the daily GEO media requirement.

## Preview QA Image Checks

Preview QA must check:

- article hero renders.
- article card/list image renders when the preview or linked listing surface is available.
- OG/Twitter metadata uses public image URLs when metadata is rendered.
- body visual renders if referenced.
- body visual renders when `body_visual_required=true`.
- body visual appears near the intended answer block or section when the
  package declares `answer_block_id` or `body_anchor`.
- cover/body visual support the declared entity cluster and information-gain
  role instead of decorative-only imagery.
- no `__CMS_MEDIA_LIBRARY_PLACEHOLDER__`.
- no fake URL.
- no private asset or signed/private bucket URL.
- CDN URLs return HTTP 200 with image content type when externally checkable.
- required variants are present: `original`, `hero`, `card`, `thumbnail`, `og`, `preload`.

## Hard Stops

Stop before draft dry-run/import on:

- missing `IMAGE_ASSET_MANIFEST.json` when image bundle is required.
- missing source file.
- invalid MIME or SVG.
- animated image.
- image over 10 MB.
- missing alt text.
- `alt_text` supplied as a locale object instead of a string.
- `competitor_asset=true`.
- `visual_not_decorative=false` for required daily article assets.
- body visual missing answer-block or section-anchor evidence when declared as
  a GEO answer visual.
- CDN verification failed.
- unresolved placeholder in active surfaces.
- selected fake URL or private asset.
- duplicate recent cover blocked by package policy.

## Reports

Generate or update these reports when this workflow runs:

- `IMAGE_ASSET_BUNDLE_PREFLIGHT_REPORT.md`.
- `MEDIA_LIBRARY_IMPORT_REPORT.md`.
- `IMAGE_VARIANT_QA_REPORT.md`.
- `CMS_IMAGE_FIELD_BACKFILL_REPORT.md`.
- `PREVIEW_IMAGE_RENDER_QA_REPORT.md`.
- `RECENT_ARTICLE_IMAGE_DUPLICATE_CHECK.md`.
- `GEO_MEDIA_ALIGNMENT_REPORT.md`.

Use `assets/image_asset_bundle_reports_template.md` when a consolidated template is useful.
