# Attribution parameter canonical audit

## Inputs

Twenty synthetic observations cover homepage, Test Hub, MBTI, RIASEC, Big Five, personality and article surfaces across EN/ZH and mobile/desktop. Candidate parameters:

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `gclid`, `fbclid`, `msclkid`
- `ref`, `source`

The only value used was `technical_audit`; no user or private identifier appeared.

## Result

- **20/20 SSR samples passed.**
- **20/20 hydrated DOM samples passed after selector-bounded observation.**
- HTTP status remained 200 without parameter-cleanup redirects.
- Canonical and `og:url` pointed to the same-locale public base URL.
- No schema block contained the parameter or synthetic value.
- No sampled parameter URL appeared in sitemap, llms or llms-full.

The current approved tracking contract explicitly accepts the five UTM keys plus `gclid`, `msclkid` and `fbclid` with safe non-personal values. `ref` and `source` were audit candidates only; their business retention remains UNKNOWN.

## Root-cause classification

No canonical regression was observed, so no metadata/middleware/redirect/API/hydration repair PR is proposed. CTA attribution safety is supported by the current allowlist contract for the eight approved parameters, not by clicking or submitting a private flow.

## Limits

GSC parameter observations and URL Inspection are UNKNOWN. A correct canonical today does not prove historical parameter URLs have left the search index. The audit does not make an index-cleared claim.
