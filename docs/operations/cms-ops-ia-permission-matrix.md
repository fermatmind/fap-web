# CMS Ops IA and Permission Matrix

Version: `cms_ops_ia_permission_matrix.v1`
Scope: `CMS-OPS-IA-00`
Status: `contract_design`

## Purpose

This document locks the CMS operations information architecture and permission matrix before backend CMS resource, schema, release checklist, or runtime changes.

This is a docs and contract PR only. It does not create backend schema, edit Filament resources, add API routes, publish CMS content, change `fap-web` runtime behavior, deploy services, or make `fap-web` the CMS authority.

## Authority Boundary

| Surface | Authority | Rule |
| --- | --- | --- |
| CMS content records | `fap-api` CMS backend | Article, landing surface, content page, career, topic, media, and publication fields stay backend/CMS authoritative. |
| Public rendering | `fap-web` | `fap-web` consumes public APIs and renders product UI. It must not invent CMS fields, editorial copy, publish states, or fallback content. |
| SEO intelligence | `seo_intel` read models | SEO intelligence may observe, attribute, and summarize issues. It must not publish content, mutate CMS records, or become content truth. |
| Release operations | Backend/CMS workflow | Review, approval, publish, rollback, and smoke ownership must be enforced by backend/CMS permissions and audit. |
| Search channels | Search adapters | Google, Baidu, Bing/IndexNow, llms, and future search adapters are observation/submission channels, not content authority. |

## Navigation IA

| Group | Purpose | Primary resources | Read roles | Write roles |
| --- | --- | --- | --- | --- |
| Content Ops | Day-to-day content inventory and edits. | Articles, content pages, landing surfaces, support articles, topic entries. | `owner`, `ops_admin`, `content_editor`, `content_reviewer`, `seo_operator`, `analyst` | `owner`, `ops_admin`, `content_editor` |
| SEO and Growth | Read-only URL truth, issue queues, content decay, search channel status, attribution summaries. | URL truth, SEO issue queue, search channel status, content decay queue, attribution summaries. | `owner`, `ops_admin`, `seo_operator`, `analyst`, `content_reviewer` | No direct CMS writes from SEO views. |
| Release Ops | Publish readiness, approval, revalidation, smoke, rollback queue. | Publish checklist, release plans, revalidate path plan, post-publish smoke, rollback log. | `owner`, `ops_admin`, `content_editor`, `content_reviewer`, `publisher`, `sre` | `owner`, `ops_admin`, `publisher`, `sre` for operational release actions after gates pass. |
| Governance | Roles, permissions, audit, high-risk review policy. | Role matrix, permission audit, review policy, claim boundary policy, exception ledger. | `owner`, `ops_admin`, `security_auditor` | `owner`, `ops_admin` only. |
| Support Ops | Safe support/content operations without publication authority. | Support content, customer-facing support page status, issue triage. | `owner`, `ops_admin`, `support`, `content_reviewer` | `owner`, `ops_admin`, `support` for support-owned drafts only. |

## Role Matrix

| Role | Intent | Required capabilities | Must not be allowed |
| --- | --- | --- | --- |
| `owner` | Full accountable administrator. | Full read/write/release/governance/audit. | None outside explicit production-change approvals. |
| `ops_admin` | Operational admin for CMS workflows. | Content read/write, release queue operation, role-audit visibility, issue summary visibility. | Bypass review gates silently, publish from SEO issue rows, change production infra. |
| `content_editor` | Draft and revise content records. | Content read/write, draft metadata edits, relation edits, preview request. | Publish, rollback, approve own high-risk review, submit search URLs directly. |
| `content_reviewer` | Editorial and risk review. | Content read, review state changes, checklist signoff, issue summary read. | Edit production content body as reviewer-only action, deploy, mutate `seo_intel`. |
| `publisher` | Controlled release operator. | Publish approved records, trigger backend release plan, trigger allowed revalidation, record post-publish smoke. | Edit draft content, override missing review, create pSEO, submit private/noindex URLs. |
| `seo_operator` | SEO operations analyst. | URL truth read, issue queue read/triage, recommendation drafting, attribution summary read. | CMS mutation, publish, rollback, write `seo_intel` detail rows manually, use search telemetry as content truth. |
| `analyst` | Read-only reporting. | Aggregate dashboard read, sanitized exports, URL/content status read. | Raw PII/order/attempt/payment fields, CMS mutation, unrestricted SQL. |
| `sre` | Release reliability operator. | Revalidate/smoke/rollback operational visibility and infrastructure health. | Editorial approval, content body edits, search/content decisions. |
| `security_auditor` | Governance and audit review. | Permission audit, publish audit, high-risk exception read. | CMS content mutation, publish, role grants without owner/admin approval. |
| `support` | Support content and customer-facing help ops. | Support draft read/write, support status read, support issue triage. | Article/landing/career publish, SEO issue mutation, governance edits. |

## Resource Action Matrix

