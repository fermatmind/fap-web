# CMS Draft Import Dry-Run Repaired Rerun Report

## Decision

`BLOCKED_NEEDS_OPERATOR_INPUT`

The repaired package copy cleared the original package-level blockers, but the rerun is now blocked by the local/test DB schema.

## Command

```bash
php artisan articles:import-seo-content-package-draft \
  --package=/Users/rainie/Desktop/GitHub/fap-web/generated/seo-ops-gaokao-parent-conflict-riasec-v5-cms-draft-repaired-copy-20260625-00/resolved-package-repaired \
  --translation-group-id=tg_article_gaokao_parent_conflict_riasec_course_checklist_2026v1 \
  --locales=zh-CN \
  --draft-only \
  --no-publish \
  --no-index \
  --no-sitemap \
  --no-llms \
  --schema-hold \
  --hreflang-hold \
  --expected-zh-slug=gaokao-major-choice-parent-conflict-riasec-course-checklist \
  --dry-run \
  --json \
  --no-interaction \
  --no-ansi
```

Raw output:

- `/Users/rainie/Desktop/GitHub/fap-web/generated/seo-ops-gaokao-parent-conflict-riasec-v5-cms-draft-repaired-copy-20260625-00/CMS_DRAFT_IMPORT_DRY_RUN_REPAIRED.raw.json`

## Result

- Exit code: `1`
- `ok`: `false`
- `dry_run`: `true`
- `action`: `will_skip`
- `would_write`: `false`
- `articles`: `[]`

## New Blocker

- field: `command`
- code: `runtime_error`
- message: `Unknown column 'translation_group_id' in 'where clause'`
- SQL context: the importer reached the planned-article collision check and queried `articles.translation_group_id`.

Current local/test `articles` table columns observed:

```text
id, org_id, category_id, author_admin_user_id, slug, locale, title, excerpt,
content_md, content_html, cover_image_url, status, is_public, is_indexable,
published_at, scheduled_at, created_at, updated_at, deleted_at
```

Pending relevant local/test migrations observed:

- `2026_04_23_000100_add_article_translation_contract_v1`
- `2026_04_23_010000_create_article_translation_revisions_table`
- `2026_04_19_000100_add_article_public_media_metadata`
- `2026_03_29_130000_add_lifecycle_columns_to_content_surfaces`
- `2026_06_11_000100_add_article_sitemap_llms_eligibility_fields`

## Interpretation

The previous five package blockers are no longer the active failure. The dry-run now needs a local/test article schema that includes `translation_group_id` for the importer collision check. No additional migration was run because this turn authorized package repair and dry-run rerun, not local/test article schema migrations.

## Minimum Next Step

Authorize one of these, scoped narrowly:

1. Run the minimum local/test DB migration needed for the dry-run collision check:
   - likely `database/migrations/2026_04_23_000100_add_article_translation_contract_v1.php`
   - then rerun the same dry-run.

2. Use a target test/staging backend DB whose `articles` schema already matches the importer expectation.

Do not create CMS draft until dry-run returns `ok=true`.
