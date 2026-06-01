# CAREER-LLMS-FULL-10K-BUDGET-GATE-01

## Executive Summary

This PR adds a scoped frontend contract gate for `llms-full.txt` at future
10k Career scale.

The public Career detail rollout currently exposes 1046 Career details across
EN/ZH, or 2092 canonical URLs. The future scale target is materially larger:
10,000 Career details would produce 20,000 bilingual detail URLs. `llms-full.txt`
must not become a request-time full database renderer or per-detail fanout job.

## Gate

The contract verifies:

- `llms-full.txt` remains artifact/cache-first.
- Career URL enumeration uses backend sitemap/directory authority.
- The request path uses `LLMS_ROUTE_LIMITS.careerJobs`, not an unbounded 20k
  iteration.
- No full jobs index or per-detail SEO fanout is reintroduced.
- A degraded HTTP 200 response is still available when no complete artifact is
  ready.
- Held slugs remain absent.

## Authority Boundary

This PR does not change content authority or URL exposure. Backend/CMS remains
the source of Career URL truth. The frontend only consumes the approved
discoverability authority surfaces and enforces runtime budget behavior.

## Validation

Required validation:

- `pnpm exec vitest run tests/contracts/career-llms-full-10k-budget-gate-01.contract.test.ts tests/contracts/llms-route-fanout.contract.test.ts`
- `pnpm typecheck`
- `NEXT_PUBLIC_API_URL=https://api.fermatmind.com NEXT_PUBLIC_SITE_URL=https://fermatmind.com pnpm build`
- `pnpm test:contract`
- `git diff --check`

## Final Decision

`career_llms_full_10k_budget_gate_completed_ready_for_directory_ux_facets_parity`

## Next Task

`CAREER-DIRECTORY-UX-FACETS-PARITY-01`
