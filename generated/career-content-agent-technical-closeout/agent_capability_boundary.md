# Career Content Agent Capability Boundary

Generated: `2026-06-23T07:33:56.981986+00:00`

## What The Agent Can Do Now

- Read canonical 1046 seed and build `control_<previous> + new_50` manifests.
- Generate block evidence only after source rules are satisfied.
- Run schema, trust, editorial, locale, template-reuse, leakage, and block-specific gates.
- Generate synthesis and reader-facing assets only after evidence/trust PASS.
- Repair failed rows within bounded repair loops.
- Freeze PASS baselines with SHA manifests.
- Track block state in `generated/fermatmind-content-agent-state/`.
- Render next-goal recommendations.
- Prepare staging/import/readiness artifacts.

## What The Agent Must Not Do Without Separate Approval

- Change schema contracts or source policies beyond the current scope.
- Modify runtime page code, SEO runtime, CMS resources, sitemap, llms, canonical, noindex, robots, or JSON-LD.
- Write staging preview rows.
- Move rows to editorial/approved.
- Import production.
- Treat `PASS`, `freeze`, `editorial PASS`, or PR merge as production approval.
- Put search/SEO/schema candidate fields into reader assets or runtime payloads.
- Let page assembly invent facts missing from upstream blocks.

## Backend/Frontend Boundary

- fap-api is the import/runtime authority for career assets, authority gates, page assembly preview, AI Impact preview, salary assets, runtime projection, and reader-safe API projection.
- fap-web should render API-provided reader-safe payloads and fail closed if data/status/flag/allowlist does not permit display.
- fap-web must not add fallback editorial content for career pages.

## Closeout Boundary

This task line can be considered technically closed only after:

1. `career-adjacent-comparison` reaches 1046 PASS/frozen.
2. `career-page-assembly` composes all PASS blocks and reaches 1046 PASS/frozen.
3. Full integrated QA PASS.
4. Staging preview design and dry-run package PASS.

Public release is a separate line and closes only after staging write, editorial approval, approved transition, exact-SHA production import, and post-import live QA/SEO safety.
