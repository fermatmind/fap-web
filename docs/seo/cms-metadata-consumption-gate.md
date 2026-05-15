# CMS Metadata Consumption Gate

Scope: PR-SEO-01D.

Backend/CMS owns article metadata truth. The frontend consumes the article payload and SEO payload deterministically, then applies the existing i18n SEO Passport and canonical authority contracts.

## Article Metadata Rules

- SEO title comes from backend/CMS SEO payload when present.
- Meta description comes from backend/CMS SEO payload when present.
- Article excerpt is only a description fallback when SEO description is absent.
- Canonical remains self-referencing and guarded by the canonical authority contract.
- Hreflang alternates and x-default remain governed by the i18n SEO Passport.
- OpenGraph image URL comes from backend/CMS SEO image when present, then article cover image variants.
- OpenGraph image alt uses CMS-provided `cover_image_alt` only when available.
- Twitter image metadata uses the same CMS-provided alt when the existing metadata model accepts image objects.
- Missing cover alt must not produce hidden or fake metadata alt text.

## Out of Scope

- No content rewrite.
- No sitemap URL set changes.
- No `llms.txt` or `llms-full.txt` exposure changes.
- No Product, Offer, Review, AggregateRating, or fake rating schema.
- No backend, payment/order/report entitlement, recommendation, profile/memory, or scoring changes.

## Repository Rule Impact

This PR tightens frontend consumption of backend/CMS metadata. It does not make frontend code the authority for article content, article SEO fields, covers, or publication state.
