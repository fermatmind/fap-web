# SEO-ARTICLE-RIASEC-V2-POST-PUBLISH-SMOKE-02

## Decision

`PASSED_READY_FOR_SEARCH_SUBMISSION_PREFLIGHT_ONLY`

Read-only post-publish smoke completed for the RIASEC V2 article pair. This task records runtime evidence only. It did not mutate CMS, edit article content, publish, deploy, submit search URLs, or access private result/order/share/pay/payment/history/tokenized URLs.

## Runtime Articles

| Locale | URL | Status | Canonical | Robots | Schema |
| --- | --- | ---: | --- | --- | --- |
| zh | `https://fermatmind.com/zh/articles/riasec-holland-career-interest-test-explained` | 200 | exact self-canonical | `index, follow` | `Article`, `BreadcrumbList`, `FAQPage` |
| en | `https://fermatmind.com/en/articles/what-is-riasec-holland-code-career-interest-test` | 200 | exact self-canonical | `index, follow` | `Article`, `BreadcrumbList`, `FAQPage` |

Both article pages expose 6 FAQ schema entries.

## CTA And Tracking

Both articles expose CTA links to the public canonical RIASEC test route:

- zh: `/zh/tests/holland-career-interest-test-riasec`
- en: `/en/tests/holland-career-interest-test-riasec`

Observed CTA URLs include attribution parameters: `entry_surface`, `source_page_type`, `source_route_family`, `source_slug`, `content_id`, `target_action`, `test_slug`, `target_test_slug`, `cta_id`, `landing_path`, and `entrypoint`.

Tracking note: live HTML contains the attribution query parameters, not the literal `article_to_test_click` event name. Source contract evidence remains in `components/cta/SeoTrackedCtaLink.tsx`, which maps article-detail CTA clicks to `article_to_test_click`, and `tests/contracts/seo-cms-canary-web01-article-to-test-click.contract.test.tsx`, which verifies the event mapping and `/api/track` acceptance.

## Discoverability

| Surface | Status | Evidence |
| --- | ---: | --- |
| `https://fermatmind.com/sitemap.xml` | 200 | 2274 URLs; zh article hit 1; en article hit 1; last-modified `Mon, 08 Jun 2026 03:54:16 GMT` |
| `https://fermatmind.com/llms.txt` | 200 | zh article hit 1; en article hit 1 |
| `https://fermatmind.com/llms-full.txt` | 200 | zh article hit 2; en article hit 2 |

No private result/order/share/pay/payment/history/private/tokenized route was detected in checked public surfaces.

## Boundaries

- CMS mutation performed: no
- Article content changed: no
- Publish action performed: no
- Search submission performed: no
- External search API call performed: no
- Deploy performed by this task: no
- Private result/order/share/pay/payment/history/tokenized URL access: no

## Next Step

`SEO-ARTICLE-RIASEC-V2-SEARCH-SUBMISSION-PREFLIGHT-01`
