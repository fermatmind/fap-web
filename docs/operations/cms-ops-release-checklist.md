# CMS Ops Release Checklist Contract

Version: `cms_ops_release_checklist.v1`
Scope: `CMS-OPS-RELEASE-02`
Status: `contract_design`

## Purpose

This document defines the CMS release checklist, revalidate path plan, post-publish smoke, failure states, rollback policy, and release audit contract after `CMS-OPS-IA-00`.

This is a docs and contract PR only. It does not implement backend schema, Filament resources, API routes, release jobs, frontend runtime, revalidation execution, search-channel submission, sitemap mutation, content mutation, deployment, or production changes.

## Authority Boundary

| Area | Authority | Rule |
| --- | --- | --- |
| Publish permission | Backend/CMS workflow | Only backend/CMS release permissions can move a resource into `published`. |
| Checklist truth | Backend/CMS release plan | Checklist answers, reviewer identity, release approval, and rollback state must be backend-owned. |
| Revalidation | Backend release planner plus `fap-web` allowlisted consumer | Backend chooses public paths; `fap-web` accepts only allowlisted public paths and reports rejected paths. |
| Post-publish smoke | Backend/CMS release audit | Smoke results are recorded against the release plan. Frontend smoke helpers may observe but do not own publish truth. |
| Sitemap and llms eligibility | Backend/CMS discoverability fields and release contract | Revalidation does not rewrite sitemap/llms eligibility by itself. |
| SEO issue evidence | Sanitized `seo_intel` summary | SEO issue summaries may support release decisions but cannot auto-approve or publish content. |

## Release Phases

1. `draft_ready_check`
2. `review_signoff`
3. `release_plan_created`
4. `release_preflight_passed`
5. `publish_executed`
6. `revalidate_requested`
7. `revalidate_completed`
8. `post_publish_smoke_passed`
9. `observe_24h`
10. `closed`

Failure phases:

- `release_preflight_failed`
- `publish_failed`
- `revalidate_failed`
- `post_publish_smoke_failed`
- `rollback_required`
- `rollback_completed`
- `forward_fix_required`

## Pre-Publish Checklist

Every publishable CMS resource must satisfy these gates before `release_ready`:

| Gate | Required evidence | Applies to |
| --- | --- | --- |
| Identity | locale, slug, title, content family, owner, resource family. | all resources |
| Body readiness | visible body/blocks are non-empty and not placeholder content. | articles, landing surfaces, content pages, support content, career content |
| SEO metadata | meta title, meta description, canonical intent, robots/indexability, schema type when eligible. | all public resources |
| Review | reviewer identity, review timestamp, review decision, sensitive-topic/claim decision. | all resources; high-risk content requires explicit review |
| Media | media references resolve through CMS/media authority, alt text present where visible. | resources with media |
| Relations | related tests/topics/articles/career guides are backend-owned and public-safe. | resources with related modules |
| Localization | locale policy, translation group, hreflang expectation, source language, counterpart status. | localized resources |
| Discoverability | sitemap, llms, footer, homepage, and search-channel eligibility are explicit. | public/indexable resources |
| Private URL exclusion | no result, order, checkout, payment, report, share-token, auth, account, or preview-only URL is selected for public exposure. | all release plans |
| Preview | rendered preview or API preview evidence exists for the release candidate. | all resources |
| Release operator | publisher/ops_admin/owner approval is present and distinct from forbidden self-approval cases. | all publish actions |

## Resource Family Requirements

| Resource family | Required release checks | Extra no-go rules |
| --- | --- | --- |
| Articles | editorial review, SEO metadata, canonical, robots, related modules, CTA/FAQ eligibility, visible body smoke. | No unsupported clinical, ability, outcome, salary, employment-screening, or IQ authority claims. |
| Landing surfaces | block completeness, module order, CTA targets, SEO metadata, route preview, cache paths. | No frontend fallback copy or local asset substitution for CMS-owned surface content. |
| Content pages | policy/support/company page identity, canonical, robots, visible body, footer eligibility. | No footer exposure before public route and metadata pass. |
| Career guides/jobs | claim gates, canonical, robots, sitemap/llms eligibility, related test/career links. | No strong career outcome claim when backend gate is closed. |
| Support content | support owner, visible body, canonical/robots, support navigation eligibility. | No article/landing/career publish authority from support-only role. |
| Media metadata | media authority, alt text, dimensions, content type, owning resource link. | No mutable public image committed to `fap-web` for CMS-owned content. |

## Revalidate Path Plan

The backend release planner must produce:

