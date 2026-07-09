# Enneagram Personality SEO — Content Asset Audits & Source of Truth

This directory stores **read-only content asset audit artifacts** for the Enneagram personality section of FermatMind.

These artifacts document the current state of Enneagram public pages, CMS content assets, discoverability coverage (sitemap / llms / llms-full), and content module completeness. They are used as durable references for remediation PR trains.

**Artifacts do NOT imply publish, index, or search-submission readiness.** All remediation must happen through explicit, gated PRs with their own review and approval.

## Current Artifact

- **[full-content-asset-audit-source-of-truth-2026-07-09.md](full-content-asset-audit-source-of-truth-2026-07-09.md)** — Full audit of 31 Enneagram pages (26 personality + 2 test + 3 articles), including runtime scan, source trace, content module completeness matrix, discoverability matrix, GPT workload estimate, blocker catalog, and batch plan.
- **[full-content-asset-audit-source-of-truth-2026-07-09.json](full-content-asset-audit-source-of-truth-2026-07-09.json)** — Machine-readable summary of the same audit, including blocker IDs, content gaps, and next-PR recommendation.

## Key Findings (2026-07-09)

- **26 personality pages** are live at runtime but contain only skeleton content (~60-100 words/page).
- **10/13** zh-CN content packages written; 3 center pages (gut/heart/head) still need content.
- **0/26** personality pages appear in sitemap.xml, llms.txt, or llms-full.txt.
- **4 P0 blockers** identified: B2 (hardcoded noindex), B3 (SitemapGenerator Big Five only), B4 (no publish gate), B5 (LLMs feed excludes enneagram).

## Recommended Next PR

**ENNEAGRAM-ZH-CENTER-CONTENT-PACKAGE-01** — Generate content drafts for zh-CN center pages (gut/heart/head).

## Warning

This directory contains **read-only audit artifacts only**. No file in this directory should be treated as configuration, runtime data, or deployable content. CMS writers, sitemap generators, LLMs feeds, and metadata pipelines are controlled elsewhere and are NOT affected by changes in this directory.
