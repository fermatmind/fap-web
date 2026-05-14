# June SEO P0 Mobile SEO Measurement Gate

Scope: PR-SEO-JUNE-04

Runtime behavior changed: no.

This document defines the June mobile SEO and Core Web Vitals measurement gate.
The PR adds a deterministic, non-destructive gate only. It does not redesign UI,
change content, alter sitemap or `llms.txt`, add routes, or change tracking.

## Gate Inputs

The checked-in policy lives at
`docs/seo/generated/june-seo-p0-mobile-seo-gate.v1.json`.

Representative public route families:

| Family | Sample |
| --- | --- |
| home | `/en` |
| tests hub | `/en/tests` |
| test detail | `/en/tests/mbti-personality-test-16-personality-types` |
| article detail | `/en/articles/how-personality-shapes-attitude-toward-ai` |
| topic detail | `/en/topics/mbti` |
| personality detail | `/en/personality/intp-a` |
| career job detail | `/zh/career/jobs/accountants-and-auditors` |
| career recommendation detail | `/en/career/recommendations/mbti/intp-a` |

These samples are intentionally existing routes. They are not new URLs and they
do not expand sitemap or `llms.txt`.

## Required Checks

Every route sample must keep:

- mobile render success
- main content present
- CTA visibility where the page family has a visible product or CMS CTA
- FAQ/evidence visibility when backend or CMS provides those blocks
- private take/result/order/share/pay/payment/history flows out of indexing

The static gate anchors each sample to current App Router source files and, when
available, current URL inventory or route contract evidence.

## Core Web Vitals Policy

Mobile thresholds:

| Metric | Good | Needs improvement max | Notes |
| --- | ---: | ---: | --- |
| LCP | 2500 ms | 4000 ms | Requires browser/lab or field measurement. |
| CLS | 0.1 | 0.25 | Requires browser/lab or field measurement. |
| INP | 200 ms | 500 ms | INP requires field data. Lab interaction latency or total blocking time is only a proxy. |

For the June controlled SEO pilot, a route family can proceed when the static
gate passes and any lab-measured needs-improvement metric has an owner and a
tracked follow-up. For the full global SEO engine, route-family expansion needs
field CWV or RUM evidence for LCP, CLS, and INP.

## Commands

Static gate:

```bash
pnpm seo:check-mobile
```

Optional runtime fetch against a local or preview app:

```bash
MOBILE_SEO_BASE_URL=http://localhost:3000 pnpm seo:check-mobile
```

The runtime mode uses a mobile user agent and checks only non-destructive HTML
properties: response status, HTML payload presence, and absence of `noindex` on
the public route samples. It does not run Lighthouse and it does not mutate
generated SEO files.

## Repository Rule Impact

Content authority changed: no.

SEO/GEO enumeration changed: no.

Runtime behavior changed: no.

This gate is a measurement and governance artifact only. It preserves backend
and CMS authority for content, metadata, sitemap, and `llms.txt` surfaces.
