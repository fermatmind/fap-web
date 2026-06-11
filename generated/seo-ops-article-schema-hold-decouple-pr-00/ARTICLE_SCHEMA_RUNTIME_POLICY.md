# Article Schema Runtime Policy

## Gate helper
`resolveArticleSchemaGate` lives in `lib/seo/articlePersonalityAuthority.ts`.

## Default policy
Schema defaults to closed. If CMS/runtime does not provide an explicit approval signal, Article/Breadcrumb/FAQ JSON-LD is not rendered.

## Noindex policy
If the article is noindex, schema is always held:
- `canRenderArticleJsonLd=false`
- `canRenderBreadcrumbJsonLd=false`
- `canRenderFAQPageJsonLd=false`
- source: `noindex_hold`

## Explicit allow policy
The runtime accepts explicit schema allow signals from `article.seoMeta`, including nested gate keys such as `article_schema_gate_v1.enabled` or equivalent camelCase/snakeCase schema gate fields.

When explicit allow is present and the article is not noindex:
- Article JSON-LD may render.
- BreadcrumbList JSON-LD may render.
- FAQPage JSON-LD may render only when visible FAQ items exist.

## Compatibility policy
The RIASEC article slug `what-is-riasec-holland-code-career-interest-test` remains allowed through a narrow legacy compatibility allowlist when CMS JSON-LD is present. This prevents accidental breakage of an already-indexable article while making new CMS articles safe by default.

## Article 42 implication
Article ID 42 can be moved from noindex to indexable while schema stays held, unless an explicit schema gate is later added and approved.
