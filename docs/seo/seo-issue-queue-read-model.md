# SEO Issue Queue Read Model Contract

Version: `seo_issue_queue.v1`
Scope: `SEO-ISSUE-QUEUE-00`
Status: `contract_design`

## Purpose

This document defines the sanitized SEO issue queue read model for SEO operations and CMS release evidence.

It is a docs and contract PR only. It does not create `seo_intel` migrations, collectors, API routes, CMS resources, dashboard runtime, frontend UI, GSC/Baidu/GA4 integrations, search submission, sitemap or llms changes, CMS drafts, content generation, publishing, deployment, env reads, cookie reads, token reads, or production behavior changes.

The queue converts observed SEO signals into reviewable issues. It is not content truth, CMS authority, search submission authority, a pSEO generator, or a publish gate by itself.

## Source Inputs

The first read model may consume sanitized summaries from these sources after their own authority gates exist:

| source signal | role | authority rule |
| --- | --- | --- |
| `url_truth` | Canonical public URL identity, locale, entity type, and exposure expectation. | Must follow production sitemap plus backend/CMS public API authority. |
| `sitemap` | Inclusion/exclusion observation for live sitemap and backend sitemap source. | Observation only; cannot rewrite sitemap eligibility. |
| `llms` | Inclusion/exclusion observation for `llms.txt` and `llms-full.txt`. | Observation only; cannot rewrite llms eligibility. |
| `gsc` | Google search visibility and indexing signal. | Channel adapter; not content truth. |
| `baidu` | Baidu verification, push, landing, or indexing signal. | Channel adapter; not content truth. |
| `ga4` | Browser behavior telemetry and funnel anomaly signal. | Telemetry only; not purchase or content truth. |
| `cms_release` | Release checklist, revalidation, post-publish smoke, and rollback evidence. | Backend/CMS release plan remains authority. |
| `cms_draft` | Draft absence/leak and preview-state checks. | Draft state remains CMS authority. |
| `competitor_url_inventory` | Gap or opportunity candidate from read-only competitor inventory. | Advisory input only; no draft or content generation. |
| `manual_review` | Human-created sanitized observation. | Must name source and reviewer role. |

## Issue Key

Stable issue key:

- `canonical_url + locale + issue_type + source_signal`

Entity key:

- `page_entity_type + entity_id_or_slug + locale`

Rules:

- `canonical_url` must be normalized before issue creation.
- Private, tokenized, result, order, payment, checkout, report, account, auth, share, preview-only, and recovery URLs must not become normal SEO issue URLs.
- If an observation involves a private URL leak, store only a sanitized public-safe path pattern and evidence summary, not the raw private URL.
- Search channel observations may disagree with URL truth; URL truth and backend/CMS discoverability authority win.

## Fields

Required first-version fields:

| field | type | rule |
| --- | --- | --- |
| `issue_id` | string | Stable opaque id or deterministic hash. |
| `canonical_url` | string | Sanitized public URL or approved public-safe pattern. |
| `locale` | enum | `en`, `zh`, `mixed`, or `unknown`. |
| `page_entity_type` | enum | Must use the Search Intelligence page entity taxonomy. |
| `entity_id_or_slug` | string | Backend public id or slug when safe; no raw attempt/order/payment id. |
| `source_signal` | enum | One of the allowed source inputs. |
| `issue_type` | enum | One of the allowed issue types. |
| `severity` | enum | `critical`, `high`, `medium`, `low`, or `info`. |
| `status` | enum | One of the lifecycle states below. |
| `detected_at` | datetime | First detection time. |
| `last_seen_at` | datetime | Last observation time. |
| `evidence_summary` | string | Sanitized short evidence, no raw logs or PII. |
| `recommendation_summary` | string | Human-reviewable next step; no publishable article copy. |
| `owner_role` | enum | Suggested role, not direct assignment authority. |
| `cms_resource_link` | string or null | Backend-owned task/resource link when user has permission. |
| `release_evidence_id` | string or null | Release checklist or smoke evidence id when relevant. |
| `suppression_reason` | string or null | Required only for suppressed issues. |
| `risk_boundary` | object | Booleans proving read-only and no side effects. |

## Page Entity Types

Allowed first-version page entity types mirror `SEO-DASH-00B`:

- `home`
- `test_hub`
- `test_detail`
- `article`
- `topic`
- `personality`
- `career_job`
- `career_recommendation`
- `methodology`
- `dataset`
- `report_preview`
- `landing_page`

## Issue Types

Allowed first-version issue types:

- `missing_from_sitemap`
- `unexpected_in_sitemap`
- `draft_public_leak`
- `noindex_public_mismatch`
- `canonical_mismatch`
- `hreflang_gap`
- `llms_exposure_gap`
- `schema_gap`
- `private_url_leak`
- `content_decay`
- `competitor_gap_candidate`
- `tracking_gap`
- `post_publish_smoke_failure`

Rules:

- `competitor_gap_candidate` is advisory only and must not create CMS drafts or content briefs automatically.
- `tracking_gap` may reference event names and sanitized route families only; it must not expose raw cookies, user ids, order numbers, attempt ids, or payment payloads.
- `post_publish_smoke_failure` may link to release evidence but cannot mark a CMS resource unpublished by itself.

## Severity

Severity values:

- `critical`: private URL leak, draft leak, high-risk claim leak, or public surface causing severe search/indexing harm.
- `high`: published indexable page has broken canonical, noindex mismatch, sitemap contradiction, or post-publish smoke failure.
- `medium`: hreflang, schema, llms, tracking, or content-decay issue that needs planned remediation.
- `low`: weak signal, minor metadata gap, or advisory improvement candidate.
- `info`: observation only; not a blocking issue.

