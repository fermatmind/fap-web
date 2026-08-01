# CAREER-SEARCH-ENTRY-PILOT-READINESS-01

## Decision

`HOLD`; no career Search Channel canary package is authorized.

- Task 12 dependency: `PASS_APPLY_READBACK` (`2546dbd6`), after Batch Review run `30678387519`.
- Read-only observation: `2026-08-01T07:18:39.115Z`.
- Candidate authority: 50 backend-authorized search-entry rows (4 `stable`, 46 `approved_candidate`).
- Complete gate passes: 1; rejected without gate reduction: 49.
- Hold reason: `insufficient_eligible_candidates:1/10`.
- Target-set SHA-256: `null`.
- Artifact SHA-256: `6db765c60b3df504b36ec706b0d30b57a940f9986cb2d73d04fe780371f6e438`.
- Rollback batch ID: `null`.

This decision is readiness evidence only. It does not submit URLs, change sitemap membership, invoke Search Channel, write CMS/database state, deploy, or roll back anything.

## Exact target set

None. Selection remains deterministic (`stable`, then quality score descending, then canonical slug ascending), but the control emits zero targets whenever fewer than ten complete rows pass. It does not preserve or reuse the earlier candidate set after a stricter fresh observation fails.

The dominant live rejection is inconsistent crawler-visible metadata topology: the same exact bilingual career URL can return canonical and robots inside `<head>` on one read but as streamed body metadata on another. Only `<link rel="canonical">` and robots metadata inside the crawler response `<head>` satisfy this readiness gate. An independent single-concurrency read-only run also held at 9/10, so reducing collector concurrency did not remove the inconsistency.

## Gate evidence

The following gates remain mandatory for every future selected URL; the frozen run did not produce ten rows satisfying all of them:

- detail API HTTP 200 and current backend `search_entry_authority` eligibility;
- exact detail payload `identity.canonical_slug` equality with the requested authority row;
- current SEO authority, including `index,follow`, index eligibility, metadata fingerprint and a frozen SEO observation SHA; actual dedicated SEO-endpoint status is preserved separately, while an approved detail `seo_contract` fallback is explicitly labeled and counted rather than rewritten as an endpoint 200;
- exact crawler-visible title, description, Open Graph title/description, and Twitter title/description equality with the current backend SEO authority, with only a live metadata observation SHA frozen;
- public page HTTP 200, exact `<head>` self-canonical, and exactly one non-conflicting `<head>` `index,follow` robots meta in the explicit Googlebot view;
- no non-indexable `X-Robots-Tag` response directive (`noindex`, `nofollow`, or `none`);
- backend sitemap-source membership for both locales;
- approved, non-stale reviewer evidence with locale-aligned review timestamp;
- backend-approved review projection in both the list and detail responses; the backend emits `approved` only while the current private six-target-per-slug content, SEO, visible-claims, and index-entry package still matches the immutable `approved_all` attestation;
- locale-aligned content and SEO contract versions, plus frozen per-locale content/SEO observation SHAs and a public review-projection SHA;
- exact SEO-authority canonical equality with the locale target, independently of the rendered page canonical;
- visible-content thickness measured from the public rendered HTML body above the fixed floor, independently of API authority payload size, so no thin/shell page is selected;
- approved hero, definition, and FAQ authority markers present in the rendered body, with only marker hashes and counts frozen in the artifact;
- rendered `FAQPage` and `BreadcrumbList`, with every FAQ entity a structured `Question` plus `acceptedAnswer` and the valid question count equal to visible backend authority;
- no positive unsupported salary, income, hiring, employment, or career-success guarantee, with negation scoped to the same clause as the matched guarantee.
- no such unsupported guarantee in the independently rendered public body, even when all approved authority markers remain present.

The private approved target/package SHAs intentionally remain backend-only. PR3 does not copy a live SHA into an "expected" field. It relies on the backend's fail-closed public projection of that private comparison, then freezes independent read-only observation SHAs for PR4 lineage. The generator treats absent, stale, mismatched, or malformed projection evidence as failure. If fewer than 10 candidates pass, it emits `HOLD`, returns no target set, and exits non-zero.

## Reproduction

```bash
node scripts/seo/generate-career-search-entry-pilot-readiness.mjs --pretty
pnpm vitest run tests/contracts/career-search-entry-pilot-readiness.contract.test.ts
```

The selector and artifact hashing are deterministic for the same observations. The live collection timestamp and evidence naturally change on a fresh observation. A committed `HOLD` artifact has zero targets and cannot be consumed by PR4.

## Negative guarantees and next gate

- No career body or metadata was created or modified.
- No CMS, database, sitemap, publication, indexability, queue, `llms`, deploy, rollback, Search Channel, or URL-submission write occurred.
- This artifact does not claim indexing, ranking, citation, hiring, salary, or career outcomes.
- PR4 remains blocked until a fresh post-repair PR3 observation returns `GO` with an exact target-set and artifact SHA. Any target, authority, content, SEO, canonical, robots, sitemap, or schema drift must fail closed and return to readiness evaluation.

Repository rule impact: none. This PR adds a read-only selection/evidence control and does not change runtime or content ownership.
