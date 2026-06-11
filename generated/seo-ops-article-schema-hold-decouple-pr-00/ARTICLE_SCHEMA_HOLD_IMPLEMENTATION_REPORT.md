# Article Schema Hold Implementation Report

## Changed runtime files
- `lib/seo/articlePersonalityAuthority.ts`
- `app/(localized)/[locale]/articles/[slug]/page.tsx`

## Changed contract/documentation files
- `tests/contracts/article-answer-surface.contract.test.ts`
- `tests/contracts/article-jsonld-fallback-authority.contract.test.ts`
- `tests/contracts/article-personality-jsonld-projection-gates.contract.test.ts`
- `tests/contracts/article-publishing-runtime-truth.contract.test.ts`
- `tests/contracts/articles-cleanup.contract.test.ts`
- `tests/contracts/fixtures/seo-foundation/article-jsonld-fallback-authority.v1.json`
- `tests/contracts/helpers/currentPrScope.ts`
- `docs/seo/article-jsonld-fallback-authority.md`
- `docs/seo/generated/article-personality-jsonld-projection-gates.v1.json`
- `docs/seo/generated/discoverability-authority-matrix.v1.json`

## Implementation notes
- Replaced indexability-only schema gating with `resolveArticleSchemaGate`.
- Article JSON-LD now requires both JSON-LD authority and schema gate permission.
- Breadcrumb and FAQ schema now require the schema gate.
- No hreflang/canonical/sitemap/llms changes were made.
- No CMS content/package files were added.
- `components/marketing/HomePageExperience.tsx` was not touched.
