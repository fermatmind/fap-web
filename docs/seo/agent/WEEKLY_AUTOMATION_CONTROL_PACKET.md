# Weekly Automation Control Packet

Status: MVP0 contract.

The Monday FermatMind SEO automation must output a checkable SEO Agent control packet. This PR defines the packet contract only. It does not edit local automation TOML and does not change the scheduled job.

## Required Output Blocks

Weekly automation output must contain:

- `human_weekly_summary`: a short reader-facing summary of evidence and holds.
- `CONTROL_PACKET_JSON`: the machine-checkable packet that validates against `docs/seo/agent/schemas/SEO_AGENT_CONTROL_PACKET.schema.json`.
- `GPT55_HANDOFF_PROMPT`: the review prompt and packet path for GPT 5.5 Pro.
- `APPROVAL_MATRIX`: exact approval phrases and actions that remain blocked until separately authorized.

## Automation Context

The packet must include `automation_context` with:

- `read_only: true`.
- `automation_toml_change_allowed: false`.
- required output blocks listed explicitly.
- a statement that local automation config changes require a separate post-merge authorization.

## Codex Consumption

Codex may consume weekly packets only after running:

```bash
node scripts/seo/check-seo-agent-weekly-control-packet.mjs docs/seo/agent/examples/seo-agent-control-packet.weekly.example.json
```

Passing output is planning evidence only. It cannot enqueue Search Channel jobs, submit to providers, mutate CMS, change indexability, alter schema/hreflang, or modify automation config.
