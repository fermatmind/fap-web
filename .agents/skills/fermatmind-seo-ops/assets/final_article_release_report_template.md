# Final Article Release Report

Task: `<task-id>`

translation_group_id: `<translation-group-id>`

## Articles

| Locale | Article ID | Working Revision ID | URL | Public state | Indexability |
| --- | ---: | ---: | --- | --- | --- |
| zh-CN |  |  |  |  |  |
| en |  |  |  |  |  |

## Discoverability

| Surface | zh state | en state | Notes |
| --- | --- | --- | --- |
| sitemap |  |  |  |
| llms |  |  |  |
| llms-full |  |  |  |
| URL Truth |  |  |  |
| Search Channel Queue |  |  |  |
| IndexNow |  |  |  |
| GSC |  |  |  |
| Baidu |  |  |  |

## Schema And Hreflang

Daily full-chain closeout treats Article schema, Breadcrumb schema, and bilingual
reciprocal hreflang as the expected completed SEO enhancement state when the
Authorization Profile allows those gates and public verification passes.
FAQPage remains optional: `held` is expected unless visible FAQ and emitted
JSON-LD FAQ parity is explicitly verified.

| Surface | State | Evidence | Notes |
| --- | --- | --- | --- |
| Article schema |  |  |  |
| Breadcrumb schema |  |  |  |
| FAQ schema | held / enabled |  | held is acceptable unless visible FAQ parity passed |
| hreflang en |  |  |  |
| hreflang zh-CN |  |  |  |
| x-default |  |  |  |

SEO enhancement decision: `SEO_ENHANCEMENT_COMPLETE` / `SEO_ENHANCEMENT_HELD_REASON`

Held reason, if any:

-

## Search Submission Detail

| Channel | Queue item IDs | Approval state | Provider response | Live submitted | Notes |
| --- | --- | --- | --- | --- | --- |
| IndexNow |  |  | redacted |  |  |
| Baidu |  |  | redacted |  |  |
| GSC Request Indexing | n/a | exact manual gate | n/a |  |  |

## Closeout Evidence Artifacts

| Artifact | Path | Ingested by `articles:release-closeout` | Notes |
| --- | --- | --- | --- |
| Public smoke JSON |  |  |  |
| GSC manual Request Indexing JSON |  |  |  |
| D1/D7/D14 observation JSON |  |  | queued/pending window is acceptable on D0 |

## Holds

- GSC Request Indexing:
- Baidu live push:
- 360/Sogou/Shenma:

## Remaining Tasks

-

## Final Reconciliation

- reconciliation_status: `FINAL_RECONCILED` / `FINAL_SUMMARY_STALE_NEEDS_UPDATE`
- reconciled_at:
- stale_fields:
- corrected_current_truth:

## D1/D7/D14 Observation Plan

Use `assets/d1_d7_d14_observation_tasks_template.md`.

## Final Decision

`ARTICLE_PUBLISHED` / `DISCOVERABILITY_COMPLETE` / `SEARCH_SUBMITTED` / `SEO_ENHANCEMENT_COMPLETE` / `SEO_ENHANCEMENT_HELD_REASON` / `<decision>`

`ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING` means the D0 release,
discoverability, search submission, public smoke, and enabled SEO enhancement
gates are reconciled. It is not a failure state; only D1/D7/D14 performance
observation remains open.
