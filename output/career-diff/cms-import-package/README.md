# Career CMS Import Dry-Run Package

This package is generated from `China_US_Occupation_Directories_2026.xlsx` and the current public career index.

## Files

- `career_create_import.jsonl`: 2459 top-level occupation create candidates, marked `dry_run_only: true` and `publish_state: draft`.
- `career_alias_review.csv`: 12 likely alias/crosswalk conflicts to review before creating new occupations.
- `career_child_role_review.csv`: 42 China 2025 work types to review as child roles / aliases, not top-level occupations by default.
- `import_manifest.json`: counts, gates, and recommended import order.

## Counts

- Top-level create candidates: 2459
  - CN: 1663
  - US: 796
- Alias review: 12
- Child role review: 42
- Total non-skip queue: 2513

## Required backend gates

1. Dry-run only first. Do not publish directly from this package.
2. Authority identity match must use `market + authority.source + authority.code`, not title text alone.
3. `translation_status != from_existing_match` requires editorial review before public detail pages.
4. Child work types stay out of the top-level occupation library unless product/CMS explicitly promotes them.
5. Backend computes truth, score, trust, SEO contract, public index state, and claim permissions.

## Suggested backend dry-run command shape

```bash
php artisan career:occupations-import \
  --input=career_create_import.jsonl \
  --mode=dry-run \
  --source-package=china_us_occupation_directories_2026 \
  --publish-state=draft
```

If the backend command or endpoint has a different name, keep the same contract boundaries and use the JSONL as the input schema.
