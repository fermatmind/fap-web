# Enneagram Personality SEO — Content Asset Audits & Source of Truth

This directory stores **read-only content asset audit artifacts** for the Enneagram personality section of FermatMind.

These artifacts document the current state of Enneagram public pages, CMS content assets, discoverability coverage (sitemap / llms / llms-full), and content module completeness. They are used as durable references for remediation PR trains.

**Artifacts do NOT imply publish, index, or search-submission readiness.** All remediation must happen through explicit, gated PRs with their own review and approval.

## Current Artifact

- **[full-content-asset-audit-source-of-truth-2026-07-09.md](full-content-asset-audit-source-of-truth-2026-07-09.md)** — Full audit of 31 Enneagram pages (26 personality + 2 test + 3 articles), including runtime scan, source trace, content module completeness matrix, discoverability matrix, GPT workload estimate, blocker catalog, and batch plan.
- **[full-content-asset-audit-source-of-truth-2026-07-09.json](full-content-asset-audit-source-of-truth-2026-07-09.json)** — Machine-readable summary of the same audit, including blocker IDs, content gaps, and next-PR recommendation.

## Content Packages

- **[zh-center-content-package-2026-07-09.md](zh-center-content-package-2026-07-09.md)** — QA report for the zh-CN center content package (gut/heart/head).
- **[zh-center-content-package-2026-07-09.json](zh-center-content-package-2026-07-09.json)** — Machine-readable QA summary for the center content package.
- **[content-packages/zh-centers-v1/](content-packages/zh-centers-v1/)** — Full zh-CN center content drafts (JSON + MD per center, combined package JSON).

## Key Findings (2026-07-09)

- **26 personality pages** are live at runtime but contain only skeleton content (~60-100 words/page).
- **13/13** zh-CN content packages written (1 Hub + 9 Types + 3 Centers — complete).
- **0/26** personality pages appear in sitemap.xml, llms.txt, or llms-full.txt.
- **4 P0 blockers** identified: B2 (hardcoded noindex), B3 (SitemapGenerator Big Five only), B4 (no publish gate), B5 (LLMs feed excludes enneagram).

## Recommended Next PR

**ENNEAGRAM-ZH13-CONTENT-QA-01** — Editorial QA pass across all 13 zh-CN Enneagram pages.

## Warning

This directory contains **read-only audit artifacts only**. No file in this directory should be treated as configuration, runtime data, or deployable content. CMS writers, sitemap generators, LLMs feeds, and metadata pipelines are controlled elsewhere and are NOT affected by changes in this directory.
