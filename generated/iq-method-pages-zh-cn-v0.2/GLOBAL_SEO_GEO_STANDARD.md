# Global SEO/GEO Standard

Status: `draft_review_only`

## Page structure standard

Each page must contain:

1. CMS-rendered title as H1. `article.md` must not include H1.
2. Opening 2-3 sentences answering the search intent directly.
3. A visible "这是什么 / 这不是什么" boundary block.
4. A method explanation section.
5. "可以理解什么" and "不能据此推断什么" sections.
6. 3-5 visible FAQ items.
7. Internal links to the IQ test page and adjacent method pages.
8. No private-flow links.

## Draft SEO policy

- `robots=noindex,follow`
- `sitemap_eligible=false`
- `llms_eligible=false`
- `is_public=false`
- `reviewer_status=method_and_claim_review_required`

## Structured data candidates

Allowed only after visible content and CMS review:

- Article
- BreadcrumbList
- FAQPage, only when visible FAQ remains in public HTML

Forbidden:

- Product
- SoftwareApplication
- Certificate
- Course
- MedicalWebPage

## GEO evidence container

Each page includes `answer_surface_v1.json` and `geo_answer_block.json`. These are editor-supplied planning artifacts, not hidden schema and not runtime truth.

## Internal link policy

All pages must link to:

- `/zh/tests/iq-test-intelligence-quotient-assessment`
- at least two adjacent IQ method pages

Do not link to `/take`, `/results`, `/orders`, `/pay`, `/share`, `/history`, private tokens, local files, preview URLs, or admin routes.
