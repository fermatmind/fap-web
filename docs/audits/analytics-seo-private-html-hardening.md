# ANALYTICS-SEO-P0-12 Private HTML Hardening Notes

Scope: `ANALYTICS-SEO-P0-12`

This PR hardens private/noindex route HTML after production smoke showed that third-party analytics network requests were suppressed, but private route HTML still contained the first-party analytics bootstrap.

## Implemented Boundary

- The Next proxy classifies private/noindex route families and sensitive query keys before rendering.
- Private/noindex requests receive an internal suppression header.
- The localized root layout reads that header and does not render `AnalyticsScripts`.
- Private response headers are tightened to:
  - `X-Robots-Tag: noindex, nofollow, noarchive, nocache`
  - `Cache-Control: private, no-store, max-age=0, must-revalidate`
  - `Referrer-Policy: no-referrer`

## Route Families

Suppressed route families:

- `/result`
- `/orders`
- `/orders/lookup`
- `/share`
- `/pay`
- `/payment`
- `/history`

Localized variants under `/zh` and `/en` use the same classifier.

## Remaining Framework Boundary

Next App Router can serialize dynamic route params and component props into internal flight scripts. This PR removes analytics bootstrap exposure from private HTML, but it does not redesign dynamic private routes such as `/result/[id]`, `/orders/[orderNo]`, or `/share/[id]`.

If the remaining dynamic id exposure must be eliminated completely, the follow-up route redesign should:

- avoid raw private identifiers in browser-visible pathnames;
- route users through a stable lookup page such as `/orders/lookup`;
- resolve identifiers through server-side reviewed state, short-lived exchange tokens, or first-party API calls;
- avoid passing raw private identifiers as Client Component props;
- preserve noindex, noarchive, no-store, and no-referrer headers.

## Publish / Deploy Notes

No CMS content, payment state machine, production environment variable, GTM, Baidu Ads, or backend behavior is changed by this PR.
