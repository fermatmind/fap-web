# Frontend Fallback Authority Inventory

Scope: PR-PRAC-03

Runtime behavior changed: no.

This document inventories frontend fallback authority surfaces that can affect public runtime truth, SEO/GEO truth, graph truth, recommendation truth, CTA truth, FAQ truth, or public claim boundaries. It does not remove fallback behavior or change rendering. It classifies current fallback authority so future expansion cannot silently turn frontend code into public truth.

## Classification Taxonomy

```text
safe_static
product_code_only
compatibility_wrapper
watchlist
migration_required
forbidden
```

## Fallback Inventory

| Fallback | Source | Classification | Public authority rule |
|---|---|---|---|
| Test metadata / FAQ / CTA fallback | `app/(localized)/[locale]/tests/[slug]/page.tsx` | `migration_required` | Current compatibility only; cannot expand to new tests or new public surfaces. |
| Topic CTA fallback | `app/(localized)/[locale]/topics/[slug]/page.tsx` | `migration_required` | CTA truth must converge to landing/CMS authority before topic expansion. |
| Personality fallback projection | `app/(localized)/[locale]/personality/[type]/page.tsx` | `migration_required` | Noindex/schema suppression reduces SEO risk, but frontend fallback remains user-visible truth. |
| Article JSON-LD fallback | `app/(localized)/[locale]/articles/[slug]/page.tsx` | `migration_required` | Compatibility only until backend/CMS JSON-LD authority is complete. |
| llms topic fallback | `app/llms.txt/route.ts` and `app/llms-full.txt/route.ts` | `migration_required` | Must not widen topic exposure silently. |
| Static sitemap layer | `next-sitemap.config.js` | `compatibility_wrapper` | Allowed only as a governed bridge; not final URL authority. |
| Local career recommendation placeholder | `lib/career/recommendationEngine.ts` | `forbidden` | Must not become public recommendation authority. |
| Frontend-local graph edge expansion | graph governance docs and frontend graph candidates | `forbidden` | Frontend must not invent graph authority. |
| Homepage/test hub forced product items | `lib/marketing/homepageContent.ts`, `lib/marketing/testsHubContent.ts` | `product_code_only` | Product shell only; not SEO/graph authority. |
| Test catalog seed fallback | `lib/content.ts` | `watchlist` | Existing compatibility only; new scale/test exposure must be backend-owned. |

## Hard Gates

- `migration_required` fallback cannot be silently added for a new scale, test, topic, page family, SEO surface, GEO surface, or public graph surface.
- `forbidden` fallback cannot be present as public authority.
- `compatibility_wrapper` fallback cannot be treated as long-term authority.
- Local ranking or local recommendation placeholders cannot be described as recommendation runtime.
- Frontend graph hardcode cannot become public graph truth.

## No Runtime Change Statement

PR-PRAC-03 adds inventory and contract coverage only. It does not remove existing fallbacks, alter fallback behavior, alter SEO output, alter llms output, alter sitemap output, or change public UX.