Default release behavior:

- `critical` and `high` issues must be visible to release operators before publish or search submission.
- `medium`, `low`, and `info` issues are triage inputs unless a release checklist explicitly escalates them.

## Lifecycle

Allowed states:

1. `open`
2. `triaged`
3. `assigned`
4. `blocked`
5. `suppressed`
6. `linked_to_cms_task`
7. `waiting_release`
8. `resolved_observed`
9. `closed`

State rules:

- `open -> triaged`: `owner_role`, `severity`, and sanitized evidence are reviewed.
- `triaged -> linked_to_cms_task`: an explicit backend-owned task or release note is created by a permitted user action.
- `linked_to_cms_task -> waiting_release`: CMS/release owner accepts the task into a backend-owned workflow.
- `waiting_release -> resolved_observed`: public runtime, sitemap/llms, or channel observation confirms the issue no longer appears.
- `resolved_observed -> closed`: operator confirms closure and records sanitized evidence.
- `suppressed` requires `suppression_reason`, reviewer role, and expiration or review date.
- Queue state changes do not mutate CMS fields, publish state, sitemap eligibility, llms eligibility, or search submission status.

## Role Boundary

Read roles:

- `owner`
- `ops_admin`
- `seo_operator`
- `analyst`
- `content_reviewer`
- `publisher`
- `sre`

Triage roles:

- `owner`
- `ops_admin`
- `seo_operator`
- `content_reviewer`

Allowed actions:

- read sanitized queue rows;
- triage severity and owner role;
- suppress with reason and review date;
- link to backend-owned CMS task or release evidence after explicit user action;
- export sanitized aggregate summaries.

Forbidden actions:

- mutate CMS fields;
- create CMS drafts;
- generate article title, H1, meta, FAQ, CTA, or body copy;
- publish, unpublish, rollback, or approve releases;
- submit URLs to Google, Baidu, Bing/IndexNow, or any search platform;
- mutate sitemap, llms, canonical, robots, or hreflang runtime behavior;
- expose raw logs, PII, raw order ids, raw attempt ids, payment payloads, checkout URLs, report URLs, auth tokens, cookies, or private URLs.

## Release Integration

CMS release checklists may display sanitized issue evidence:

- issue id;
- canonical URL;
- locale;
- issue type;
- severity;
- status;
- evidence summary;
- recommendation summary;
- linked CMS task id;
- release evidence id.

Release rules:

- Issue evidence may block or inform a human release decision when the backend/CMS release checklist says so.
- Issue evidence cannot auto-approve, publish, unpublish, rollback, revalidate, or submit search URLs.
- Search submission remains blocked by sitemap convergence and release checklist policy, not by the issue queue alone.

## Output Schema

JSON top-level fields:

- `version`
- `scope`
- `status`
- `source_documents`
- `authority_boundary`
- `source_inputs`
- `issue_key`
- `fields`
- `page_entity_types`
- `issue_types`
- `severity`
- `lifecycle`
- `roles`
- `release_integration`
- `sample_issues`
- `risk_boundary`
- `deferred_runtime_work`
- `repository_rule_impact`
- `recommended_follow_up`

CSV fields for future exports:

- `issue_id`
- `canonical_url`
- `locale`
- `page_entity_type`
- `entity_id_or_slug`
- `source_signal`
- `issue_type`
- `severity`
- `status`
- `detected_at`
- `last_seen_at`
- `owner_role`
- `cms_resource_link`
- `release_evidence_id`
- `suppression_reason`

## Deferred Runtime Work

This contract intentionally defers:

- `seo_intel` physical schema and migrations;
- collectors and cron/queue workers;
- GSC, Baidu, GA4, IndexNow, DataForSEO, Apify, or crawler integrations;
- CMS/Filament UI or policy implementation;
- frontend ops dashboard implementation;
- search submission adapters;
- content generation, CMS draft creation, publishing, rollback, revalidation execution, sitemap/llms runtime changes, deployments, and production operations.

## Repository Rule Impact

This PR changes architecture documentation and contract tests only. It reinforces existing repository rules:

- `fap-web` remains a deterministic renderer and ops shell consumer, not CMS authority.
- CMS/backend remains content, SEO metadata, publish state, release, and discoverability authority.
- SEO intelligence may write sanitized issue summaries to `seo_intel` only after a future approved backend/data PR.
- SEO issue rows are advisory human workflow inputs, not automatic content, publish, or search submission actions.

## Recommended Follow-Up

`SEO-ISSUE-QUEUE-02` is merged. `/ops/seo-operations` now consumes `docs/seo/generated/seo-issue-queue.v1.json` through an artifact adapter, but the dashboard remains an artifact-backed shell. It is not live `seo_intel`, CMS, GSC, Baidu, or GA4 truth.

Next task: `SEO-DASH-REAL-DATA-READINESS-01` or an equivalent real-data readiness scan/planning item before replacing the artifact-backed shell with live read models.

`SEO-ISSUE-QUEUE-01` adds a read-only offline generator only. It reads existing URL truth, sitemap inventory, competitor inventory, and mock CMS/search/analytics signals, then writes local JSON/CSV artifacts. It does not connect to CMS, create drafts, generate article copy, submit search URLs, mutate sitemap/llms, deploy, or read env/cookie/token data.

Future follow-up work should remain design-first unless separately authorized to create backend migrations, collectors, permissions, or dashboards.
