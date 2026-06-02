# Sitemap URL Policy Decision Record — 2026-06-02

Scope: decision record only. This document does not modify sitemap runtime, submit URLs, call search APIs, or change indexing behavior.

## 1. Current Observed Counts

| source | observed URL count | notes |
|---|---:|---|
| Production `https://fermatmind.com/sitemap.xml` | 2270 loc | Production public sitemap included large career job detail inventory. |
| Local `public/sitemap.xml` | 261 URLs | Current local artifact is smaller and should not be treated as production URL truth. |

## 2. Current Difference Hypothesis

- Production sitemap is generated from backend/CMS public authority APIs with richer production data.
- Local sitemap artifact may reflect local generation time, local API availability, cached data, or a smaller local/staging authority set.
- `next-sitemap.config.js` uses backend public APIs for article, career, personality, topic, content page, and test paths.
- Production has many more career job detail URLs than the local artifact.

## 3. Questions To Verify

- Which backend API base URL was used for the production sitemap generation?
- Which backend API base URL was used for the local sitemap artifact?
- Is production sitemap generated at build time, deploy time, or postbuild using live API data?
- Are career job detail URLs all public, canonical, indexable, and content-rich?
- Should `/zh/career/jobs` be included as a hub URL, or intentionally omitted as an interactive/search page?
- Should `/zh` be included as an independent localized home URL, or intentionally canonicalized through the root strategy?
- Does the production sitemap include every currently published zh-CN article detail page?
- Does the production sitemap exclude every draft, private, noindex, payment, result, order, share, and history route?

## 4. `/zh/career/jobs` Sitemap Decision Framework

Include `/zh/career/jobs` if all are true:

- It is a stable public canonical hub.
- It has unique indexable content beyond an empty search shell.
- It links to high-quality career job detail pages.
- Metadata title and description are search-friendly.
- It is not primarily a parameterized or thin listing page.
- It does not expose private, account, order, payment, or personalized recommendation state.

Keep `/zh/career/jobs` out of sitemap if any are true:

- It is mostly an interactive search/filter shell.
- The value is primarily in child job detail URLs.
- It produces duplicate or weak indexable states.
- Canonical/hreflang/metadata behavior is not confirmed.

## 5. `/zh` Sitemap Decision Framework

Include `/zh` if all are true:

- `/zh` is the canonical Chinese home page.
- It is not redirected or canonicalized to `/`.
- It has locale-specific metadata and visible content.
- It is intended to rank as the Chinese brand/home entry.

Keep `/zh` out of sitemap if any are true:

- Root `/` is the canonical page for the same content.
- `/zh` is only a locale alias or redirect target.
- hreflang/canonical strategy intentionally avoids separate localized home locs.

## 6. Career Job Detail Quality Standard

Career job detail URLs may remain in sitemap only when each URL is:

- Public and canonical.
- Indexable.
- Not a private recommendation, checkout, result, order, share, payment, or history URL.
- Not a duplicate alias of another canonical job URL.
- Backed by backend/CMS authority.
- Has meaningful metadata.
- Has enough visible content to be useful without relying on hidden schema only.
- Has internal links back to relevant career/test hubs.
- Has no raw private identifiers.

## 7. URLs To Prioritize For Search Engines

Priority public URL families:

- Chinese MBTI test landing page.
- Chinese Holland/RIASEC test landing page.
- Chinese Big Five test landing page.
- Chinese articles index and published article detail pages.
- Public MBTI personality type pages.
- Confirmed high-quality career job detail pages.
- `/zh/career/jobs` only after sitemap hub decision is approved.
- `/zh` only after localized home canonical decision is approved.

## 8. URLs Not To Push For Now

Do not submit or promote:

- Draft articles.
- Noindex pages.
- Non-canonical URLs.
- `/result/**`
- `/orders/**`
- `/share/**`
- `/pay/**`
- `/payment/**`
- `/history/**`
- URLs with `orderNo`, `order_id`, `resultId`, `attemptId`, `reportId`, `payment_id`, `transaction_id`, or `token`.
- Any URL with unresolved claim-boundary or CTA-target review.

## 9. Private URL Sitemap Rule

Private URL families must never enter sitemap, `llms.txt`, `llms-full.txt`, Search Channel queue, GSC submit flow, Baidu submit flow, IndexNow, or paid campaign landing URL lists.

Forbidden families include:

- result
- orders
- share
- pay
- payment
- history
- private test-taking or recovery routes
- user-specific or tokenized URLs
