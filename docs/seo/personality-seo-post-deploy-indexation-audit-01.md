# PERSONALITY-SEO-POST-DEPLOY-INDEXATION-AUDIT-01

This document freezes the public post-deploy SEO/indexation baseline for FermatMind personality pages after the 64 A/T detail pages and 32 A/T comparison pages were merged.

No runtime behavior change. No CMS mutation. No frontend editorial fallback content.

## Scope

- Hubs: 2 URLs (`/zh/personality`, `/en/personality`)
- Detail pages: 64 URLs (`32 A/T` per locale)
- Comparison pages: 32 URLs (`16 A-vs-T` per locale)
- Index files: `sitemap.xml`, `llms.txt`, `llms-full.txt`
- GSC: sample plan recorded, authenticated inspection not executed in this repository PR

## Public Scan Result

All 98 public personality URLs returned HTTP 200. Canonical tags were present, hreflang alternates were present, and no scanned page declared `noindex`.

`sitemap.xml` currently includes all 64 detail URLs and all 32 comparison URLs. `llms.txt` also includes all 64 detail URLs and all 32 comparison URLs.

`llms-full.txt` currently includes the 64 detail URLs but not the 32 comparison URLs. The repair for this was merged in fap-web PR #1144 as merge commit `965af83206299260acd498b3bb7cb89142c538fd`; production still needs a frontend deploy and post-deploy revalidation before this item can be marked live-fixed.

## Known Gaps

- `live_llms_full_missing_comparison_urls`: high severity. Live `llms-full.txt` has `0/32` comparison URLs.
- `gsc_url_inspection_not_sampled`: medium severity. Requires authenticated Search Console URL Inspection.
- `faq_semantic_surface_missing`: high severity. FAQPage JSON-LD is absent from the 98 scanned URLs.
- `personality_images_missing_from_live_html`: high severity. Personality image HTML markers were not found on the 98 scanned URLs.

## GSC Sample Plan

Run URL Inspection for these 12 URLs after the frontend deploy containing PR #1144:

- `https://fermatmind.com/zh/personality`
- `https://fermatmind.com/en/personality`
- `https://fermatmind.com/zh/personality/intj-a`
- `https://fermatmind.com/zh/personality/entj-t`
- `https://fermatmind.com/zh/personality/infp-a`
- `https://fermatmind.com/zh/personality/esfp-t`
- `https://fermatmind.com/en/personality/intj-a`
- `https://fermatmind.com/en/personality/entj-t`
- `https://fermatmind.com/en/personality/infp-a`
- `https://fermatmind.com/en/personality/esfp-t`
- `https://fermatmind.com/zh/personality/intj-a-vs-intj-t`
- `https://fermatmind.com/en/personality/intj-a-vs-intj-t`

Record coverage state, indexing state, canonical selected by Google, crawl allowed status, page fetch state, and last crawl timestamp.

## Repository Rule Impact

No repository rule update is required. This PR is audit/contract only and does not change content authority, runtime behavior, sitemap generation, llms generation, frontend fallback behavior, or CMS ownership.
