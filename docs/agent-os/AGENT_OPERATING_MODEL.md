# FermatMind Agent Operating Model

Status: v1 docs/contracts proposal.

Scope: full assessment platform after Free Full Report Mode activation for `MBTI`, `BIG5_OCEAN`, `RIASEC`, `IQ_RAVEN`, `EQ_60`, and `ENNEAGRAM`.

This document defines the first Agent OS registry boundary for FermatMind. It is docs/contracts only. It does not implement runtime code, write CMS, publish content, submit search URLs, request indexing, call Google/Baidu/IndexNow/Bing providers, mutate Search Channel Queue, change sitemap/robots/llms/schema/hreflang/generated SEO artifacts, mutate production DB/env/payment/order data, or access private result data.

## Registry Files

- `docs/agent-os/agent-registry.v1.json`: machine-readable registry for all core and scale-specific agents.
- `docs/agent-os/go-hold-matrix.v1.json`: machine-readable GO/HOLD/BLOCKED matrix and first-week order.
- `docs/agent-os/AGENT_HANDOFF_PROTOCOL.md`: artifact-bus and approval protocol between agents.
- `docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md`: shared six-scale result-page agent contract.
- `docs/result-page-agents/six-scale-result-agent-readiness.template.json`: per-scale readiness template.

## Operating Model

Recommended active units:

- 12 core operating agents.
- 6 mandatory scale-specific result-page agents.
- Optional sub-agents stay HOLD until their parent agent has exact authorization.

Agent coordination uses a Git plus artifact bus model. Agents exchange reviewed files, schemas, runbooks, control packets, QA artifacts, and dry-run packages. Agents do not directly mutate each other's source-of-truth systems.

## Source-Of-Truth Order

When sources disagree, use this order:

1. Backend authority in `fap-api`, backend CMS, scale registries, report builders, content packs, and `seo_intel` read models.
2. Public runtime/live HTML for rendered title, meta, canonical, robots, status, schema, hreflang, sitemap/llms inclusion, route behavior, and redirect truth.
3. fap-web application code, renderer contracts, route definitions, and local contract tests.
4. Ops Portal, Search Channel, GSC, Baidu, GA4, and provider dashboards as observation/submission systems, not content truth.
5. Repository docs, generated review artifacts, screenshots, and local fixtures as supporting evidence only.

Mock, fixture, generated, unknown, or access-required data cannot drive production action.

## Core Agents

| Agent | Agent ID | Current readiness | Default state |
|---|---|---|---|
| Agent OS / Release Coordination Agent | `agent_os_release_coordination` | `ready_docs_contract` | GO for docs and PR coordination |
| SEO / GEO Control Agent | `seo_geo_control` | `ready_readonly_control` | GO read-only, HOLD mutation |
| Runtime QA Agent | `runtime_qa` | `partial_ready_readonly` | GO read-only QA |
| CMS Draft Package Agent | `cms_draft_package` | `ready_dry_run_contract` | GO dry-run only |
| CMS Publish / Readback Agent | `cms_publish_readback` | `hold_exact_approval_required` | HOLD |
| Analytics / GSC / Opportunity Agent | `analytics_gsc_opportunity` | `partial_hold_scoring` | GO read-only, HOLD opportunity scoring until quality gate passes |
| Assessment Hub Agent | `assessment_hub` | `partial_six_hub_runtime` | GO read-only QA |
| Result Page Agent Platform | `result_page_agent_platform` | `proposal_ready` | GO docs/contracts |
| Career Content / Graph Agent | `career_content_graph` | `partial_asset_factory` | GO asset planning, HOLD deterministic recommendation |
| Public Personality Content Agent | `public_personality_content` | `partial_profile_agent` | GO package planning, HOLD publish |
| Competitor / Alternative Research Agent | `competitor_alternative_research` | `research_only` | GO public research, HOLD page generation |
| Claim / Privacy / Safety Gate Agent | `claim_privacy_safety_gate` | `ready_gate_contract` | GO gate enforcement |

## Mandatory Result-Page Agents

