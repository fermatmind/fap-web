# CAREER-SEARCH-ENTRY-PILOT-READINESS-01

## Decision

`GO` for one bounded 10-slug / 20-URL career Search Channel canary package.

- Task 12 dependency: `PASS_APPLY_READBACK` (`2546dbd6`), after Batch Review run `30678387519`.
- Read-only observation: `2026-08-01T04:46:32.199Z`.
- Candidate authority: 50 backend-authorized search-entry rows (4 `stable`, 46 `approved_candidate`).
- Complete gate passes: 42; rejected without gate reduction: 8.
- Target-set SHA-256: `89f3f026b30574ba2aa5234a2aa46b2c61880735f746cb3bf6d7e8f3f7386682`.
- Artifact SHA-256: `3cf8428121a18911033ca9be9c690c979217c8047473539e7b910c334f128585`.
- Rollback batch ID: `career-search-entry-pilot-89f3f026b30574ba`.

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
| 9 | approved_candidate | 60 | `anthropologists-and-archeologists` |
| 10 | approved_candidate | 60 | `appraisers-and-assessors-of-real-estate` |

Each slug is bound to exactly these two canonical URL shapes:

- `https://fermatmind.com/en/career/jobs/{slug}`
- `https://fermatmind.com/zh/career/jobs/{slug}`

The complete URLs and per-locale evidence hashes are frozen in `docs/seo/generated/career-search-entry-pilot-readiness-01.v1.json`.

## Gate evidence

Every selected URL passed all of the following in the same read-only run:

- detail API HTTP 200 and current backend `search_entry_authority` eligibility;
- current SEO authority, including `index,follow`, index eligibility, metadata fingerprint and a frozen SEO evidence SHA;
- public page HTTP 200, exact self-canonical, and rendered `index, follow`;
- backend sitemap-source membership for both locales;
- approved, non-stale reviewer evidence with locale-aligned review timestamp;
- locale-aligned content and SEO contract versions, plus frozen per-locale content/SEO evidence SHAs;
- visible-content thickness above the fixed floor, so no thin/shell page is selected;
- rendered `FAQPage` and `BreadcrumbList`, with FAQ item count equal to visible backend authority;
- no positive unsupported salary, income, hiring, employment, or career-success guarantee.

The generator treats absent or malformed evidence as failure. If fewer than 10 candidates pass, it emits `HOLD`, returns no target set, and exits non-zero.

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
