# MBTI64 Content Package Pilot V2 Final

Optimized second-version content assets for the 8-page MBTI/A-T pilot cohort.

## Primary file

- `mbti64-content-package-pilot-v2.json`

## Supporting files

- `pages/*.json` — per-page extracted row assets.
- `mbti64-content-package-pilot-v2-qa-report.json` — local QA result.
- `validate-mbti64-content-package-v2.mjs` — validation script.
- `qa-diff-summary.md` — optimization summary.
- `operator-notes.md` — remaining holds before Codex import.

## Scope

This package is content-only. It does not publish, import CMS drafts, change sitemap, change llms files, submit search URLs, alter scoring, or touch result/payment/private routes.

## Validation

Run:

```bash
node validate-mbti64-content-package-v2.mjs
```
