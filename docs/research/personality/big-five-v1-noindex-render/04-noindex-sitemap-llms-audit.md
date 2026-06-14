# Big Five V1 Noindex, Sitemap, And LLMs Audit

## Noindex Status

All Big Five V1 public content routes introduced in this PR are noindex. The frontend route forces noindex metadata and preserves noindex-safe behavior when the backend API is unavailable.

## Sitemap Status

The 34 route candidates are not added to `public/sitemap.xml` and no sitemap enumerator was changed to include them.

Build-time sitemap generation was observed and restored to avoid accidental unrelated sitemap churn.

## LLMs Status

The 34 route candidates are not added to:

- `app/llms.txt/route.ts`
- `app/llms-full.txt/route.ts`

## Indexability Gate

This PR intentionally does not change public indexability. A later PR must explicitly authorize:

- backend asset index eligibility
- sitemap inclusion
- llms inclusion
- search/share preview policy
- production live route smoke after backend deploy/import

## Evidence

- Code evidence: `app/(localized)/[locale]/personality/big-five/[[...slug]]/page.tsx`
- Contract evidence: sitemap/llms absence test in `tests/contracts/personality-big-five-v1-noindex-render.contract.test.ts`
- Generated inventory evidence: `docs/seo/generated/metadata-surface-inventory.v1.csv`
- Generated inventory evidence: `docs/seo/generated/metadata-surface-inventory.v1.json`