| Scale | Agent ID | Current readiness | First-week target |
|---|---|---|---|
| MBTI | `mbti_result_page` | `missing_agent_stack` | scaffold runbook, gates, schema, route/API/PDF/share contract |
| Big Five | `big_five_result_page` | `existing_agent_stack_align_required` | align existing asset agent to shared standard |
| RIASEC | `riasec_result_page` | `existing_agent_stack_align_required` | align existing asset/ops/manual gate model to shared standard |
| IQ Raven | `iq_raven_result_page` | `missing_agent_stack` | scaffold runbook, gates, schema, report/norm safety contract |
| EQ60 | `eq60_result_page` | `missing_agent_stack` | scaffold runbook, gates, schema, report/norm safety contract |
| Enneagram | `enneagram_result_page` | `existing_agent_stack_align_required` | align existing readiness/ops/batch model to shared standard |

The first-week priority is not optional: all six result pages need a result-page agent contract because Free Full Report Mode makes all six result pages first-class product surfaces.

## Approval States

All agents use these approval states:

- `not_requested`
- `review_requested`
- `approved_for_dry_run_only`
- `approved_for_single_canary_write`
- `approved_for_publish_or_submit`
- `rejected`

Default is `not_requested`.

## Hard HOLD Actions

The following remain HOLD unless a later task gives exact, action-specific approval and the owning agent supports that action:

- automatic CMS publish
- automatic search submission
- GSC Request Indexing
- Google Indexing API
- Baidu push
- IndexNow submit
- Search Channel enqueue, approve, or submit
- production env changes
- payment/order mutation
- private result indexing
- raw private result access
- deterministic career recommendation
- IQ/EQ diagnostic guarantee
- schema/hreflang/sitemap/llms mutation without exact approval

## First-Week Execution Order

1. `result_page_agent_platform`: freeze shared six-scale result-page agent standard.
2. `mbti_result_page`: scaffold missing MBTI result-page agent.
3. `iq_raven_result_page`: scaffold missing IQ Raven result-page agent.
4. `eq60_result_page`: scaffold missing EQ60 result-page agent.
5. `big_five_result_page`: align existing Big Five asset agent to shared standard.
6. `enneagram_result_page`: align existing Enneagram agent to shared standard.
7. `riasec_result_page`: align existing RIASEC asset/ops agent to shared standard.
8. `assessment_hub`: read-only QA for six hubs and Free Full Report Mode paths.
9. `runtime_qa`: result render, print/PDF/share, and private leakage QA.
10. `analytics_gsc_opportunity`: analytics exclusion and GSC/opportunity GO/HOLD reconciliation.

## Proposed PR-Train Entries

No `docs/codex/pr-train.yaml` or `docs/codex/pr-train-state.json` mutation is part of this task. If the operator wants the Agent OS work and first-week result-page work tracked in the PR train, authorize the following entries explicitly.

### Proposed Current Entry

- Proposed PR train id: `AGENT-OS-REGISTRY-GO-HOLD-MATRIX-01`
- Proposed PR title: `AGENT-OS-REGISTRY-GO-HOLD-MATRIX-01: docs(agent-os): add registry and go-hold matrix`
- Proposed scope: docs/contracts only.
- Likely touched files:
  - `docs/agent-os/AGENT_OPERATING_MODEL.md`
  - `docs/agent-os/agent-registry.v1.json`
  - `docs/agent-os/go-hold-matrix.v1.json`
  - `docs/agent-os/AGENT_HANDOFF_PROTOCOL.md`
  - `docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md`
  - `docs/result-page-agents/six-scale-result-agent-readiness.template.json`
- Required local checks:
  - `python3 -m json.tool docs/agent-os/agent-registry.v1.json >/tmp/agent-registry.v1.pretty.json`
  - `python3 -m json.tool docs/agent-os/go-hold-matrix.v1.json >/tmp/go-hold-matrix.v1.pretty.json`
  - `python3 -m json.tool docs/result-page-agents/six-scale-result-agent-readiness.template.json >/tmp/six-scale-result-agent-readiness.pretty.json`
  - `node` coverage check for 12 core agents, 6 scale agents, hard HOLD actions, and first-week order
  - `rg -n "[ \t]+$" docs/agent-os docs/result-page-agents`
  - changed-file allowlist check for `docs/agent-os/**` and `docs/result-page-agents/**`
- Dependency assumptions: latest `origin/main`; no runtime/CMS/search/provider dependency.

Manifest entry to authorize, adapted to the repository's current PR-train schema:

