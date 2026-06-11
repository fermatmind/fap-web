# Post Publish Smoke Test

Purpose: verify an already operator-published public page.

Inputs:

- Public URL.
- Expected slug and locale.
- Operator publish note.
- Expected canonical, metadata, FAQ, CTA, schema, sitemap, llms, and hreflang state.

Checks:

1. URL returns 200.
2. Canonical is correct.
3. Index/noindex state is expected.
4. Sitemap status is expected.
5. llms status is expected.
6. Hreflang status is expected.
7. Schema status is expected.
8. FAQ is visible.
9. CTA is visible.
10. `article_to_test_click` is trackable separately from test start.
11. No private URL.
12. No token/order/result ID.
13. Cache/revalidation evidence is operator-provided or marked not verified.

Output: `POST_PUBLISH_SMOKE_<slug>.md` using `assets/post_publish_smoke_template.md`.

No-go: do not revalidate, submit search, or mutate CMS.
