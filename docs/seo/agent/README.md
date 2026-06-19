# FermatMind SEO Agent

Status: MVP0 control-plane contract

The FermatMind SEO Agent is a staged SEO operations control system. It collects evidence, classifies source authority, proposes scoped PRs or dry-run packages, and records observation windows before any higher-risk SEO work runs.

## What It Is

- A control packet and evidence ledger.
- A source-of-truth classifier.
- A read-only runtime QA and Ops evidence framework.
- A way to hand bounded evidence to GPT 5.5 Pro for review.
- A guardrail system for future PR, CMS package, GSC data-quality, and search-readiness lanes.

## What It Is Not

- Not an autonomous CMS writer.
- Not a provider submission bot.
- Not a browser-clicking CMS operator.
- Not a replacement for fap-api/CMS/`seo_intel` authority.
- Not a way to treat mock, fixture, unknown, or generated data as production truth.

## Files

- `SEO_AGENT_CONTROL_PACKET_SPEC.md`: control packet purpose, lifecycle, authority hierarchy, approvals, and stop conditions.
- `schemas/SEO_AGENT_CONTROL_PACKET.schema.json`: machine-readable packet schema.
- `examples/seo-agent-control-packet.weekly.example.json`: realistic MVP0 weekly packet example.
- `AGENT_ACTION_LANES_AND_GUARDRAILS.md`: lanes, hard blocks, command denylist, and stop rules.
- `EVIDENCE_SOURCE_CLASSIFICATION.md`: source classes and allowed/forbidden use.
- `OBSERVATION_WINDOWS.md`: D1/D7/D14/D28 observation plan.
- `GPT55_REVIEW_PACKET.md`: GPT 5.5 Pro handoff rules.
- `schemas/GPT55_REVIEW_RESPONSE.schema.json`: machine-readable GPT 5.5 Pro response schema.

## Current MVP Status

`SEO-AGENT-CONTROL-PACKET-01` is docs/contracts-only. It does not change runtime code, CMS data, backend behavior, frontend behavior, automation TOML, generated SEO artifacts, provider state, production DB, sitemap, robots, `llms`, schema, or hreflang.

Current decisions:

- Control Packet: GO.
- Runtime QA Agent: GO after control packet.
- Ops ReadModel Bridge: GO after control packet.
- GSC Data Quality Validator: GO after control packet.
- Opportunity Queue: HOLD until GSC data quality passes.
- CMS Draft Agent: HOLD until dry-run package, preview QA, and human approval gates exist.
- Search Channel live action: HOLD.

## Next PR Order

1. `SEO-OPS-READMODEL-BRIDGE-01`
2. `SEO-RUNTIME-QA-AGENT-01`
3. `SEO-GSC-DATA-QUALITY-01`
4. `SEO-OPPORTUNITY-QUEUE-01` after GSC data quality passes.
5. `SEO-CMS-DRAFT-PACKAGE-PILOT-01` after package/preview/approval gates exist.

The recommended next PR after this one is `SEO-OPS-READMODEL-BRIDGE-01`, because the current `/ops/seo-operations` dashboard is still mock/static-artifact-backed and should be connected to backend `seo_intel` read models before it informs later operator decisions.

## Hard Holds

- No CMS save/import/publish.
- No GSC Request Indexing.
- No Baidu push.
- No IndexNow submit.
- No schema/hreflang implicit enablement.
- No production DB writes.
- No env or credential access.
- No raw PII/order/payment/private result/test attempt access.
