# Test Detail Authority Convergence

Scope: PR-PRA1B-02

Runtime behavior changed: yes, scoped to future unapproved test detail surfaces.

## No Expansion Statement

This PR does not add tests, expand Topic Graph, expand Career pSEO, change
scoring, change test take flow, change result/report, change checkout, change
payment, change entitlement, widen sitemap, widen llms, or add hidden schema.

## What Changed

Test detail metadata, FAQ, CTA, and FAQPage JSON-LD now pass through
`lib/seo/testDetailAuthority.ts`.

Existing approved test detail pages may keep compatibility fallback:

- `mbti-personality-test-16-personality-types`
- `big-five-personality-test-ocean-model`
- `enneagram-personality-test-nine-types`
- `holland-career-interest-test-riasec`
- `eq-test-emotional-intelligence-assessment`
- `iq-test-intelligence-quotient-assessment`
- `clinical-depression-anxiety-assessment-professional-edition`
- `depression-screening-test-standard-edition`

Future unapproved test detail pages without backend/CMS authority fail closed:

- Metadata fallback is not accepted as public SEO truth and the page is noindexed.
- FAQ fallback is not emitted.
- FAQPage JSON-LD is not emitted unless visible FAQ exists.
- Generic CTA and sticky CTA are not rendered unless CTA authority exists.

## Authority Matrix

| Surface | Preferred authority | Compatibility allowance | Fail-closed behavior |
| --- | --- | --- | --- |
| Metadata | `seo.surface.v1` / scale lookup title and description | Approved existing slugs only | Noindex unapproved missing-authority pages |
| FAQ | visible backend/CMS FAQ / answer surface | Approved existing slugs only | No visible FAQ and no FAQPage JSON-LD |
| FAQPage JSON-LD | visible FAQ items | Mirrors visible `mergedFaq` only | No hidden FAQ schema |
| CTA | `landing_surface_v1` / CMS CTA authority | Approved existing slugs only | No generic start CTA or sticky CTA |

## Evidence

- Runtime helper: `lib/seo/testDetailAuthority.ts`
- Runtime consumer: `app/(localized)/[locale]/tests/[slug]/page.tsx`
- Generated artifact: `docs/runtime/generated/test-detail-authority-convergence.v1.json`
- Contract: `tests/contracts/test-detail-authority-convergence.contract.test.ts`

## Residual Risk

This is a guard-first remediation. It contains expansion risk for future tests
and prevents hidden FAQ/schema fallback, but it does not remove compatibility
fallback from the existing approved test detail pages.