- release id;
- resource family;
- locale;
- slug or resource id;
- canonical URL;
- accepted public paths;
- derived public paths such as localized home, article index/detail, topic/test/personality/career paths when relevant;
- cache signal paths such as `/llms.txt` and `/llms-full.txt` only when eligibility requires them;
- rejected paths with explicit reason;
- revalidation secret target configured outside the artifact.

The `fap-web` revalidate consumer must:

- require the content release token;
- accept only public allowlisted paths;
- reject private/API/payment/order/result/take/share/report/auth/account/checkout/webhook/traversal/external paths;
- return `revalidated_paths` and `rejected_paths`;
- clear only approved public cache signals;
- not publish content, mutate CMS records, submit search URLs, rewrite sitemap eligibility, or change robots policy.

## Post-Publish Smoke

Minimum smoke checks:

| Check | Expected result |
| --- | --- |
| HTTP status | Public URL returns 200 for published/indexable resources, or expected non-public status for draft/noindex resources. |
| Title/H1/body | No 404 shell, no placeholder title, visible body is present. |
| Canonical | Canonical self-points or points to approved localized canonical. |
| Robots | Robots/indexability matches backend CMS decision. |
| Hreflang | Published counterpart links are present only when counterpart is published and eligible. |
| Sitemap | Inclusion/exclusion matches backend discoverability eligibility. |
| llms | Inclusion/exclusion matches backend llms eligibility. |
| Structured data | Schema is grounded in visible content and allowed resource type. |
| Related modules | Related tests/topics/articles/careers are backend/CMS sourced only. |
| Private URL leak | No result/order/payment/checkout/report/share/auth/account URL appears in public content. |
| Tracking | Release-safe CTA/tracking IDs are present without PII/raw order/raw attempt/payment payloads. |
| Cache | Revalidated paths include expected public paths and rejected paths are investigated. |

## Failure And Rollback Policy

| Failure | Required state | Required action |
| --- | --- | --- |
| Missing checklist evidence | `release_preflight_failed` | Block publish; assign back to content editor or reviewer. |
| Missing review or forbidden self-approval | `release_preflight_failed` | Block publish; require valid reviewer approval. |
| Private/noindex URL in release plan | `release_preflight_failed` | Remove URL and rerun release plan. |
| Publish command failure | `publish_failed` | Keep previous public state; record backend exception summary. |
| Revalidate rejection | `revalidate_failed` | Keep publish state; investigate rejected paths; rerun allowed paths only. |
| Smoke status/canonical/robots/body failure | `post_publish_smoke_failed` | Mark `rollback_required` or `forward_fix_required` based on severity. |
| Search/SEO issue after publish | `observe_24h` or `forward_fix_required` | Create human task; no automatic content mutation. |
| High-risk claim leak | `rollback_required` | Unpublish or noindex through backend/CMS authority and audit. |

Rollback must be backend/CMS-owned. `fap-web` must not hide a failed publish by rendering fallback editorial content.

## Release Audit

Each release plan must record:

- release id;
- resource family;
- resource id and slug;
- locale;
- actor id and role;
- reviewer id and role;
- previous state and next state;
- checklist version;
- checklist result;
- release approval timestamp;
- revalidation request and response summary;
- post-publish smoke summary;
- rollback/forward-fix decision;
- sanitized SEO issue evidence ids when used.

Audit logs must not include secrets, raw order ids, raw attempt ids, raw payment payloads, private URLs, cookies, tokens, or raw PII.

## Required Operator Views

Release Ops should expose these read/write affordances in the backend/CMS implementation:

- checklist status by resource;
- blocked reason and owner;
- reviewer decision and timestamp;
- release plan diff;
- revalidate accepted/rejected paths;
- post-publish smoke results;
- rollback/forward-fix queue;
- sanitized linked SEO issue summaries.

These views are backend/CMS-owned. Any `fap-web` dashboard shell can mirror sanitized read models only.

## Deferred Runtime Work

This contract intentionally defers:

- backend release-plan table or migration;
- Filament release checklist UI;
- backend publish service changes;
- release job/queue workers;
- `fap-web` revalidate route changes;
- sitemap/llms generation changes;
- search-channel submission;
- production cache purge;
- content publish/unpublish execution;
- collector or `seo_intel` write-path changes;
- deployment.

## Repository Rule Impact

This PR reinforces existing rules:

- CMS-backed publication state remains backend/CMS authoritative.
- `fap-web` can consume revalidation requests but cannot become release authority.
- Sitemap/llms eligibility must be backend/CMS/release-contract driven.
- SEO issue summaries remain sanitized evidence and cannot auto-publish, auto-edit, or create pSEO.

## Recommended Follow-Up

Recommended next implementation work should happen in `fap-api`/CMS backend after explicit authorization: add backend release-plan schema, Filament checklist UI, release policy enforcement, audit persistence, and smoke job execution based on this contract.
