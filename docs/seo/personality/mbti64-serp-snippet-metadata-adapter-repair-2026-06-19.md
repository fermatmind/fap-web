# MBTI64 SERP Snippet Metadata Adapter Repair 01

## Summary

Decision: `REPAIR_IMPLEMENTED_PENDING_DEPLOY_SMOKE`.

This PR fixes the MBTI64 personality detail and comparison metadata adapter so the final HTML `<title>` uses a single `FermatMind` brand suffix when the backend/CMS SEO title already includes the brand. It does not change CMS content, public body copy, sitemap, llms, llms-full, Search Queue, enqueue, approval, or search submit behavior.

## Evidence

- `docs/seo/personality/mbti64-serp-snippet-ctr-package-2026-06-19.md` reported duplicated brand suffixes on 8/8 pilot URLs.
- The package expected title for each pilot URL already contained one `| FermatMind` suffix.
- The localized layout template appends `| FermatMind` to string titles.
- Description, H1, and private-route scans were already clean in the SERP snippet package.

## Repair

The personality route metadata now keeps backend/CMS SEO metadata as the source of truth and applies a local title-template guard only when the source title already ends with `| FermatMind`.

- If the CMS/API title already includes `| FermatMind`, the route returns `title.absolute` to prevent the localized layout template from appending the brand again.
- If the CMS/API title does not include the brand, the route keeps the normal string title so the localized layout template appends one brand suffix.
- The same guard applies to variant pages and A-vs-T comparison pages.

## Scope Boundary

No CMS content was edited. No local editorial fallback copy was added. No sitemap, llms, llms-full, indexability, Search Queue, or search submission behavior changed.

## Expected Post-Deploy Smoke

After deployment, the 8 MBTI64 pilot URLs should render HTML titles with exactly one `FermatMind` suffix. Canonical, description, H1, body sections, FAQ, robots, sitemap membership, and llms membership should remain unchanged.

## Deferred

- No CMS metadata rewrite in this PR.
- No search release in this PR.
- No llms-full exposure repair in this PR.
