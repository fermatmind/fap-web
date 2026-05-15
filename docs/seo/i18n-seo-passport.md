# i18n SEO Passport

Scope: PR-SEO-01A

Runtime behavior changed: metadata alternate assembly only.
Sitemap URL set changed: no.
llms exposure changed: no.
Schema.org changed: no.

## Authority Rules

Backend/CMS owns published sibling alternate authority. Frontend must not invent unpublished article alternates from slug parity. Article detail may only emit `en` and `zh-CN` hreflang entries when backend/CMS article SEO provides those sibling URLs.

## Article Detail Rule

Article detail uses the i18n SEO Passport helper to merge backend/CMS-provided alternates with the existing metadata `x-default` policy. This fixes the previous overwrite path where article metadata could drop `x-default` after calling `buildPageMetadata`.

If backend/CMS provides only one language alternate, the page emits only that known language alternate, the canonical URL, and a documented safe `x-default` fallback. It does not synthesize `/en/articles/{same_slug}` or `/zh/articles/{same_slug}`.

## Test Detail Rule

Test detail pages have a deterministic published bilingual route family. Their `x-default` points to the test-specific English canonical URL, for example `/en/tests/{slug}`, instead of the home page. This is route-authority assembly, not sitemap expansion.

## Deferred Work

PR-SEO-01B will handle test-entry `SoftwareApplication` schema separately. PR-SEO-01A intentionally does not add `Product`, `SoftwareApplication`, `AggregateRating`, `Review`, or fake rating schema.