```yaml
- id: AGENT-OS-REGISTRY-GO-HOLD-MATRIX-01
  title: "docs(agent-os): add registry and go-hold matrix"
  scope:
    paths:
      - docs/agent-os/**
      - docs/result-page-agents/**
    notes:
      - docs/contracts only
      - no runtime code
      - no CMS/search/provider/DB/env/payment/order/private result mutation
  local_checks:
    - python3 -m json.tool docs/agent-os/agent-registry.v1.json >/tmp/agent-registry.v1.pretty.json
    - python3 -m json.tool docs/agent-os/go-hold-matrix.v1.json >/tmp/go-hold-matrix.v1.pretty.json
    - python3 -m json.tool docs/result-page-agents/six-scale-result-agent-readiness.template.json >/tmp/six-scale-result-agent-readiness.pretty.json
    - node docs/agent-os registry coverage check
    - rg -n "[ \t]+$" docs/agent-os docs/result-page-agents
  depends_on: []
  merge_policy:
    github_checks_required: false
```

State entry to authorize, adapted to the repository's current state-ledger schema:

```json
{
  "id": "AGENT-OS-REGISTRY-GO-HOLD-MATRIX-01",
  "status": "proposed_not_started",
  "commit_sha": null,
  "pr_url": null,
  "checks": [],
  "failure_reason": null,
  "merged_at": null,
  "remote_branch_deleted": false,
  "local_cleanup_executed": false
}
```

Follow-up execution prompt:

```text
Authorize adding AGENT-OS-REGISTRY-GO-HOLD-MATRIX-01 to docs/codex/pr-train.yaml and docs/codex/pr-train-state.json, then open one scoped docs/contracts PR from latest origin/main with only docs/agent-os/** and docs/result-page-agents/** changes.
```

### Proposed First-Week Follow-Ups

These are proposed task ids only; each needs its own manifest/state authorization before implementation:

| Proposed PR train id | Proposed title | Scope/files likely touched | Checks | Dependency |
|---|---|---|---|---|
| `RESULT-PAGE-AGENT-PLATFORM-STANDARD-01` | `docs(result-page-agents): freeze six-scale platform standard` | `docs/result-page-agents/**`, optional `docs/agent-os/**` | JSON parse, coverage, changed-file allowlist | `AGENT-OS-REGISTRY-GO-HOLD-MATRIX-01` |
| `MBTI-RESULT-PAGE-AGENT-SCAFFOLD-SCAN-01` | `docs(mbti): propose result-page agent scaffold` | `docs/result-page-agents/mbti/**` or fap-api docs if authorized | schema/readiness parse, no runtime diff | platform standard |
| `IQ-RAVEN-RESULT-PAGE-AGENT-SCAFFOLD-SCAN-01` | `docs(iq): propose result-page agent scaffold` | `docs/result-page-agents/iq-raven/**` or fap-api docs if authorized | schema/readiness parse, no runtime diff | platform standard |
| `EQ60-RESULT-PAGE-AGENT-SCAFFOLD-SCAN-01` | `docs(eq): propose result-page agent scaffold` | `docs/result-page-agents/eq60/**` or fap-api docs if authorized | schema/readiness parse, no runtime diff | platform standard |
| `BIG5-RESULT-PAGE-AGENT-STANDARD-ALIGN-01` | `docs(big5): align existing result-page agent standard` | fap-api Big Five result-agent docs, optional fap-web registry refs | existing agent docs/schema checks | platform standard |
| `ENNEAGRAM-RESULT-PAGE-AGENT-STANDARD-ALIGN-01` | `docs(enneagram): align existing result-page agent standard` | fap-api Enneagram result-agent docs, optional fap-web registry refs | existing agent docs/schema checks | platform standard |
| `RIASEC-RESULT-PAGE-AGENT-STANDARD-ALIGN-01` | `docs(riasec): align existing result-page agent standard` | fap-api RIASEC result-agent docs, optional fap-web registry refs | existing agent docs/schema checks | platform standard |

## Repository Rule Impact

This task adds docs/contracts only. It creates an Agent OS registry and result-page agent standard, but does not change content ownership, runtime behavior, backend CMS models, public APIs, generated SEO artifacts, sitemap/llms enumeration, media handling, or publishing workflow.
