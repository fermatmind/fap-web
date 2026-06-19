# /goal SEO-WEEKLY-AUTOMATION-CONTROL-PACKET-02

Status: READY_AFTER_CONTROL_PACKET

Proceed only after `SEO-AGENT-CONTROL-PACKET-01` and preferably `SEO-GPT55-HANDOFF-01` are available from repo truth. Do not edit local automation TOML in this PR.

## Mission

Make the weekly SEO automation output a checkable SEO Agent control packet.

## Allowed Future Scope

- `docs/seo/agent/**`
- `scripts/seo/check-seo-agent-weekly-control-packet.mjs`
- `tests/contracts/seo-agent-weekly-control-packet.contract.test.ts`
- `package.json`
- PR-train manifest/state only if explicitly authorized

## Forbidden

- `/Users/rainie/.codex/automations/**`
- Automation TOML edits
- CMS/search/provider/runtime SEO behavior changes

## Required Steps

1. Add `automation_context` to packet schema if needed.
2. Define required output blocks: human weekly summary, `CONTROL_PACKET_JSON`, `GPT55_HANDOFF_PROMPT`, and approval matrix.
3. Add checker rules for read-only mode, source classification, observation windows, hard holds, and GPT handoff presence.
4. Update or add an example weekly packet.
5. Document separate post-merge authorization for local automation config changes.

## Required Checks

- `node scripts/seo/check-seo-agent-weekly-control-packet.mjs docs/seo/agent/examples/seo-agent-control-packet.weekly.example.json`
- `pnpm exec vitest run tests/contracts/seo-agent-weekly-control-packet.contract.test.ts`
- `pnpm typecheck`
- `git diff --check`

## Stop Conditions

Stop if the implementation edits automation TOML, permits mutation lanes without exact approval, or changes production runtime behavior.

