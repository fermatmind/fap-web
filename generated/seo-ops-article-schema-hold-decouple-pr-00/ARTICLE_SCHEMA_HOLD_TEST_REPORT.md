# Article Schema Hold Test Report

## Passed checks
- `pnpm vitest run tests/contracts/article-personality-jsonld-projection-gates.contract.test.ts tests/contracts/articles-cleanup.contract.test.ts tests/contracts/article-jsonld-fallback-authority.contract.test.ts tests/contracts/article-answer-surface.contract.test.ts`
  - PASS: 4 files, 37 tests.
- `pnpm vitest run tests/contracts/article-publishing-runtime-truth.contract.test.ts tests/contracts/discoverability-authority-matrix.contract.test.ts tests/contracts/article-answer-surface.contract.test.ts tests/contracts/article-personality-jsonld-projection-gates.contract.test.ts tests/contracts/articles-cleanup.contract.test.ts tests/contracts/article-jsonld-fallback-authority.contract.test.ts`
  - PASS: 6 files, 50 tests.
- `pnpm typecheck`
  - PASS.
- `git diff --check`
  - PASS.
- `NEXT_PUBLIC_API_URL=https://api.fermatmind.com NEXT_PUBLIC_SITE_URL=https://fermatmind.com pnpm build`
  - PASS.
- `pnpm test:contract`
  - PASS: 473 files, 2694 tests.

## Coverage mapping
- noindex article does not output JSON-LD: covered.
- indexable article without schema gate does not output JSON-LD: covered.
- indexable article with explicit schema gate outputs JSON-LD: covered.
- existing allowed schema article behavior retained: covered by legacy allowlist contract.
- hreflang/canonical behavior unchanged: covered by source-token contracts and no code changes to canonical/hreflang logic.
