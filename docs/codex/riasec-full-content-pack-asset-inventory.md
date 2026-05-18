# RIASEC Full Deep Content Pack Asset Inventory

Date: 2026-05-18
PR: `RIASEC-FULL-CONTENT-PACK-01`
Status: governance inventory only

## Authority Boundary

RIASEC deep content may become user-facing runtime authority only after it is imported through backend/CMS governance and validated against the RIASEC slot contract. Frontend code must not become the source of interpretation copy, pair blends, low-quality copy, 140Q narratives, aspirations/disagree copy, or career examples.

This inventory does not import final editorial copy. It records what exists today, what is missing, who must review it, where it should land, and what claims remain forbidden.

## Status Legend

| Status | Meaning |
| --- | --- |
| `runtime-ready` | Existing backend/runtime contract and tests can carry the asset. |
| `partial-runtime` | Some backend-authored content exists, but coverage is incomplete. |
| `schema-ready` | Slot shape exists, but content coverage is missing or pending. |
| `docs-only` | Documented in repo but not runtime authority. |
| `external-only` | Mentioned as external/user-provided candidate material; not repo authority. |
| `missing` | Not found as reviewed runtime content. |
| `needs-psychometrics-review` | Must be reviewed for measurement/interpretation boundaries. |
| `needs-product-review` | Must be reviewed for UX, claims, examples, and user comprehension. |

## Inventory Matrix

| Asset group | Current status | Owner | Review requirement | Runtime destination | Blocker | No-go claims |
| --- | --- | --- | --- | --- | --- | --- |
| Six dimension deep copy | `partial-runtime`; six base R/I/A/S/E/C slots exist | content + psychometrics | Psychometrics review for high/medium/low bands, cost/shadow, safe low reading; product review for user wording | backend RIASEC deep copy registry -> `deep_content_slots_v1` -> report snapshot | Medium-band and profile-state variants are not complete | ability, personality identity, job fit, career success, hiring use |
| Pair blend 15 pairs | `partial-runtime`; 15-pair contract exists, I×A/I×S/A×S authored, 12 pending | content + psychometrics | Psychometrics approval for all 15 unordered pairs; product approval for naming and user boundaries | backend RIASEC deep copy registry | 12 pairs remain pending/unavailable | personality subtype, career match, occupation match, fit score, ranking |
| Top-3 code / activity chain strategy | `schema-ready`; deterministic pair selection exists; no full 120 ordered-code strategy | psychometrics + product | Must decide curated vs deterministic composition and when to omit | backend selector/registry, then projection/report snapshot | No approved 120-code or curated-code strategy | raw AI generation, score mutation, direct career recommendation |
| Career activity families | `partial-runtime`; six dimension families and eight examples-only code packs exist | product + content | Product/content review for examples-only wording and education/skill/qualification boundary | backend Activity Explorer / future registry | Code pack coverage is sparse; no reviewed career database linkage | Matches, source URL, O*NET, SOC, job fit, success prediction |
| 140Q narrative library | `partial-runtime`; generic task/environment/role and state slots exist | psychometrics + content | Psychometrics review for contextual meaning and tension boundaries | backend RIASEC deep copy registry | No full task/environment/role scenario library | more accurate, 60Q wrong, raw delta, job suitability |
| Low-quality cautious reading | `partial-runtime`; downgrade slots and module visibility exist | psychometrics + content | Psychometrics review for 60Q minimal boundary and 140Q flags; product review for user-safe tone | backend quality slots + module selector | Richer state copy and share/PDF variants incomplete | user blame, 140Q upsell, score correction, accuracy promise |
| Aspirations calibration | `partial-runtime`; generic boundary slots exist | product + content | Product review for aspiration domains; psychometrics review for non-mutation boundary | backend aspirations slots | No domain library for education/helping/creative/business/technical/ops/public service/high-risk domains | aspiration overrides measured code, suitability claim, qualification judgment |
| Disagree path | `partial-runtime`; generic safe slots exist | product + content | Product review for disagree scenarios; psychometrics review for retake/experiment boundary | backend feedback response slots | No near-tie/broad/low-quality disagree variants | feedback changes score, system corrected your Code, career recommendation |
| Feedback / Action Lab copy | `schema-ready` to `missing`; feedback overlay exists but full action copy library is not present | product + content | Product review for event taxonomy and no-mutation language | backend feedback/action slots, not frontend copy | No full saved/excluded/completed/energizing/draining/environment/role evidence copy | raw feedback exposure, score mutation, profile memory mutation |
| Share / PDF / history variants | `runtime-ready` for safety; content variants incomplete | product + content + backend | Product/content review; backend review for snapshot/public-safe payloads | report snapshot, share/PDF/history adapters, projection | Safe variants are not content-complete | raw feedback, internal snapshot_id, raw score delta, shareable fit/match claims |
| Fixture matrix | `partial-runtime`; V11 deep-copy matrix exists | QA + frontend + backend | QA review against final imported content versions | fap-web fixtures + backend tests | Current matrix validates runtime states, not full content coverage | forbidden phrases may appear only in negative assertions |
| Forbidden claims | `runtime-ready` for current slot/runtime tests; needs full pack expansion | QA + psychometrics + product | Must expand for every imported content group before runtime release | backend validators + fap-web contract tests | Needs per-asset claim scan and rendered-output scan | career matching, job fit, ranking, success, hiring, 140Q accuracy, raw delta |

## Minimum Viable Content Pack

Before a Full Deep Content Pack can be called launch-ready, the minimum asset set is:

1. Expanded six-dimension copy with safe high/medium/low readings.
2. All 15 pair blends reviewed or explicitly marked pending with fail-closed behavior.
3. A top-3 code/activity strategy that defines curated vs deterministic composition.
4. 140Q contextual narrative coverage for normal, caution, unavailable, and tension states.
5. Low-quality/cautious reading copy that keeps 60Q minimal-quality boundaries honest.
6. Fixture matrix and forbidden-claim scan tied to the imported content version.

## Full Content Pack Target

The full target additionally includes:

- Expanded career activity families with examples-only task and occupation examples.
- Aspirations domain library.
- Disagree path variants.
- Feedback / Action Lab copy.
- Share / PDF / history variants.
- Content release freeze and smoke acceptance.

## External Asset Handling

External desktop assets are candidate input only. They must be copied or imported only through a future authorized backend/CMS content PR with:

- source path and checksum;
- content version;
- locale;
- owner;
- psychometrics and product review status;
- evidence level;
- source status;
- forbidden-claim scan;
- fail-closed behavior.

If an external asset is unavailable during implementation, the target slot must stay pending or unavailable. Codex must not synthesize replacement interpretation copy.

## Sidecar Findings

| Issue | Severity | Blocks this PR? | Evidence |
| --- | --- | --- | --- |
| Full content assets are not yet review-approved runtime authority. | P0 for future content import | no | Current PR only creates inventory and gate docs. |
| External desktop assets are not guaranteed available in repo authority. | P1 | no | External assets require future import/review. |
| Pair blend coverage is incomplete. | P0 for Full Content Pack | no | 12 pair slots must remain pending until reviewed. |
| Activity Explorer is examples-only, not career registry matching. | P0 boundary | no | Future content must preserve `content_example_not_registry_match`. |
