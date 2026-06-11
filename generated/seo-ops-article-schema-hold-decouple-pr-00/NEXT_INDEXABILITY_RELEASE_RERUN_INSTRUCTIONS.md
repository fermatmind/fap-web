# Next Indexability Release Rerun Instructions

## After this PR merges and deploys
Rerun:

`SEO-OPS-ENGLISH-INDEXABILITY-RELEASE-00`

## Article
- Article ID: 42
- Public route: `https://fermatmind.com/en/articles/why-mbti-and-holland-code-results-dont-match`

## Approved release settings
- Approve claim gate for indexability.
- Make indexable.
- Hold sitemap eligible.
- Hold llms eligible.
- Hold hreflang.
- Hold Search Channel / GSC / Baidu / IndexNow.
- Hold schema.

## Expected runtime after make-indexable
- Public route remains 200.
- Robots should no longer be noindex after the CMS indexability mutation.
- Article/Breadcrumb/FAQ JSON-LD should remain absent until explicit schema gate approval.
- Hreflang remains governed by existing policy and this PR does not change it.
- Sitemap/llms/search submission remain held unless separately approved.
