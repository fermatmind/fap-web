# Article Schema Hold Decouple Design

## Task
SEO-OPS-ARTICLE-SCHEMA-HOLD-DECOUPLE-PR-00 decouples CMS article JSON-LD output from article indexability.

## Targeted scan summary
- Article runtime: `app/(localized)/[locale]/articles/[slug]/page.tsx` previously suppressed schema only when `noindex` was true. This coupled make-indexable with Article/Breadcrumb/FAQ JSON-LD output.
- Structured-data authority helper: `lib/seo/articlePersonalityAuthority.ts` already owned Article JSON-LD author/fallback authority and is the narrowest place to add an article schema gate.
- CMS SEO API scan: Article 42 SEO payload still contains `structured_data_keys` and `jsonld` while it is noindex, so those fields are not safe as schema approval signals.
- Existing RIASEC article scan: `/en/articles/what-is-riasec-holland-code-career-interest-test` is indexable and emits schema today; it is retained through a legacy compatibility allowlist.
- Existing tests: article runtime contracts existed for noindex schema suppression and article JSON-LD fallback authority, but some contracts still asserted indexability-driven schema output.

## Design
Add a runtime-level article schema gate independent from indexability.

The page may be indexable while schema remains disabled. Schema renders only when `resolveArticleSchemaGate` permits the specific JSON-LD family:
- Article JSON-LD
- BreadcrumbList JSON-LD
- FAQPage JSON-LD

## Non-goals
- No CMS mutation.
- No CMS migration.
- No sitemap or llms behavior changes.
- No hreflang or canonical behavior changes.
- No publish, search submission, or ISR revalidation.
