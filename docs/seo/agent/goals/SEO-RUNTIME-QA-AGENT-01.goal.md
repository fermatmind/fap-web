# /goal SEO-RUNTIME-QA-AGENT-01

Status: READY_AFTER_CONTROL_PACKET

Proceed only after `SEO-AGENT-CONTROL-PACKET-01` is merged to `main` or explicitly authorized as the base.

## Mission

Create a read-only public runtime SEO QA evidence generator that feeds the SEO Agent control packet.

## Allowed Future Scope

- `package.json`
- `scripts/seo/check-public-runtime-seo-qa.mjs`
- `docs/seo/generated/seo-runtime-qa-agent.v1.json`
- `docs/seo/seo-runtime-qa-agent.md`
- `docs/seo/agent/runtime-qa/default-samples.v1.json`
- `tests/contracts/seo-runtime-qa-agent.contract.test.ts`
- `tests/contracts/helpers/currentPrScope.ts`
- PR-train manifest/state only if explicitly authorized

## Forbidden

- Dashboard ingestion, CMS writes, Search Channel actions, provider submissions, revalidation, and runtime fixes.
- Fetching private/order/result/share/pay/take paths by default.
- Making live production QA a CI-required external network check without explicit approval.

## Required Steps

1. Reuse existing public live URL check helpers where possible.
2. Add pinned public samples and deny-policy private-path samples.
3. Emit bounded JSON with status, redirect, canonical, noindex, robots, hreflang, JSON-LD, source classification, and anomaly severity.
4. Emit optional Markdown report.
5. Keep anomalies as evidence only.

## Required Checks

- `pnpm exec vitest run tests/contracts/seo-runtime-qa-agent.contract.test.ts`
- `pnpm test:contract`
- `pnpm typecheck`
- `NEXT_PUBLIC_API_URL=https://api.fermatmind.com pnpm build`
- `git diff --check`

## Stop Conditions

Stop if the implementation would fetch private paths, mutate the site, submit search URLs, change dashboard UI, or auto-remediate runtime findings.

