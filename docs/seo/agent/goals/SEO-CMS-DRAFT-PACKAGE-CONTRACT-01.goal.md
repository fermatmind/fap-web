# /goal SEO-CMS-DRAFT-PACKAGE-CONTRACT-01

Status: READY_AFTER_CONTROL_PACKET

Proceed only after control packet dependency and manifest/state authorization are explicit.

## Mission

Define the SEO CMS draft package contract, dry-run gates, claim safety requirements, and exact approval boundaries.

## Allowed Future Scope

- `docs/seo/agent/**`
- `backend/docs/seo/**`
- `backend/tests/Feature/Cms/**` if contract tests are added
- PR-train manifest/state only if explicitly authorized

## Forbidden

- CMS writes, article body generation by Codex, publish, sitemap/llms/schema/hreflang enablement, and Search Channel actions.

## Required Steps

1. Define required package fields, locale expectations, translation group rules, active-surface guard, and claim gate.
2. Define draft-only, noindex, no-sitemap, no-llms, schema-hold, hreflang-hold, and search-hold flags.
3. Define exact approval phrases for dry-run, draft write, publish, and search release.
4. Define rollback path and required evidence output.
5. Add docs/tests only.

## Required Checks

- JSON/YAML parse for schemas and manifest entries.
- `php artisan test --filter=ArticleImportSeoContentPackageDraftCommandTest` if backend contract tests are added.
- `git diff --check`

## Stop Conditions

Stop if implementation writes CMS, generates publishable content, or enables publish/index/search/schema/hreflang.

