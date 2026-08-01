# CAREER-SEARCH-ENTRY-PILOT-READINESS-01

## Decision

`GO` for one bounded 10-slug / 20-URL career Search Channel canary package.

- Task 12 dependency: `PASS_APPLY_READBACK` (`2546dbd6`), after Batch Review run `30678387519`.
- Read-only observation: `2026-08-01T06:15:11.998Z`.
- Candidate authority: 50 backend-authorized search-entry rows (4 `stable`, 46 `approved_candidate`).
- Complete gate passes: 29; rejected without gate reduction: 21.
- Selected SEO authority sources: 18 dedicated endpoint responses and 2 explicitly recorded detail `seo_contract` fallbacks.
- Target-set SHA-256: `452c677f702494383bba9995342312a3c0d68fd89386db6d1c708c153963668c`.
- Artifact SHA-256: `1da786a678304201aeaa895d247999642d62222c8681a014a3a89f9b30a6096f`.
- Rollback batch ID: `career-search-entry-pilot-452c677f70249438`.

This decision is readiness evidence only. It does not submit URLs, change sitemap membership, invoke Search Channel, write CMS/database state, deploy, or roll back anything.

## Exact target set

Selection is deterministic: `stable` first, then quality score descending, then canonical slug ascending. A stable row that failed any live gate was excluded rather than preferred.

| # | Tier | Score | Slug |
|---:|---|---:|---|
| 1 | stable | 86 | `data-scientists` |
| 2 | approved_candidate | 60 | `actuaries` |
| 3 | approved_candidate | 60 | `administrative-services-managers` |
| 4 | approved_candidate | 60 | `advertising-promotions-and-marketing-managers` |
| 5 | approved_candidate | 60 | `aerospace-engineering-and-operations-technicians` |
| 6 | approved_candidate | 60 | `aerospace-engineers` |
| 7 | approved_candidate | 60 | `agricultural-and-food-scientists` |
| 8 | approved_candidate | 60 | `agricultural-engineers` |
| 9 | approved_candidate | 60 | `compensation-and-benefits-managers` |
| 10 | approved_candidate | 60 | `compensation-benefits-and-job-analysis-specialists` |

Each slug is bound to exactly these two canonical URL shapes:

- `https://fermatmind.com/en/career/jobs/{slug}`
- `https://fermatmind.com/zh/career/jobs/{slug}`

The complete URLs and per-locale evidence hashes are frozen in `docs/seo/generated/career-search-entry-pilot-readiness-01.v1.json`.

## Gate evidence

Every selected URL passed all of the following in the same read-only run:

- detail API HTTP 200 and current backend `search_entry_authority` eligibility;
- current SEO authority, including `index,follow`, index eligibility, metadata fingerprint and a frozen SEO observation SHA; actual dedicated SEO-endpoint status is preserved separately, while an approved detail `seo_contract` fallback is explicitly labeled and counted rather than rewritten as an endpoint 200;
- public page HTTP 200, exact self-canonical, and rendered `index, follow`;
- backend sitemap-source membership for both locales;
- approved, non-stale reviewer evidence with locale-aligned review timestamp;
- backend-approved review projection in both the list and detail responses; the backend emits `approved` only while the current private six-target-per-slug content, SEO, visible-claims, and index-entry package still matches the immutable `approved_all` attestation;
- locale-aligned content and SEO contract versions, plus frozen per-locale content/SEO observation SHAs and a public review-projection SHA;
- exact SEO-authority canonical equality with the locale target, independently of the rendered page canonical;
- visible-content thickness measured from the public rendered HTML body above the fixed floor, independently of API authority payload size, so no thin/shell page is selected;
- approved hero, definition, and FAQ authority markers present in the rendered body, with only marker hashes and counts frozen in the artifact;
- rendered `FAQPage` and `BreadcrumbList`, with every FAQ entity a structured `Question` plus `acceptedAnswer` and the valid question count equal to visible backend authority;
- no positive unsupported salary, income, hiring, employment, or career-success guarantee.

The private approved target/package SHAs intentionally remain backend-only. PR3 does not copy a live SHA into an "expected" field. It relies on the backend's fail-closed public projection of that private comparison, then freezes independent read-only observation SHAs for PR4 lineage. The generator treats absent, stale, mismatched, or malformed projection evidence as failure. If fewer than 10 candidates pass, it emits `HOLD`, returns no target set, and exits non-zero.

## Reproduction

```bash
node scripts/seo/generate-career-search-entry-pilot-readiness.mjs --pretty
pnpm vitest run tests/contracts/career-search-entry-pilot-readiness.contract.test.ts
```

The selector and artifact hashing are deterministic for the same observations. The live collection timestamp and evidence naturally change on a fresh observation; the committed artifact is the frozen PR3 decision input for PR4.

## Negative guarantees and next gate

- No career body or metadata was created or modified.
- No CMS, database, sitemap, publication, indexability, queue, `llms`, deploy, rollback, Search Channel, or URL-submission write occurred.
- This artifact does not claim indexing, ranking, citation, hiring, salary, or career outcomes.
- PR4 may consume only the exact target-set and artifact hashes above. Any target, authority, content, SEO, canonical, robots, sitemap, or schema drift must fail closed and return to readiness evaluation.

Repository rule impact: none. This PR adds a read-only selection/evidence control and does not change runtime or content ownership.
