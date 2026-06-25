# Article Translation Migration Attempt And CMS Dry-Run Pass Report

## Scope

- Authorized migration path: `database/migrations/2026_04_23_000100_add_article_translation_contract_v1.php`
- Repaired package: `/Users/rainie/Desktop/GitHub/fap-web/generated/seo-ops-gaokao-parent-conflict-riasec-v5-cms-draft-repaired-copy-20260625-00/resolved-package-repaired`
- Target slug: `gaokao-major-choice-parent-conflict-riasec-course-checklist`
- Scope honored: local/test DB only; no full `php artisan migrate`; no CMS write/import/draft creation; no publish; no URL Truth, sitemap/llms, schema/hreflang, search submission, revalidation, deploy, PR, or business-code mutation.

## Migration Attempt

Command:

```bash
php artisan migrate --path=database/migrations/2026_04_23_000100_add_article_translation_contract_v1.php --no-interaction --no-ansi
```

Raw log:

- `/Users/rainie/Desktop/GitHub/fap-web/generated/seo-ops-gaokao-parent-conflict-riasec-v5-cms-draft-repaired-copy-20260625-00/ARTICLE_TRANSLATION_CONTRACT_MIGRATION_ATTEMPT.log`

Result:

- Exit code: `1`
- Migration status remains: `Pending`
- Failure: `Unknown column 'cover_image_alt' in 'field list'`
- Cause: the migration adds translation columns first, then its backfill query selects article media/voice columns that do not exist in the current minimal local/test `articles` table.

Partial local/test DB effect observed after the failed migration attempt:

```text
translation_group_id
source_locale
translation_status
translated_from_article_id
source_version_hash
translated_from_version_hash
```

The local/test `articles` table still has zero rows for the target slug.

## CMS Draft Import Dry-Run Rerun

Command:

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

- `/Users/rainie/Desktop/GitHub/fap-web/generated/seo-ops-gaokao-parent-conflict-riasec-v5-cms-draft-repaired-copy-20260625-00/CMS_DRAFT_IMPORT_DRY_RUN_AFTER_TRANSLATION_MIGRATION_ATTEMPT.raw.json`

Result:

- Exit code: `0`
- `ok`: `true`
- `dry_run`: `true`
- `action`: `would_create_draft`
- `would_write`: `true` in plan semantics only; no write was executed because `--dry-run` was used
- `errors`: `[]`
- `warnings`: `[]`
- active surface guard: `passed`
- contract integrity scan: `passed`

Planned article:

- locale: `zh-CN`
- slug: `gaokao-major-choice-parent-conflict-riasec-course-checklist`
- action: `would_create_draft`
- article_id: `null`
- working_revision_id: `null`
- status: `draft`
- working_revision_status: `human_review`
- is_public: `false`
- is_indexable: `false`
- sitemap_eligible: `false`
- llms_eligible: `false`

## Decision

`CMS_DRAFT_IMPORT_DRY_RUN_OK_READY_FOR_OPERATOR_DRAFT_CREATE_GATE`

## Caveat For Actual Draft Creation

This dry-run pass proves the repaired package clears the CMS draft-import validator. It does not prove the current minimal local/test DB can execute a real draft creation, because the broader article schema is still incomplete and the attempted translation migration remains `Pending`.

For actual CMS draft creation, use a target backend DB with the full article CMS schema, or separately authorize the minimum local/test schema preparation needed for real draft creation.
