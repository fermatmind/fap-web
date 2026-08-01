# W9 independent QA — W1 MBTI result content

Verdict: **PASS**

This independent review is bound to frozen package SHA `9325013b870fd2496efc0882656240f91ce28ff4faaf1da42fb3dde3577b0ed3`, producer commit `a460acd0ff2c968c93fb5c005e77de1b0599971e`, and exact reviewed web renderer SHA `643b7a80f2cbf34f8cbfdce394128f7148aea395`.

## Scope and independence

- Reviewed all 46 frozen result rows exactly once: 24 preserved controls, 21 candidate assets, and the single PDF fixture target.
- Reviewed every candidate title, summary/teaser, body paragraph, reflection prompt, CTA field, authority mapping, entitlement boundary, and claim boundary.
- Preserved controls were reviewed for exact identity, authority owner, backend/API/consumer paths, entitlement, mobile/desktop alignment, leakage status, and the requirement that they remain references rather than regenerated package content.
- Used no producer self-QA as the verdict and did not read, copy, hash, or reuse any earlier W9 result report.
- Used no production attempt, report, account, score, answer, order, payment, recovery, CMS, database, secret, or private URL.
- Wrote no CMS, database, runtime, sitemap, llms, indexability, search, deployment, control-master, or release state.

## Package integrity and coverage

- All 9 declared package files matched their manifest SHA-256.
- Aggregate recomputation matched `9325013b870fd2496efc0882656240f91ce28ff4faaf1da42fb3dde3577b0ed3`.
- Frozen inventory reconciliation matched exactly: `46 = 24 + 21 + 1`.
- The 21 candidates were unique, their 21 translation-map rows were unique, candidate reader copy contained no Han characters, and every controlled permission remained `false`.
- Manual editorial review found natural English, distinct section purposes, explicit uncertainty/context language, no diagnosis, no fixed-identity or ability judgment, no hiring/admission/salary/career/relationship guarantee, and no unsupported reliability, validity, norm, percentile, certification, or “most accurate” claim.

## Renderer evidence

At renderer SHA `643b7a80f2cbf34f8cbfdce394128f7148aea395`:

- `traits.at_difference` is present in `RESULT_SECTION_ORDER`, survives normalization, stays between `trait_overview` and `faq`, and preserves its `body_md`.
- `faq` is present in the order and `faq` is a supported render.
- The active reader consumes an actual canonical `key=faq`, `render=faq` payload shaped as `items[{key,question,answer}]`.
- The focused reader test rendered the backend title and two complete FAQ items, while an item missing its answer stayed hidden.
- FAQ content is backend-only; the reader adds no local editorial fallback. Snapshot/PDF mode intentionally excludes this reader-only FAQ node because the PDF candidate contract is exercised through the separate frozen adapter below.

## PDF and entitlement evidence

The independent exact-package fixture harness used only the frozen private-safe slot values and:

- projected exactly 20 PDF-consumable candidates into 20 unique cards;
- preserved every candidate `row_id` as `card_key`;
- emitted non-empty title, description, bullets, and tips for every card;
- resolved all registered package tokens with zero unresolved token;
- exercised exactly four premium cards:
  - `W1-RESULT-SECTION-27-GROWTH-MOTIVATORS`
  - `W1-RESULT-SECTION-28-GROWTH-DRAINERS`
  - `W1-RESULT-SECTION-34-RELATIONSHIPS-REL_ADVANTAGES`
  - `W1-RESULT-SECTION-35-RELATIONSHIPS-REL_RISKS`
- projected protected premium bodies only under the frozen ready/full/full, unlocked, report-viewable, and PDF-downloadable synthetic entitlement;
- kept the non-PDF offer CTA on the locked-upsell result surface;
- used no live/private payload and serialized no private fixture value into this evidence.

## Automated validation

```text
/Users/rainie/Desktop/GitHub/fap-api/backend/vendor/bin/phpunit \
  --configuration phpunit.xml \
  --bootstrap /Users/rainie/Desktop/GitHub/fap-api/backend/vendor/autoload.php \
  tests/Feature/ContentAssets/MbtiResultEnglishPackageTest.php \
  tests/Feature/ContentImport/MbtiResultEnglishPackageImporterTest.php
PASS: 15 tests, 1663 assertions

pnpm exec vitest run \
  tests/contracts/mbti-result-section-registry.contract.test.ts \
  tests/contracts/mbti-shell-authored-fields.contract.test.tsx \
  tests/contracts/mbti-result-content-agent.contract.test.ts \
  tests/contracts/mbti-public-read-stability.contract.test.ts \
  tests/contracts/rich-result-report.contract.test.tsx \
  tests/contracts/mbti-result-page-pdf-smoke-quality-gate.contract.test.ts
PASS: 6 files, 43 tests

node scripts/result-page-agents/validate-mbti-result-content.mjs \
  --inventory generated/en-content-parity/W1-mbti
PASS: 46 result rows, errors=[]

node scripts/seo/validate-en-content-parity-control.mjs
PASS: 9 lanes, 13 asset cohorts, errors=[]

node scripts/seo/validate-en-content-parity-control.mjs \
  --manifest <non-persisted synthetic package_frozen manifest> \
  --artifact generated/en-content-parity/W9-independent-qa/W1-mbti-result-content/9325013b-renderer-643b7a80/independent_qa_report.json
PASS: exact package SHA, full 46-row coverage, W9 authority path, schema, checks, and permissions accepted; errors=[]
```

The first isolated Vitest invocation stopped before collecting tests because the QA worktree's placeholder `node_modules` did not resolve `@testing-library/jest-dom/vitest`. After pointing the isolated worktree at the repository's dependency installation, the same six exact-worktree files ran and passed 43/43. This was an environment-resolution retry, not a source change.

## Deferred gates

This PASS is package QA evidence only. It does not assert that the frozen package is currently active or that a live PDF consumes it.

Activation still requires the separately scoped result-runtime token renderer and unresolved-token rejection described by the frozen package, plus result-only/public-share isolation. Draft import, human editorial approval, activation, live QA, publication, sitemap/llms/indexability, search submission, and deployment remain separate controlled gates.

All CMS, database, draft-import, production-import, publication, activation, public-release, SEO-runtime, indexability, search-submission, deploy, and control-master write permissions remain `false`.
