# SEO CMS Readiness Checklist — 2026-06-02

Scope: CMS readiness and publishing gate checklist only. This document does not create CMS records, publish content, write frontend copy, or change runtime code.

## 1. Capability Checklist

| capability | status | evidence owner | notes |
|---|---|---|---|
| CMS can create article draft | Unknown until operator UI confirmation | CMS operator | Verify Article create form is available and saves as draft only. |
| Draft is noindex | Unknown until preview/source confirmation | CMS + SEO owner | Draft must not render as public indexable page. |
| Draft does not enter sitemap | Unknown until sitemap/source confirmation | SEO owner | Confirm unpublished article is absent from sitemap and `llms` surfaces. |
| Preview URL exists | Unknown | CMS operator | Confirm preview URL or preview token workflow. |
| Can set title / description / canonical | Code-supported, UI confirmation required | CMS operator | Verify fields are editable for article SEO. |
| Can set author / reviewer / updatedAt | Partial | CMS operator | Author/reviewer are form fields; updatedAt is system-managed. |
| Can set related_test_slug | Code-supported, UI confirmation required | CMS operator | Required for article-to-test routing. |
| Can set primary CTA / secondary CTA | Partial | CMS/product owner | Confirm whether via landing surface, answer surface, or content block workflow. |
| Can set FAQ | Partial | CMS/product owner | Confirm whether FAQ blocks are first-class or provided through approved CMS surface. |
| Can set internal links | Code-supported through CMS body | Content operator | Must link only to public canonical routes. |
| Can set tags/category | Code-supported, UI confirmation required | CMS operator | Verify taxonomy options exist for zh-CN articles. |
| Has editorial review | Code-supported, UI confirmation required | Editorial owner | Confirm review approval before publish. |
| Has publish approval | Code-supported, UI confirmation required | Release owner | Confirm exact human approval flow. |
| Can rollback | Unknown/Partial | CMS owner | Confirm revision rollback or unpublish/update process. |
| Published article enters sitemap | Code-supported, production confirmation required | SEO owner | Confirm after canary publish. |
| Unpublished article does not enter sitemap | Code-supported expectation, must verify | SEO owner | Required before first publish. |

## 2. Publish-Readiness Gate

Before any article publish, confirm:

- CMS record is a draft or reviewed unpublished record.
- Preview URL is available to reviewers.
- Draft is not present in sitemap.
- Draft is not present in `llms.txt` or `llms-full.txt`.
- Draft is not submitted to Google, Baidu, IndexNow, or any search submission channel.
- Canonical URL is the intended public canonical route.
- SEO title and description fields are filled by GPT-5.5 Pro and human-reviewed.
- Author/reviewer fields are correct.
- Related test and CTA targets point only to public canonical routes.
- Internal links point only to public canonical routes.
- No links point to result, orders, share, pay, payment, history, private test-taking routes, or user-specific URLs.
- FAQ, if present, is visible on the page and consistent with JSON-LD rules.
- Article, FAQ, and Breadcrumb schema are checked in rendered preview or production canary.
- Claim boundary review is complete.
- Measurement plan is recorded in the SEO baseline ledger.
- Publish approval is explicit, scoped, current, and human-provided.

## 3. Conditions That Allow Publish

Publish is allowed only when all are true:

- Editorial review is approved.
- SEO fields are complete.
- Canonical and indexability are correct.
- Draft/private/noindex routes are absent from sitemap and search submission queues.
- CTA target is correct for the article topic.
- Internal links are public and canonical.
- No unsupported medical, diagnostic, deterministic, or guaranteed-career claims are present.
- Preview has been reviewed by product/content/SEO owners.
- A 7-day and 14-day review owner is assigned.

## 4. Conditions That Forbid Publish

Do not publish if any are true:

- Preview URL is unavailable or cannot be verified.
- Draft appears in sitemap, `llms`, or search submission queue.
- Canonical is missing, malformed, or points to the wrong route.
- CTA points to private, payment, order, result, share, history, or user-specific route.
- Article target test is unclear.
- FAQ or structured data is hidden, inconsistent, or unavailable.
- Claim boundary review is incomplete.
- Required dashboard or baseline fields have no owner.
- P0 private URL regression is unresolved.
- The article has no assigned reviewer or publish approver.

## 5. First Canary Publish Flow

1. Select one article request card as the canary.
2. Ask GPT-5.5 Pro to generate the content asset package.
3. Human reviewer checks claim boundaries, CTA targets, and internal links.
4. CMS operator creates an unpublished article draft.
5. Verify draft preview.
6. Verify draft is noindex and absent from sitemap/search surfaces.
7. Verify SEO fields, canonical, author/reviewer, related test, internal links, FAQ visibility, and schema readiness.
8. Record baseline row before publish.
9. Obtain exact human publish approval.
10. Publish the canary.
11. Confirm production canonical, indexability, schema, sitemap inclusion, and absence of private URLs.
12. Wait for 7-day data before scaling.
13. Wait for 14-day data before deciding whether to revise, continue, or pause.
