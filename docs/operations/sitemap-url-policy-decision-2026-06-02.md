# Sitemap URL Policy Decision Record - 2026-06-02

PR train: `SEO-SITEMAP-P0-05`

Scope: docs and contract only. This decision record does not modify sitemap runtime, submit URLs to search platforms, call GSC/Baidu/IndexNow APIs, create CMS content, publish CMS content, or change indexing behavior.

## Decision Summary

Production `https://fermatmind.com/sitemap.xml` is the URL truth for the current public sitemap set. The checked-in local `public/sitemap.xml` is a local artifact and must not be treated as production URL truth.

Current policy decisions:

- Keep `/zh` out of sitemap.
- Keep `/en/career/jobs` and `/zh/career/jobs` out of sitemap.
- Keep backend-gated career job detail URLs in sitemap only when the backend public API marks them indexable.
- Do not submit or promote draft, private, noindex, payment, result, order, share, history, tokenized, or personalized URLs.
- Do not change runtime sitemap generation in this PR.

## Observed Counts

| source | observed URL count | conclusion |
|---|---:|---|
| Production `https://fermatmind.com/sitemap.xml` | 2270 loc | Authoritative current public sitemap truth for this PR. |
| Local `public/sitemap.xml` | 261 loc | Local artifact only; explains the smaller local count and must not be used as production truth. |
| Generated inventory from production sitemap | 2270 rows | Stored in `docs/seo/generated/url-inventory.v1.json` and `.csv` for contract review. |

The 2270 vs 261 difference is expected because production sitemap generation reads backend/CMS public authority APIs with production data, while the checked-in local artifact is a smaller static artifact.

## Production URL Family Snapshot

Generated inventory from production sitemap currently reports:

| route family | count |
|---|---:|
| `career_job_detail` | 2092 |
| `personality_detail` | 64 |
| `article_detail` | 28 |
| `career_guide_detail` | 20 |
| `test_detail` | 12 |
| `career_hub` | 6 |
| other public families | 48 |

The production sitemap does not include exact `/zh`, `/en/career/jobs`, or `/zh/career/jobs`.

## `/zh` Policy

Decision: keep `/zh` out of sitemap.

Rationale:

- Production `/zh` currently redirects to `/`.
- Root `/` remains the Chinese/root canonical entry in the current public strategy.
- A redirected or alias locale home URL should not be listed as an independent sitemap loc.

`/zh` can be reconsidered only if the site intentionally changes to a separate canonical Chinese home page with stable metadata, hreflang, and public rendering behavior.

## `/zh/career/jobs` Policy

Decision: keep `/zh/career/jobs` and `/en/career/jobs` out of sitemap.

Rationale:

- Career job index pages are public and indexable, but the repository policy still treats the directory shell as `public_not_sitemap`.
- The value of this surface is primarily in backend-gated child job detail URLs.
- `lib/seo/indexingPolicy.cjs` keeps the heavy jobs index launch-quarantined from sitemap and llms exposure until a separate performance/cache/content uniqueness gate is approved.
- Adding `/zh/career/jobs` or `/en/career/jobs` to sitemap would be a runtime URL set change and is explicitly out of scope for this PR.

This policy does not block users or crawlers from reaching the public directory. It only keeps the directory shell out of sitemap promotion.

## Career Job Detail Policy

Decision: career job detail URLs may remain in sitemap when backend public authority marks each item indexable.

Required conditions:

- Public and canonical.
- Backend/CMS authority-backed.
- Not draft, private, noindex, tokenized, user-specific, or personalized.
- Not a duplicate alias of another canonical job URL.
- Has meaningful metadata and useful visible content.
- Does not expose result, order, payment, share, history, or private identifiers.

The current production sitemap has 2092 career job detail URLs. That count comes from the production sitemap, not from local hardcoded frontend content.

## URL Truth Boundary

Current source hierarchy:

1. Production sitemap: current public URL truth.
2. Backend/CMS public APIs: generation authority for public content and career job detail enumeration.
3. `next-sitemap.config.js`: adapter and generation contract.
4. Checked-in local sitemap artifacts: reproducible local artifacts only.
5. Documentation inventory: review artifact, not runtime authority.

Future integration note: if `seo_intel` or CMS issue summary later consumes sitemap facts, it must read from the authoritative public sitemap/API contract rather than inventing frontend URL truth.

## URLs To Prioritize

Priority public URL families remain:

- Chinese MBTI test landing page.
- Chinese Holland/RIASEC test landing page.
- Chinese Big Five test landing page.
- Published article detail pages.
- Public personality type pages.
- Backend-gated high-quality career job detail pages.

`/zh/career/jobs` and `/zh` are intentionally not priority sitemap submission URLs under the current policy.

## URLs Not To Promote

Do not submit, promote, or add to sitemap:

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
- URLs with unresolved claim-boundary or CTA-target review.

Private URL families must never enter sitemap, `llms.txt`, `llms-full.txt`, Search Channel queue, GSC submit flow, Baidu submit flow, IndexNow, or paid campaign landing URL lists.

## Explicit Deferrals

This PR intentionally does not:

- Submit or push sitemap URLs to search platforms.
- Change CMS content.
- Change career jobs runtime.
- Add `/zh/career/jobs`, `/en/career/jobs`, or `/zh` to sitemap.
- Start collector, growth attribution, `seo_intel`, or SEO dashboard data integration.
- Change public route rendering, canonical tags, metadata, robots, hreflang, JSON-LD, or llms generation.

## Repository Rule Impact

This is a SEO/GEO authority documentation and contract update. It clarifies that production sitemap plus backend/CMS public APIs are authoritative for sitemap URL truth. It does not introduce a new content surface, frontend content fallback, sitemap runtime behavior, or CMS publishing workflow.