| Resource family | Draft/edit | Review | Approve | Publish | Rollback/unpublish | SEO issue link |
| --- | --- | --- | --- | --- | --- | --- |
| Articles | `content_editor`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner` | Read-only issue summary and explicit task link. |
| Landing surfaces | `content_editor`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner` | Read-only issue summary; no automatic module reorder. |
| Content pages | `content_editor`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner` | Read-only issue summary. |
| Career guides/jobs | `content_editor`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner` | Read-only issue summary; claim gates remain backend-owned. |
| Media metadata | `content_editor`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | `content_reviewer`, `ops_admin`, `owner` | Through owning content release | Through owning content rollback | SEO may flag missing alt/metadata only. |
| SEO issue queue | No CMS field edit | `seo_operator`, `content_reviewer`, `ops_admin`, `owner` triage | N/A | N/A | N/A | Source is sanitized `seo_intel` summary only. |
| Release plan | N/A | `content_reviewer`, `publisher`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner` after checklist | `publisher`, `ops_admin`, `owner` | `publisher`, `ops_admin`, `owner`, `sre` | May include issue summary evidence; cannot auto-close content risk. |

## Workflow State Model

Allowed lifecycle:

1. `draft`
2. `review_pending`
3. `review_approved`
4. `release_ready`
5. `published`
6. `post_publish_smoke_pending`
7. `post_publish_smoke_passed`
8. `rollback_required` or `needs_revision`
9. `unpublished` or `archived`

Required gates:

- `draft -> review_pending`: content family, locale, slug, canonical intent, owner, and preview target are present.
- `review_pending -> review_approved`: reviewer identity, review timestamp, sensitive-topic/claim decision, and evidence level are recorded.
- `review_approved -> release_ready`: publish checklist is complete, discoverability flags are explicit, and no private/noindex route is selected for public submission.
- `release_ready -> published`: backend/CMS release permission passes and release audit is written.
- `published -> post_publish_smoke_passed`: runtime smoke, canonical, robots, sitemap/llms eligibility, revalidation result, and visible body checks are recorded.
- Any failure after publish enters `rollback_required` or `needs_revision`; it must not be hidden by frontend fallback content.

## Field Ownership

| Field group | Owner | Rule |
| --- | --- | --- |
| Slug, locale, title, excerpt, body, canonical, robots, publish state | Backend CMS | `fap-web` may render only what public API exposes. |
| Content family, evidence level, review required, reviewer, review timestamp | Backend CMS | Needed before high-risk or research-style expansion. |
| Related tests/topics/articles/career guides | Backend CMS/public API | No hardcoded frontend relation expansion. |
| Sitemap, llms, footer, homepage eligibility | Backend CMS/release contract | Frontend generation must consume backend/public API truth. |
| SEO issue type, severity, affected URL, status, recommendation summary | `seo_intel` sanitized read model | CMS may display summary/task link only. |
| PII, raw order, raw attempt, payment payload, private URLs | Not allowed in CMS ops dashboard summaries | Must remain excluded from SEO issue summaries and normal dashboards. |

## SEO Issue Summary Boundary

SEO issue summaries may:

- show sanitized URL, locale, entity type, issue type, severity, lifecycle status, detection time, and recommendation summary;
- link to the backend-owned CMS resource when the operator has CMS read permission;
- create a human task or review note through a backend-owned workflow after explicit user action;
- appear in release readiness as evidence.

SEO issue summaries must not:

- mutate CMS fields directly;
- auto-create drafts, publish content, reorder modules, or create pSEO pages;
- treat search/crawler/analytics observations as canonical content truth;
- expose raw logs, PII, raw order IDs, raw attempt IDs, payment payloads, private result URLs, checkout URLs, report URLs, auth tokens, or cookies;
- bypass editorial, claim, publish, rollback, or smoke gates.

## Audit Events

Minimum backend-owned audit events for later implementation:

- `cms_resource_draft_created`
- `cms_resource_metadata_updated`
- `cms_resource_submitted_for_review`
- `cms_resource_review_approved`
- `cms_resource_review_rejected`
- `cms_release_checklist_completed`
- `cms_resource_published`
- `cms_resource_unpublished`
- `cms_resource_rollback_requested`
- `cms_resource_rollback_completed`
- `cms_release_revalidate_requested`
- `cms_release_revalidate_completed`
- `cms_post_publish_smoke_completed`
- `seo_issue_summary_linked_to_cms_task`
- `permission_matrix_changed`

Audit logs must include actor, role, resource family, resource identifier, previous state, next state, timestamp, and reason. They must not include secrets, private URLs, raw payment payloads, raw order IDs, or raw attempt IDs.

## Deferred Runtime Work

This contract intentionally defers:

- backend migrations, model fields, Filament resources, policies, middleware, and API changes;
- `seo_intel` physical schema changes and collectors;
- CMS release checklist runtime enforcement;
- production deployment, revalidation execution, search-channel submission, and cache purge;
- frontend ops pages, dashboards, mock data, and dashboard shell changes;
- content creation, content import, article publication, page publication, and media upload.

## Repository Rule Impact

This PR changes architecture documentation and contract tests only. It reinforces existing repository rules:

- `fap-web` is not CMS authority.
- CMS-backed content, SEO fields, publication state, sitemap/llms eligibility, and mutable media stay backend/CMS authoritative.
- SEO intelligence is read-only observation for CMS, not an auto-publish or pSEO system.
- Runtime implementation belongs in later backend/CMS PRs.

## Next Task

Next task: `CMS-OPS-RELEASE-02`

`CMS-OPS-RELEASE-02` should define the publish checklist, revalidate path plan, post-publish smoke, rollback states, and release audit contract using this IA and permission matrix as its role and state baseline.
