# /goal SEO-GPT55-HANDOFF-01

Status: READY_AFTER_CONTROL_PACKET

Proceed only after control packet dependency and manifest/state authorization are explicit.

## Mission

Make GPT 5.5 Pro review output schema-checkable, evidence-bound, and non-executing.

## Allowed Future Scope

- `docs/seo/agent/**`
- `docs/seo/agent/examples/gpt55-review-response.example.json`
- `scripts/seo/check-seo-agent-gpt55-handoff.mjs`
- `tests/contracts/seo-agent-gpt55-handoff.contract.test.ts`
- `package.json`
- PR-train manifest/state only if explicitly authorized

## Forbidden

- Automation TOML edits
- CMS writes, Search Channel writes, provider submissions
- Runtime sitemap/robots/llms/schema/hreflang behavior
- Any prompt language allowing GPT 5.5 Pro to approve execution directly

## Required Steps

1. Add a paste-ready GPT 5.5 Pro review prompt.
2. Add an example GPT response JSON.
3. Add checker logic for schema shape, evidence ids, allowed lanes, claim-risk blocking, and approval boundaries.
4. Ensure uncited evidence or inferred analytics fail validation.
5. Document Codex consumption rules.

## Required Checks

- `node scripts/seo/check-seo-agent-gpt55-handoff.mjs docs/seo/agent/examples/gpt55-review-response.example.json --packet docs/seo/agent/examples/seo-agent-control-packet.weekly.example.json`
- `pnpm exec vitest run tests/contracts/seo-agent-gpt55-handoff.contract.test.ts`
- `pnpm typecheck`
- `git diff --check`

## Stop Conditions

Stop if review output can approve CMS/search/schema/hreflang/indexability execution or bypass exact human approval.

