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
| llms-full |  |  | mode/source, retry count, warm/revalidation attempts, resolved or documented runtime hold |
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

## GEO Media And Answer Assets

Daily full-chain closeout treats media as a GEO answer asset when the cover
sets the real reader scene, the body visual supports a specific answer block or
decision framework, and the public page exposes the relevant answer blocks,
entity cluster, claim boundaries, CTA, and internal links.

| Surface | Expected | Evidence | State | Notes |
| --- | --- | --- | --- | --- |
| cover image | public, non-decorative, topic-scene aligned |  |  |  |
| body visual | public and tied to answer block/section anchor |  |  |  |
| body visual type | checklist / flowchart / table / decision tree / entity map |  |  |  |
| alt text | string present; optional `alt_text_i18n` verified |  |  |  |
| entity cluster | media matches article entity map |  |  |  |
| answer blocks | first/core answer blocks visible and extractable |  |  |  |
| recent concept duplicate check | last 5 same-lane concepts reviewed |  |  |  |

GEO media decision: `GEO_READY_OBSERVATION_PENDING` / `GEO_MEDIA_HELD_REASON`

Held reason, if any:

-

## llms-full Runtime Stabilization

`documented runtime hold` is not the default success path. It is allowed only
after HTTP/1.1 recheck, bounded retry, and authorized target article
revalidation or llms-full warm have failed to produce a complete response.

| Check | Evidence | State | Notes |
| --- | --- | --- | --- |
| backend authority eligible |  |  |  |
| sitemap.xml contains URLs |  |  |  |
| llms.txt contains URLs |  |  |  |
| llms-full mode |  | complete / degraded / unknown |  |
| llms-full source |  | cache / generated / degraded / unknown |  |
| HTTP/1.1 recheck |  |  |  |
| retry window |  |  |  |
| revalidation / warm attempts |  |  |  |
| final `--expect-llms-full` verifier |  |  |  |

llms-full decision: `LLMS_FULL_STABILIZED` / `LLMS_FULL_RUNTIME_HOLD_DOCUMENTED`

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

`ARTICLE_PUBLISHED` / `DISCOVERABILITY_COMPLETE` / `SEARCH_SUBMITTED` / `SEO_ENHANCEMENT_COMPLETE` / `SEO_ENHANCEMENT_HELD_REASON` / `GEO_READY_OBSERVATION_PENDING` / `<decision>`

`ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING` means the D0 release,
discoverability, search submission, public smoke, and enabled SEO enhancement
gates are reconciled. It is not a failure state; only D1/D7/D14 performance
observation remains open.

`GEO_READY_OBSERVATION_PENDING` means the public article's answer blocks,
entity consistency, claim boundaries, internal links, and media answer assets
are visible and reconciled; only D1/D7/D14 GEO/SEO performance observation
remains open.

## Provider And Body Visual Reconciliation Addendum

For each provider record queue IDs, transport mode, execution state, submitted
flag, and hold reason. Allowed Baidu states are `submitted`,
`provider_security_hold`, `platform_action_required`, and `failed`.
`provider_security_hold` requires `submitted=false`, `intentional_hold=true`,
and matching audited evidence; it is not live submission.

| Body visual required | Asset key | Preview visible | Public visible | Body anchor | Answer block | URL count | State |
| --- | --- | --- | --- | --- | --- | ---: | --- |
|  |  |  |  |  |  |  |  |

A required visual with zero URL count or missing preview/public projection
blocks `GEO_READY_OBSERVATION_PENDING` with
`BLOCKED_BODY_VISUAL_PUBLIC_PARITY`.
