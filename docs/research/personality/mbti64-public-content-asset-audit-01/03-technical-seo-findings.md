# Technical SEO Findings

## Current Route Surface

- `/en/personality` and `/zh/personality` return 200 and are indexable.
- 64 A/T variant pages return 200 in this audit.
- 32 bilingual A-vs-T comparison pages return 200 in this audit.

## Backend/Public API Authority

Repo scan found personality content consumers in `lib/cms/personality.ts`:

- list API: `/v0.5/personality`
- detail API: `/v0.5/personality/{slug}`
- SEO API: `/v0.5/personality/{slug}/seo`
- comparison API: `/v0.5/personality/comparisons/{comparison}`

The next technical PR should preserve backend authority and avoid adding frontend editorial copy.

## High-Value Fix Candidates

1. H2/section semantics: variant pages should expose stable semantic H2s for quick answer, meaning, A/T difference, careers, relationships, blind spots, FAQ, and method boundary.
2. Internal links: every variant should link to sibling A/T page, A-vs-T comparison, personality hub, MBTI test, and at least one relevant career/article destination.
3. Schema: verify whether WebPage/Breadcrumb/FAQ JSON-LD is present at runtime. Static parsing did not detect JSON-LD on many pages.
4. Hreflang/canonical: current audit records canonical/hreflang fields per URL; follow-up should diff against expected bilingual clusters.
5. Search enumeration: do not alter sitemap or llms in this audit. After content is upgraded and smoke-tested, run a separate sitemap/llms/search-submission PR.

## Holds

- No result-page changes.
- No MBTI scoring changes.
- No sitemap/llms changes.
- No production CMS import.
- No frontend local content fallback.
