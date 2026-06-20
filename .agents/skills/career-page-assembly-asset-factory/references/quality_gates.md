# Career Page Assembly Quality Gates

Page assembly turns PASS block assets into a reader-safe display surface. It does not create new career facts.

## PASS Requirements

- Every displayed factual section traces to a PASS frozen block asset.
- Missing or rejected upstream blocks fail closed or use an approved empty state.
- Section ordering supports reader decisions without hiding source boundaries.
- FAQ, source disclosure, review validity, and CTA modules are derived from existing PASS assets or product UI rules.
- Reader projection excludes raw enums, source IDs, evidence IDs, row hashes, internal lineage, search candidates, schema candidates, and audit labels.
- No unauthorized JSON-LD, sitemap, canonical, noindex, or `llms.txt` behavior changes.
- Locale rendering is clean: English pages contain no Chinese reader text, and Chinese pages do not expose backend English source prose as main content.

## Block-Specific Failures

- frontend/local fallback facts for CMS/API-backed career content
- new occupational claims introduced by assembly
- internal source lineage or audit field leakage
- candidate SEO/search/schema fields projected into reader payload
- CTA text presented as occupational evidence

## Staging And Import QA

Page assembly must run staging preview page smoke, API fail-closed checks, desktop/mobile rendering QA, and post-import SEO safety checks before public rollout.
