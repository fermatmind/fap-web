# Agent Handoff Protocol

Status: v1 docs/contracts proposal.

This protocol defines how FermatMind agents exchange evidence and next-step decisions without direct autonomous mutation. It applies to the 12 core operating agents and the 6 scale-specific result-page agents in `docs/agent-os/agent-registry.v1.json`.

## Principles

- Evidence first, mutation never by default.
- Every handoff is an artifact, not a hidden conversation.
- Artifacts must be path-addressable, schema-versioned, and checksum-ready.
- Private result, order, payment, raw attempt, credential, token, cookie, session, and PII values must not enter committed artifacts.
- A handoff recommendation cannot grant approval for CMS writes, publish, search submission, provider calls, production changes, or private data access.

## Approval Boundary

Agents may recommend one of these approval states:

- `not_requested`
- `review_requested`
- `approved_for_dry_run_only`
- `approved_for_single_canary_write`
- `approved_for_publish_or_submit`
- `rejected`

Only a human operator can move a default-denied action into an executable lane. Approval text must include the exact action family, URL or entity id, channel, environment, and target SHA or release when deploy-related.

## Artifact Envelope

Each handoff artifact should include:

- `schema_version`
- `artifact_id`
- `created_at`
- `producing_agent_id`
- `receiving_agent_id`
- `run_mode`
- `source_refs`
- `evidence_labels`
- `approval_state`
- `allowed_next_actions`
- `forbidden_actions`
- `negative_guarantees`
- `checks`
- `stop_conditions`
- `next_goal`

When the artifact references generated files, include path, byte size, SHA256, schema version, and a sanitized summary.

## Standard Artifact Types

| Artifact type | Producer | Consumer | Purpose |
|---|---|---|---|
| `agent_registry` | Agent OS / Release Coordination Agent | all agents | Declares agent ownership, state, checks, and boundaries |
| `go_hold_matrix` | Agent OS / Release Coordination Agent | all agents | Records GO/HOLD/BLOCKED states and hard HOLD actions |
| `seo_control_packet` | SEO / GEO Control Agent | CMS Draft Package Agent, Runtime QA Agent | Source classification, claim risk, allowed lane, blocked actions |
| `runtime_qa_report` | Runtime QA Agent | SEO / GEO Control Agent, Result Page Agent Platform | Public/runtime/rendered evidence and regressions |
| `cms_draft_package` | CMS Draft Package Agent | CMS Publish / Readback Agent | Dry-run draft material, claim gate, preview checklist |
| `publish_readback_report` | CMS Publish / Readback Agent | Runtime QA Agent, Analytics / GSC / Opportunity Agent | Controlled write/readback proof after exact approval |
| `analytics_quality_report` | Analytics / GSC / Opportunity Agent | SEO / GEO Control Agent | Source freshness, fixture/live classification, eligibility |
| `assessment_hub_qa_report` | Assessment Hub Agent | Runtime QA Agent, Result Page Agent Platform | Six-hub route, take-flow, CTA, and result redirect evidence |
| `result_page_agent_readiness` | scale-specific result-page agents | Result Page Agent Platform, Runtime QA Agent | Scale route/API/PDF/share/render/leak readiness |
| `career_graph_bridge_packet` | Career Content / Graph Agent | Claim / Privacy / Safety Gate Agent | RIASEC-to-career public-projection bridge proposal |
| `public_profile_package` | Public Personality Content Agent | SEO / GEO Control Agent, Claim / Privacy / Safety Gate Agent | Public profile content package and private-boundary proof |
| `competitor_pattern_ledger` | Competitor / Alternative Research Agent | SEO / GEO Control Agent | Public-only pattern evidence without copied content |
| `claim_privacy_safety_report` | Claim / Privacy / Safety Gate Agent | all agents | Claim verdicts, private-data checks, and stop conditions |

## Core Hand-Offs

### SEO / GEO Control -> CMS Draft Package

Required artifact: `seo_control_packet`

Must include:

- target URL or route family
- source classification
- evidence labels
- claim risks
- allowed lane
- explicit negative guarantees
- approval state

HOLD if the packet asks for CMS write, publish, provider submit, schema/hreflang/sitemap/llms mutation, or Search Channel mutation without exact approval.

### CMS Draft Package -> CMS Publish / Readback

Required artifact: `cms_draft_package`

Must include:

- `package_id`
- target URL/entity
- locale
- proposed fields or blocks
- claim gate results
- media policy
- preview checklist
- approvals required

Dry-run package review does not authorize CMS save, draft creation, import, publish, unpublish, media upload, or search submission.

### Runtime QA -> Analytics / GSC / Opportunity

Required artifact: `runtime_qa_report`

Must include:

- public GET evidence or fixture-render evidence
- rendered status
- canonical/robots/noindex state when relevant
- private leakage checks
- observation windows
- analytics exclusion notes

Runtime QA evidence does not authorize opportunity scoring unless Analytics / GSC / Opportunity confirms live data quality.

### Result Page Agents -> Result Page Agent Platform

Required artifact: `result_page_agent_readiness`

Must include:

- scale code
- result route
- report API and report-access API
- PDF/share behavior
- frontend renderer
- backend authority service or missing service
- public/private boundary
- leak checks
- render checks
- analytics contract
- current readiness

If the scale has no dedicated result-page agent stack, readiness must be `missing_agent_stack` and the next goal must be scaffold-only.

### Career Content / Graph -> Claim / Privacy / Safety Gate

Required artifact: `career_graph_bridge_packet`

Must include approved public projection references only. Raw scores, private attempts, deterministic recommendations, employment guarantees, diagnosis language, and unsupported fit claims are forbidden.

### Competitor / Alternative Research -> SEO / GEO Control

Required artifact: `competitor_pattern_ledger`

Must include public-only source classification and pattern notes. It must not include copied competitor copy, fake rankings, fake reviews, unverified traffic claims, or defamatory comparisons.

## Stop Conditions

Stop the handoff when:

- source truth is unknown, fixture, mock, stale, access-required, or contradicts backend authority
- an artifact contains raw private result, raw attempt, order, payment, credential, token, cookie, session, or PII data
- a receiving agent would need a default-denied action without exact approval
- the artifact blurs public profile content with private result content
- a result-page agent cannot prove route/API/PDF/share/render/leak coverage
- an opportunity, claim, or recommendation depends on unsupported analytics or private data
- changed files drift outside the declared docs/contracts scope
