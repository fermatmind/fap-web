# FermatMind SEO Agent Control Packet Spec

Status: MVP0 contract

Scope: docs/contracts only. This spec does not implement runtime code, CMS writes, provider submissions, collectors, schedulers, or automation changes.

## Purpose

The FermatMind SEO Agent Control Packet is the required control-plane artifact for every SEO Agent run. It turns repo, runtime, CMS, `seo_intel`, search-channel, analytics, and GPT 5.5 Pro review evidence into one auditable packet before any PR, QA run, CMS draft package, opportunity queue, or search-readiness work can proceed.

The packet exists to prevent the agent from doing the wrong thing quickly. It must answer:

- What evidence was used?
- Which authority layer owns each fact?
- Which data is verified, unknown, fixture, mock, or access-required?
- Which actions are allowed, blocked, or human-gated?
- Which PR lane is next?
- Which D1/D7/D14/D28 observation window will prove or disprove impact?

## Lifecycle

1. Collect evidence without mutation.
2. Classify each source and evidence item.
3. Produce candidate actions and blocked actions.
4. Produce required approvals before any default-denied action.
5. Hand the packet to GPT 5.5 Pro for review when strategy, claim-risk, title/meta, content, or internal-link judgment is needed.
6. Select exactly one next lane.
7. Stop if any stop condition is triggered.
8. After approved execution, attach D1/D7/D14/D28 observation windows.

## Source-Of-Truth Hierarchy

Use this order when sources disagree:

1. `fap-api`, backend CMS, and `seo_intel` read models.
2. Public runtime/live HTML and public discovery files for rendered SEO truth.
3. Ops Portal `/ops/seo` and Metabase/export evidence provided by the operator.
4. Search Channel Queue read-only exports.
5. GSC, Baidu, GA4, and provider dashboards as observation systems.
6. Repository docs and runbooks.
7. fap-web fallback, local mock, fixture, generated artifacts, or browser screenshots.

Rules:

- `fap-api`/CMS/`seo_intel` authority is stronger than fap-web fallback or mock data.
- Public runtime/live HTML is the authority for rendered title, meta, canonical, robots, schema, hreflang, status, redirects, sitemap inclusion, and `llms` inclusion.
- GSC, Baidu, GA4, and Search Channel are observation/submission systems, not content truth.
- GPT 5.5 Pro is a review, strategy, and claim-boundary advisor only.
- Codex is an evidence collector, QA runner, PR proposer, and package generator only.
- The human operator is the authority for CMS publish, provider submission, schema/hreflang high-risk changes, production mutation, and final approval.

## Allowed Evidence Types

- Repo file paths, commits, configs, migrations, route definitions, and tests.
- Public runtime GET evidence.
- Public discovery files: `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`.
- Backend/CMS/`seo_intel` read-only API output.
- Ops Portal screenshots or read-only observations.
- GSC/Baidu/GA4 exports or screenshots.
- Search Channel read-only queue exports.
- GPT 5.5 Pro review response attached to the packet.

## Blocked Evidence Types

- Raw cookies, session stores, passwords, API keys, or env var values.
- Raw PII, raw orders, payment data, private result IDs, attempt IDs, tokens, or user identifiers.
- Node2 local Laravel or local DB evidence as production authority.
- Frontend static fallback or mock data as CMS authority.
- Competitor pages as FermatMind evidence.
- Unverified generated artifacts as production truth.

## Action Lanes

Each packet must choose one recommended lane and mark other lanes as held, blocked, or deferred.

- `DOCS_ONLY_PR`
- `RUNTIME_QA_READONLY`
- `OPS_READMODEL_BRIDGE`
- `GSC_DATA_QUALITY_READONLY`
- `OPPORTUNITY_QUEUE_READONLY`
- `CMS_DRAFT_PACKAGE_DRY_RUN`
- `SEARCH_READINESS_REPORT`
- `BLOCKED_MUTATION`

No lane may perform a default-denied action unless a later task gives exact authorization and the lane is designed for that action.

## Approval Rules

Human approval is required for:

- CMS save, import, update, or publish.
- Making content indexable.
- Sitemap, `llms`, or `llms-full` release.
- Schema or hreflang enablement.
- Search Channel enqueue, approval, retry, or submission.
- GSC Request Indexing.
- Baidu, IndexNow, 360, Sogou, or Shenma submission.
- ISR/revalidation.
- Production DB write.
- Env, credential, scheduler, collector, or provider-state changes.

Approval text must name the exact action, URL or entity ID, channel, environment, and target commit or release where relevant.

## Stop Conditions

The agent must stop when:

- Any changed file is outside the declared scope.
- Evidence is missing for a material conclusion.
- Mock, fixture, generated, or unknown data would affect production decisions.
- A default-denied action is required but not explicitly authorized.
- The worktree cannot be isolated.
- A command, UI, or browser action would mutate CMS, search-provider, production, env, sitemap, robots, `llms`, schema, or hreflang state.
- Credentials, PII, orders, payments, private result/test attempt data, or raw tokens would be read.
- GPT 5.5 Pro review reports unsupported assumptions or unresolved claim risk for the proposed lane.

## Packet Schema

Control packets must validate against:

- `docs/seo/agent/schemas/SEO_AGENT_CONTROL_PACKET.schema.json`

GPT 5.5 Pro responses must validate against:

- `docs/seo/agent/schemas/GPT55_REVIEW_RESPONSE.schema.json`

## Repository Rule Impact

This PR defines a docs-only agent contract. It does not change content ownership, runtime publishing behavior, sitemap/llms enumeration, backend CMS models, public content APIs, media handling, or SEO generation.
