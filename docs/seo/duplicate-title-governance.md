# Duplicate Title Governance Report

PR-SEOF-06 adds a read-only governance report for duplicate titles,
descriptions, canonical clusters, semantic entity clusters, and career family
variant risks.

## Generated Artifacts

- `docs/seo/generated/duplicate-title-governance.v1.json`
- `docs/seo/generated/duplicate-title-governance.v1.csv`

The generator is:

- `scripts/seo/generate-duplicate-title-governance-report.mjs`

The contract is:

- `tests/contracts/duplicate-title-governance.contract.test.ts`

## Classification Rules

- `acceptable_duplicate`: known duplicate pattern that does not currently imply
  SEO authority drift.
- `watchlist`: visible duplicate signal that should be monitored before content
  expansion.
- `migration_required`: canonical duplication that must be reconciled before
  affected page families expand.
- `CMS_remediation_required`: duplicate title/description cluster that should be
  fixed through backend/CMS metadata or entity ownership.
- `semantic_entity_risk`: possible duplicate entity family requiring canonical
  ownership decisions.

## Current Findings

The generated report currently shows:

- duplicate title clusters: 90
- duplicate description clusters: 0
- duplicate canonical clusters: 0
- semantic entity clusters: 75
- career family variant clusters: 3
- high-risk governance clusters: 114

The highest-priority visible risk remains career family duplication, especially
career family and industry pages that describe the same semantic family.

## Guardrails

- This PR does not change titles.
- This PR does not change descriptions.
- This PR does not change canonical URLs.
- This PR does not change CMS content.
- This PR does not change sitemap or llms output.

Content remediation must happen through backend/CMS authority, not frontend
metadata patches.
