# /goal SEO-GSC-DATA-QUALITY-01

Status: READY_AFTER_CONTROL_PACKET

This is a fap-api PR. Proceed only after control packet dependency and fap-api PR-train manifest/state authorization are explicit.

## Mission

Add a read-only GSC daily data quality gate before any GSC-driven opportunity queue or CMS/search action can rely on `seo_gsc_daily`.

## Allowed Future Scope

- `backend/app/Services/SeoIntel/**`
- `backend/app/Console/Commands/SeoIntelGscDataQualityCommand.php`
- `backend/tests/Feature/SeoIntel/**`
- `backend/docs/seo/**`
- fap-api PR-train manifest/state only if explicitly authorized

## Forbidden

- Live GSC API calls, credential/env edits, collector writes, Search Channel writes, CMS writes, and raw query/PII output.

## Required Steps

1. Report row count by date and source engine.
2. Report latest date, data lag, null URL/query hash rates, duplicate key counts, and metric bounds.
3. Classify source state as live, fixture, stale, empty, or unknown.
4. Check brand/non-brand split and query masking.
5. Emit pass/fail gates that downstream opportunity work must honor.

## Required Checks

- `php artisan test --filter=SeoIntelGscCollectorTest`
- `php artisan test --filter=SeoDashApi01ReadOnlyApiContractTest`
- `php artisan test --filter=ArticleWeeklySeoObservationExportCommandTest`
- `php artisan seo-intel:collect --collector=gsc_foundation --dry-run --no-write --json`
- `git diff --check`

## Stop Conditions

Stop if the PR needs live GSC credentials, external calls, writes, raw query output, or any downstream action generation.

