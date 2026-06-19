# SEO Agent Action Lanes And Guardrails

Status: MVP0 contract

This document defines what each FermatMind SEO Agent lane may do and what it must refuse to do.

## Global Guardrails

All lanes inherit these rules:

- Evidence first, mutation never by default.
- Backend CMS, `fap-api`, and `seo_intel` read models outrank fap-web mock or fallback data.
- Public runtime HTML is the authority for rendered SEO state.
- GSC, Baidu, GA4, and Search Channel are observation/submission systems, not content truth.
- GPT 5.5 Pro reviews evidence, strategy, and claim boundaries only.
- Codex collects evidence, runs QA, proposes PRs, and generates packages only.
- Human approval is required for CMS mutation, provider submission, schema/hreflang high-risk changes, and production mutation.

## Action Lanes

| Lane | Allowed | Forbidden |
|---|---|---|
| `DOCS_ONLY_PR` | Create docs, schemas, examples, runbooks, and non-runtime contracts. | Runtime code, automation TOML, generated SEO artifacts, CMS/search/provider state. |
| `RUNTIME_QA_READONLY` | Public GET checks, rendered HTML inspection, sitemap/robots/llms/schema/hreflang checks. | Revalidation, sitemap refresh, CMS edit, provider submit. |
| `OPS_READMODEL_BRIDGE` | Connect fap-web Ops dashboard to read-only `seo_intel` endpoints. | Backend behavior changes beyond authorized read adapter work, CMS writes, provider writes. |
| `GSC_DATA_QUALITY_READONLY` | Validate GSC table freshness, live-vs-fixture state, row quality, joins, and masking. | Calling live provider APIs unless explicitly authorized, writing production rows. |
| `OPPORTUNITY_QUEUE_READONLY` | Propose opportunities after source quality passes. | Treating unknown/mock/fixture data as production truth, CMS write, provider submit. |
| `CMS_DRAFT_PACKAGE_DRY_RUN` | Build dry-run draft packages, claim-risk notes, preview checklists, operator approval text. | CMS save/import/publish unless explicit approved lane exists. |
| `SEARCH_READINESS_REPORT` | Audit readiness, draft approval text, classify channel eligibility. | GSC Request Indexing, Baidu push, IndexNow submit, enqueue/approve/submit. |
| `BLOCKED_MUTATION` | Record why an action is blocked. | Any execution. |

## Hard-Blocked Actions

The following are blocked unless a later task gives exact, narrow authorization and the relevant lane supports it:

- CMS save.
- CMS publish.
- CMS import unless an explicit approved dry-run/import lane exists.
- Provider submit.
- GSC Request Indexing.
- Baidu push.
- IndexNow submit.
- Schema or hreflang implicit enablement.
- Production DB write.
- Env or credential access.
- Raw PII, order, payment, private result, or test attempt access.
- Treating `MOCK`, `FIXTURE`, `UNKNOWN`, or unverified generated artifacts as production truth.

## Command Denylist Pattern

Agent runs must treat commands, labels, UI actions, and scripts containing these terms as default-denied until proven safe and explicitly authorized:

- `publish`
- `approve`
- `submit`
- `push-baidu`
- `request-indexing`
- `reindex`
- `retry-reset`
- `import`
- `update-existing`
- `controlled-publish`
- `migrate`
- `deploy`
- `revalidate`
- `sync`
- `bulk update`

This denylist applies to shell commands, npm/pnpm scripts, artisan commands, browser UI buttons, Ops actions, provider dashboard actions, and API endpoints.

## Human Approval Requirements

Approval must be explicit and action-specific. A broad "continue" or "go ahead" does not approve a mutation.

Approval text must identify:

- action family,
- exact URL or entity ID,
- channel when relevant,
- environment,
- target branch or SHA when deploy-related,
- rollback or observation expectation when relevant.

Examples:

```text
AUTHORIZE_CMS_IMPORT_DRY_RUN=article:<slug> environment:production command:<exact command>
AUTHORIZE_SEARCH_PROVIDER_SUBMISSION=channel:indexnow urls:<exact batch id> environment:production
AUTHORIZE_SCHEMA_ENABLEMENT=url:<exact canonical> schema:<type> environment:production
```

## Stop Conditions

Stop immediately when:

- File changes drift outside the approved scope.
- A default-denied command is required but not approved.
- Evidence is mock, fixture, unknown, stale, or access-required and would drive production action.
- The run would read credentials, env secrets, raw PII, orders, payments, private result IDs, attempt IDs, or tokens.
- A browser action would click CMS save/publish/import or provider submit.
- A schema/hreflang/search-channel recommendation lacks claim and route evidence.
- GPT 5.5 Pro identifies unsupported assumptions or unresolved claim risk.

## Current MVP Holds

- Opportunity Queue: HOLD until GSC data quality passes.
- CMS Draft Agent: HOLD until dry-run package contract, preview QA, and human approval gate exist.
- Search Channel Readiness Agent: report-only until exact approval exists.
- Browser-driven CMS writer: not an MVP0 lane.
