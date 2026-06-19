# /goal SEO-OPS-READMODEL-BRIDGE-01

Status: READY_AFTER_CONTROL_PACKET

Proceed only after `SEO-AGENT-CONTROL-PACKET-01` is merged to `main` or the user explicitly authorizes using the control-packet branch as the base. If this PR id is missing from PR-train manifest/state, request explicit authorization to add it before implementation.

## Mission

Bridge the fap-web SEO operations dashboard from mock/static artifact assumptions to a sanitized read-model boundary with explicit source labels.

## Allowed Future Scope

- `app/(localized)/[locale]/ops/seo-operations/page.tsx`
- `components/ops/seo/**`
- `lib/ops/seoOperationsReadModel.ts` or equivalent local read adapter
- `tests/contracts/seo-ops-readmodel-bridge.contract.test.ts`
- Existing dashboard shell contract tests
- `docs/codex/pr-train.yaml` and `docs/codex/pr-train-state.json` only if explicitly authorized

## Forbidden

- CMS writes, draft creation, publish, revalidation, Search Channel enqueue/submission, provider calls, env edits, automation TOML edits.
- Runtime sitemap, robots, llms, schema, or hreflang behavior changes.
- Treating artifact/mock data as live truth.

## Required Steps

1. Confirm base branch and manifest/state authorization.
2. Add typed source labels: `live_read_model`, `artifact_sample`, `mock_fixture`, `unavailable`.
3. Allow the server route to pass sanitized operations data into the client dashboard.
4. Preserve unknown/missing metrics as unknown or empty, not zero.
5. Keep all action buttons UI-only unless a later PR creates reviewed backend actions.
6. Add guard tests forbidding CMS/search/revalidation/env/cookie/private-data access.

## Required Checks

- `pnpm exec vitest run tests/contracts/seo-issue-queue-dashboard-shell.contract.test.ts tests/contracts/seo-ops-readmodel-bridge.contract.test.ts`
- `pnpm typecheck`
- `pnpm seo:check-sitemap`
- `pnpm seo:check-mobile`
- `NEXT_PUBLIC_API_URL=https://api.fermatmind.com NEXT_PUBLIC_SITE_URL=https://fermatmind.com pnpm build`
- `git diff --check`

## Stop Conditions

Stop if live endpoint schema is unknown, returns private data, requires client credentials, or the fix needs CMS/search/provider/runtime SEO mutation.

