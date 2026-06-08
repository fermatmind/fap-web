# SEO-ARTICLE-RIASEC-V2-SEARCH-SUBMISSION-PREFLIGHT-01

## Decision

`PASSED_READY_FOR_OPERATOR_CONTROLLED_SEARCH_SUBMISSION_ONLY`

RIASEC V2 search submission preflight passed for the published zh/en article pair. This is not a search submission action. It records which public canonical URLs are eligible for a later operator-controlled submission step after separate exact authorization.

## Inputs

- Source gate: `SEO-ARTICLE-RIASEC-V2-POST-PUBLISH-SMOKE-02`
- Source PR: `https://github.com/fermatmind/fap-web/pull/1070`
- Source merge commit: `538c329a5165c46dc52beceece343e8a8745edba`
- Source artifact: `docs/seo/generated/riasec-v2-post-publish-smoke-02.v1.json`

## Candidate URLs

| Locale | Article ID | Public canonical URL | Status | Submit eligibility |
| --- | ---: | --- | ---: | --- |
| zh | 40 | `https://fermatmind.com/zh/articles/riasec-holland-career-interest-test-explained` | 200 | Eligible only after exact search submission authorization |
| en | 41 | `https://fermatmind.com/en/articles/what-is-riasec-holland-code-career-interest-test` | 200 | Eligible only after exact search submission authorization |

The canonical sitemap is `https://fermatmind.com/sitemap.xml`. `robots.txt` advertises that sitemap.

## Public Surface Checks

| Surface | Status | Evidence |
| --- | ---: | --- |
| `robots.txt` | 200 | includes `Sitemap: https://fermatmind.com/sitemap.xml` |
| `sitemap.xml` | 200 | 2274 URLs; zh article hit 1; en article hit 1 |
| `llms.txt` | 200 | zh article hit 1; en article hit 1 |
| `llms-full.txt` | 200 | zh article hit 2; en article hit 2 |
| zh article | 200 | self canonical, `index, follow`, `Article` / `BreadcrumbList` / `FAQPage` |
| en article | 200 | self canonical, `index, follow`, `Article` / `BreadcrumbList` / `FAQPage` |

URL-attribute and sitemap/llms URL extraction found no result, orders, share, pay, payment, history, private, or tokenized URL.

## Channel Readiness

| Channel | Preflight decision | Allowed candidates | Current index status | Action taken |
| --- | --- | --- | --- | --- |
| GSC | Eligible after separate exact authorization | zh canonical, en canonical, canonical sitemap | Unknown | none |
| Baidu | Eligible for zh canonical after separate exact authorization | zh canonical, canonical sitemap | Unknown | none |
| IndexNow | Eligible after separate exact authorization | zh canonical, en canonical | Unknown | none |

IndexNow keyLocation is publicly reachable at the redacted apex key URL, returns 200, has a 32-byte body, and matches the expected SHA-256. The raw public key is intentionally not printed.

## Hard Boundaries

- No GSC submission.
- No Baidu submission.
- No IndexNow submission.
- No sitemap submission.
- No URL submission.
- No external search API call.
- No dashboard write.
- No CMS mutation.
- No article content change.
- No publish action.
- No deploy.
- No private result/order/share/pay/payment/history/tokenized URL access.

## Next Step

An operator may provide a separate exact search submission authorization naming the channel and candidate URL set. Without that authorization, search submission remains blocked.
