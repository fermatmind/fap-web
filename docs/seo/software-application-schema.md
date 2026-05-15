# Test Detail SoftwareApplication Schema

Scope: PR-SEO-01B

Runtime behavior changed: eligible public test detail pages may emit conservative `SoftwareApplication` JSON-LD.
Sitemap URL set changed: no.
llms exposure changed: no.
Backend change required: no.

## Authority Rules

PR-SEO-01B adds only conservative `SoftwareApplication` schema for eligible public test detail pages. Fields must come from visible test detail content or existing backend/CMS/scale lookup fields already consumed by the page.

Allowed fields are limited to:

- `@context`
- `@type`
- `@id`
- `name`
- `description`
- `url`
- `inLanguage`
- `operatingSystem`
- `applicationCategory`
- `timeRequired` when the visible duration is valid
- `featureList` from visible facts such as question count, time, and visible variant labels

Product / Offer / Review / AggregateRating remain deferred. No fake ratings, fake review counts, price fields, availability fields, or hidden schema are allowed. No hidden schema may be used to compensate for missing visible page evidence.

## Eligibility

`SoftwareApplication` may render only when the page is public, indexable, has a canonical URL, and has visible test title and description. Private flows and noindex pages must not render it.

Baseline eligible families:

- MBTI with neutral self-understanding language.
- Enneagram with neutral self-understanding language.
- Big Five with bounded trait and workplace-behavior language, not career matching.
- RIASEC with bounded career-interest direction language, not precise recommendation.

Sensitive clinical/depression/anxiety and IQ/ability test pages are excluded from this baseline.

## Deferred Work

Future Product or Offer schema requires stable visible commerce payload and separate approval. Future Review or AggregateRating schema requires real visible review authority and separate approval.

This PR does not expand sitemap, `llms.txt`, `llms-full.txt`, pSEO, recommendation, payment, profile, memory, scoring, or backend contracts.
