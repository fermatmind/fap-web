# Discoverability Authority Convergence

Train: public-runtime-authority-convergence-train
Scope: PR-PRAC-05
Runtime behavior changed: no

This matrix locks public discoverability authority ownership for sitemap, llms, llms-full, JSON-LD, FAQPage, Evidence Container, canonical/hreflang, and private-flow exclusions. It is a guardrail artifact only. It does not change sitemap URLs, llms URLs, JSON-LD output, FAQ rendering, Evidence rendering, route behavior, or public copy.

## Authority Rule

Backend/CMS owns mutable SEO and discoverability truth when a backend/CMS surface exists. Frontend may deterministically render, normalize, budget, and deny-list public exposure, but it must not silently widen public discoverability or invent SEO/GEO authority.

## Authority Matrix

| Surface | Current public authority owner | Required convergence rule |
| --- | --- | --- |
| Sitemap | `next-sitemap.config.js` plus backend sitemap-source and shared deny policy | New exposure requires explicit fixture and backend/CMS authority where available. |
| Backend sitemap-source | `/v0.5/seo/sitemap-source` consumer | Backend paths are normalized and still pass shared sitemap/indexability gates. |
| Static sitemap paths | `lib/seo/sitemapAuthorityAdapters.cjs` | Compatibility wrapper only; not final URL truth. |
| llms.txt | `app/llms.txt/route.ts` plus CMS/backend consumers and shared deny policy | New URL exposure requires fixture and private-flow exclusion proof. |
| llms-full.txt | `app/llms-full.txt/route.ts` plus CMS/backend enrichment and shared deny policy | Full entries must remain grounded in backend/CMS content or explicit compatibility fallback. |
| Topic fallback exposure | `TOPIC_FALLBACK_SLUGS` / `TOPIC_FALLBACKS` compatibility fixtures | No Topic Graph expansion or silent topic widening. |
| JSON-LD | structured-data contract and page renderers | JSON-LD must align with visible content, canonical URL, or backend structured data authority. |
| FAQPage | visible FAQ / answer-surface content | Hidden FAQ stuffing is forbidden. |
| Evidence Container | visible HTML first, then answer-surface grounding | FAQ-only pages are not Evidence Container ready. |
| Private flows | shared discoverability deny policy and indexing policy | Protected flows stay noindex, excluded from sitemap, excluded from llms, and without public JSON-LD. |

## Hard Gates

- sitemap/llms new exposure requires an explicit fixture.
- llms topic fallback remains governed and must not widen silently.
- JSON-LD fallback must be classified before it can become public authority.
- FAQPage must come from visible FAQ or visible answer-surface content.
- Evidence Container must be visible and grounded; hidden schema is not evidence.
- Private flows remain excluded from sitemap, llms, llms-full, indexable HTML, and public JSON-LD.

## No Runtime Change Statement

PR-PRAC-05 adds governance and contract coverage only. It does not change generated discoverability output, sitemap URL set, llms URL set, JSON-LD rendering, FAQ rendering, Evidence rendering, robots output, canonical output, hreflang output, or route behavior.
