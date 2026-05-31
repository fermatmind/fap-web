# IQ Claim SEO Launch Guard

Scope: IQ-CLAIM-SEO-01.

## Runtime guard

- Canonical public IQ slug remains `/tests/iq-test-intelligence-quotient-assessment`.
- Missing backend SEO title or description forces noindex for the IQ landing surface.
- Unsafe IQ claims force noindex even when backend SEO metadata exists.
- SoftwareApplication JSON-LD remains blocked for IQ until backend norm authority exists.

## Claim boundary

Forbidden launch claims include official IQ score, certified IQ, diagnostic IQ, population percentile, and equivalent Chinese claims such as 官方智商 and 人群百分位.

Allowed launch copy is limited to original reasoning practice, raw score, nullable IQ estimates, and beta/internal validation wording.

## Discoverability boundary

Sitemap/llms exposure widened: no.

This PR does not add IQ URLs to sitemap, llms.txt, or llms-full.txt. Any future exposure expansion must come from backend SEO authority and pass the existing sitemap/llms guard path.

## License boundary

MyIQ.Science remains behind license verification gate. No third-party IQ questions, claims, or copied wording are introduced here.
