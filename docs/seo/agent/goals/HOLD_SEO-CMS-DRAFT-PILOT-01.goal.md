# HOLD /goal SEO-CMS-DRAFT-PILOT-01

Status: HOLD_CMS_SAFETY

Do not execute this PR now.

## Why Held

This PR can touch CMS draft state. It must wait for package contract, GPT 5.5 Pro content/package approval, exact package path and hash, dry-run approval, and separate draft-write approval.

## Unhold Requirements

- `SEO-CMS-DRAFT-PACKAGE-CONTRACT-01` lands.
- `SEO-OPPORTUNITY-QUEUE-READONLY-01` lands if the package is opportunity-driven.
- GPT 5.5 Pro approves the exact content package.
- User provides exact package path and content hash.
- User approves dry-run first.
- User separately approves draft write.

## Future Allowed Scope

- `backend/app/Console/Commands/ArticleImportSeoContentPackageDraft.php`
- `backend/app/Services/Cms/SeoContentPackage/**`
- `backend/tests/Feature/Cms/**`
- `backend/docs/seo/**`

## Still Forbidden

- Codex writing article body content.
- Publishing articles.
- Enabling sitemap, llms, schema, hreflang, or search-provider release.
- Search Channel queue writes or live submissions.

## Future Checks

- `php artisan test --filter=ArticleImportSeoContentPackageDraftCommandTest`
- `php artisan test --filter=SeoContentPackageJsonNormalizerTest`
- `php artisan test --filter=SeoIntelContentPublishRehearsalDryRunTest`
- `php artisan test --filter=ArticlePublishControlledCommandTest`
- `git diff --check`

