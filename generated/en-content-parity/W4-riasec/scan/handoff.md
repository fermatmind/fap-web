# W4 RIASEC English parity scan handoff

## Outcome

The canonical count of 14 logical reader-asset groups is confirmed and has been refreshed for the inventory-freeze candidate. The real expanded workload is **1550 atomic rows**:

- 42 six-dimension and core/cost/shadow units
- 15 unordered pairs
- 20 unordered top3 base compositions
- 720 activity/task and occupation-example rows
- 133 140Q/context/structural rows
- 24 quality/reading-state rows
- 115 aspirations/disagree rows
- 474 feedback/Action Lab/next-node rows
- 7 share/PDF/history surface rows

The master manifest's `14 / 0 / 14` remains valid only as logical-group completion. Physical English inventory is different: seven safe-variant rows already exist, but all seven are `draft_human_review_required`; therefore parity-ready English rows and parity-ready logical groups remain zero.

## Current hard HOLD

W4 is `launch_ready/not_started` with next action:

> Hold until wave 1 packages are available for QA and capacity is free.

The control window has authorized the inventory freeze only. The formal inventory package and candidate patch are now generated for CONTROL review; the master remains unchanged until CONTROL accepts them.

## Highest-risk architecture findings

1. `RiasecDeepCopySlotRegistry` is fixed to zh-CN asset paths and slot locale.
2. `RiasecActivityExplorerService` and `RiasecExplorationFeedbackOverlayService` are also fixed to zh-CN assets.
3. `RiasecPublicProjectionService` can label an envelope `en` while appending zh-CN slots.
4. fap-web validates slot shape/status/fallback but does not reject envelope/slot locale mismatch.
5. The seven English lifecycle rows are loaded as available even though their review status remains draft.

The future runtime repair must be backend locale-aware and fail closed. fap-web adds only a locale-equality defense; it must not add translation or interpretation fallback copy.

## Top3 decision

The approved architecture is **20 authored unordered top3 assets plus deterministic ordered emphasis**. Do not generate 120 reader assets. Runtime can derive 120 ordered codes; current explicit QA covers 60 representative codes, so backend QA should be extended to 120/120 after English package freeze.

## Safe variants

- Share: 3 rows
- PDF: 2 rows
- History: 2 rows

They are independent logical groups and must receive independent QA even though they share one backend file. Safety flags currently pass; content review/freeze does not.

## Recommended execution order after launch_ready

1. Execute `EN-PARITY-W4-RIASEC-INVENTORY-01`.
2. Execute the backend locale contract and the nine candidate content segments without mixing repositories or reader content with runtime code.
3. Aggregate only after every segment is merged, then freeze one exact 1550-row W4 package.
4. Hand the exact package SHA to W9; W4 must not self-declare QA PASS.
5. After W9 PASS, implement/read-run the exact-package dry-run mapping and bilingual QA.
6. Obtain separately hashed human approval before any draft import.
7. Keep editorial approval, pilot, live QA, and any later release as separate gates.

## Explicitly not required

No SEO/indexability PR is needed. Private results, reports, PDF, history, and feedback remain noindex/private; share remains a public-safe summary surface, not a new searchable content surface. No sitemap, llms, schema, Search Channel, or URL submission work belongs in W4.

## Permissions and data handling

All write/release permissions remain false. No environment file, private attempt, raw score/vector, percentile, selector trace, report token, private PDF URL, user, order, payment, CMS, staging, or production data was accessed or changed.
