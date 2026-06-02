# IQ Result Asset Scan Summary

Generated: 2026-06-02T17:05:07Z

## Current result-page asset status

The private IQ result page asset exists under the unified localized result route. `ResultClient` routes canonical `IQ_INTELLIGENCE_QUOTIENT` and legacy `IQ_RAVEN` payloads into the dedicated IQ shell. The route is noindex and dynamic.

## Current report-module asset status

`IqReportModule` exists and can render backend-owned paid narrative sections, dimension detail blocks, method boundaries, interpretation boundaries, entitlement states, and PDF/certificate placeholders. It intentionally does not render checkout, price, SKU, or buy/unlock CTA content.

## Key strengths

- Dedicated IQ result shell exists.
- Dedicated IQ report module exists.
- VSPR/VSI/NPR dimensions are modeled and rendered.
- Nullable IQ estimate is handled safely.
- Quality/stability fields render without frontend fabrication.
- Free/locked states suppress payment UI.
- Private result route is noindex.
- Tests cover core renderer, report module, result-client IQ branch, API contracts, and claim/SEO guards.

## Key weaknesses

- Visual hierarchy is still basic and card-oriented.
- Overall score hero, score reliability explanation, and percentile/CI explanation need productization.
- Three-dimension deep dives need backend-owned content and stronger web-native visualization.
- Paid report preview lacks mature content depth.
- PDF/certificate delivery is placeholder-only.
- CMS media assets for IQ result/report/certificate visuals are missing or not authoritative in frontend.
- Norm authority and claim eligibility remain backend-gated.

## Highest-value next PR

`IQ-RESULT-CONTENT-1` should define backend-owned result-page content fields and claim-safe payload structure before major frontend redesign. If backend fields are already available after review, then proceed to `IQ-RESULT-UI-1` for hero score + reliability section.

## Recommended design direction

Build a web-native result page with hero score, reliability/CI explanation, three dimension overview, dimension deep dives, visible method boundary, backend-owned report preview teaser, PDF/certificate placeholders only when backend payload exists, and retest/share/save next steps.

Do not copy the PDF/demo visual layout directly.

## Explicit warning

Do not design result page by frontend-only inference. Backend remains authority for IQ score, percentile, CI, claim eligibility, and entitlement.
