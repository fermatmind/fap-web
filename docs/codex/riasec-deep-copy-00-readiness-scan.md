# RIASEC-DEEP-COPY-00 Readiness Scan

Date: 2026-05-13
Mode / risk: scan/docs / L1
Branch: `codex/riasec-deep-copy-00`

## 1. Executive Summary

RIASEC has the runtime routing foundation for deep content, but it does not yet have populated, backend-authoritative deep copy runtime. `RIASEC-DEEP-COPY-00` registers the train and freezes the readiness finding; it does not import final copy or change behavior.

- Runtime-ready: interpretation rule spec v2, quality rule spec v2, projection v2 interpretation fields, module visibility policy, frontend fail-closed shell, and personalization fixture foundation.
- Contract-only: RIASEC deep content slot registry exists as a readiness contract, with `slot_status=readiness_contract_only`.
- Docs-only: external V11 and personalization assets on `/Users/rainie/Desktop` are candidate assets, not repo authority.
- Missing: populated runtime deep copy modules for dimension deep copy, core drive/cost/shadow, pair blend, 140Q narratives, low-quality/cautious reading, structural difference, aspirations, disagree path, and feedback response.
- First implementation PR: `RIASEC-DEEP-COPY-01 - Deep copy slot schema contract hardening`.

No scoring math, RIASEC question semantics, frontend UI, content pack, report/share/PDF/history runtime, analytics runtime, feedback runtime, or career registry runtime changed in this PR.

## 2. Current Runtime Map

| Area | Current state | Evidence path | Readiness |
| --- | --- | --- | --- |
| Interpretation state | Backend-owned fields exist: `profile_shape`, `profile_shape_version`, `clarity_label`, `near_tie_state`, `alternate_code`, `top_code_confidence`, `reading_strength`, `interpretation_rule_version`. | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Riasec/RiasecInterpretationRuleContract.php:9`, `:34`, `:350` | runtime-ready |
| Quality state | Backend-owned `quality_state`, `reading_strength`, 60Q limited low-quality boundary, 140Q contextual flag mapping. | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Riasec/RiasecQualityRuleContract.php:9`, `:39`, `:184` | runtime-ready |
| Module visibility | Backend policy emits visible/collapsed/hidden modules and fail-closed fallback policy. | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Riasec/RiasecReportModuleSelector.php:9`, `:40`, `:47` | runtime-ready |
| Projection v2 | Emits `quality`, `interpretation_state`, `module_visibility_policy`, activity explorer, and feedback overlay contract. | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Riasec/RiasecPublicProjectionService.php:156`, `:169`, `:185` | runtime-ready |
| Report composer | Snapshot-bound formal report includes projection v2 metadata, but not deep copy sections. | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Report/RiasecReportComposer.php` | partial |
| Content slot contract | Registry slot names and forbidden fields exist; schema is readiness-only and contains no public editorial copy. | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/Riasec/RiasecContentRegistrySlotContract.php:9`, `:12`, `:47` | contract-only |
| Frontend assembler | Parses backend interpretation and module visibility state. | `/Users/rainie/Desktop/GitHub/fap-web/lib/riasec/resultAssembler.ts:174`, `:306` | runtime-ready |
| Frontend shell | Renders from backend policy and emits empty backend-content state when no activity content is available. | `/Users/rainie/Desktop/GitHub/fap-web/components/result/riasec/RiasecResultShell.tsx:132`, `:298` | runtime-ready for fail-closed, not deep copy |
| Fixtures | Personalization fixture matrix and Trusted Result v1.5 freeze exist; deep-copy-specific fixtures are not present. | `/Users/rainie/Desktop/GitHub/fap-web/tests/contracts/riasec-personalization-fixture-matrix.contract.test.tsx:331`, `:456` | partial |

## 3. Content Slot Readiness Map

| Slot / capability | Status | Evidence path | Gap |
| --- | --- | --- | --- |
| interpretation rule spec v2 | runtime-ready | `RiasecInterpretationRuleContract.php:9` | none for routing foundation |
| quality rule spec v2 | runtime-ready | `RiasecQualityRuleContract.php:9` | deep cautious copy not populated |
| module visibility policy | runtime-ready | `RiasecReportModuleSelector.php:40` | no deep module content payload yet |
| dimension deep copy | contract-only/docs-only | `RiasecContentRegistrySlotContract.php:13`; `/Users/rainie/Desktop/riasec_v11_content_assets/02_riasec_v11_copy_assets/six_dimension_copy.md` | no runtime loader, versioned content, or projection section |
| core drive / cost / shadow copy | contract-only/docs-only | `RiasecContentRegistrySlotContract.php:16` | slot too coarse for block-level rendering and validation |
| pair blend copy | contract-only/docs-only | `RiasecContentRegistrySlotContract.php:14`; `/Users/rainie/Desktop/riasec_personalization_assets_v2/pair_blend_copy_slots.md` | no pair-key coverage matrix or runtime payload |
| 140Q task / environment / role narrative | contract-only/docs-only | `RiasecContentRegistrySlotContract.php:17`; `/Users/rainie/Desktop/riasec_personalization_assets_v2/140q_layer_state_copy.md` | no contextual card payload or 140Q state resolver section |
| 140Q tension narrative | docs-only | `/Users/rainie/Desktop/riasec_personalization_assets_v2/structural_difference_copy.md` | no explicit tension slot and no runtime structural difference narrative |
| low-quality / cautious reading copy | contract-only/docs-only | `RiasecContentRegistrySlotContract.php:20`; `/Users/rainie/Desktop/riasec_personalization_assets_v2/low_quality_copy_slots.md` | no runtime low-quality deep copy blocks |
| structural difference copy | contract-only/docs-only | `RiasecContentRegistrySlotContract.php:21` | no projection/composer consumption |
| aspirations calibration copy | contract-only/docs-only | `RiasecContentRegistrySlotContract.php:22`; `/Users/rainie/Desktop/riasec_personalization_assets_v2/aspirations_calibration_copy.md` | no aspirations runtime state |
| disagree path copy | missing/docs-only | `/Users/rainie/Desktop/riasec_personalization_assets_v2/feedback_response_copy.md`; `/Users/rainie/Desktop/riasec_v11_content_assets/05_exploration_feedback_copy/disagree_with_result_copy.md` | no dedicated slot or runtime state |
| feedback response copy | contract-only/docs-only | `RiasecContentRegistrySlotContract.php:23` | feedback overlay remains contract-level; raw feedback must not enter share/PDF |
| deep content fixture matrix | partial | `tests/contracts/fixtures/riasec/personalization-fixture-matrix.v2.json` | no deep copy content fixtures or imported slot validation fixtures |
| forbidden claim tests | partial | `RiasecContentRegistrySlotContractTest.php:42`, `riasec-personalization-fixture-matrix.contract.test.tsx:456` | needs deep-copy-specific scan across runtime payloads and rendered output |

## 4. Big Five Reusable Pattern Map

| Big Five pattern | Evidence path | Reuse for RIASEC | Boundary |
| --- | --- | --- | --- |
| ReportEngine V2 blocks and provenance | `/Users/rainie/Desktop/GitHub/fap-api/backend/app/Services/BigFive/ReportEngine/Resolver/ProvenanceRecorder.php:17` | Use block-level provenance and registry references for RIASEC deep copy. | Do not import Big Five personality copy or norm claims. |
| Selector and route matrix tests | `/Users/rainie/Desktop/GitHub/fap-api/backend/tests/Unit/Services/BigFive/ResultPageV2/RoutingTest.php`; `BigFiveResultPageV2SelectorAssetImportV03Test.php:51` | Reuse schema validation, selector readiness, and unresolved-reference reporting shape. | RIASEC has Holland-code/contextual evidence, not Big Five domain/facet percentiles. |
| Low-quality validator | `/Users/rainie/Desktop/GitHub/fap-api/backend/tests/Unit/Services/BigFive/ResultPageV2/BigFiveResultPageV2ValidatorTest.php:338` | Reuse degraded-module validation shape for RIASEC low-quality states. | RIASEC 60Q low-quality remains limited unless expert-approved signals exist. |
| Frontend report engine assembler | `/Users/rainie/Desktop/GitHub/fap-web/lib/big5/resultAssembler.ts:260`, `:572` | Reuse fail-closed resolver and normalized block pattern. | RIASEC frontend must not become interpretation copy authority. |
| Contract fixture rendering | `/Users/rainie/Desktop/GitHub/fap-web/tests/contracts/big5-result-page-v2-consumer.contract.test.tsx` | Reuse payload-only consumer testing style. | RIASEC fixtures must preserve examples-only career boundary. |

## 5. RIASEC V11 Deep Copy Asset Map

| Asset source | Location | Repo authority today | Use in train |
| --- | --- | --- | --- |
| Personalization v2 assets | `/Users/rainie/Desktop/riasec_personalization_assets_v2/` | docs-only external candidate | Use for dry-run validation in `RIASEC-DEEP-COPY-08`; not runtime authority until imported through backend validator. |
| V11 content assets | `/Users/rainie/Desktop/riasec_v11_content_assets/` | docs-only external candidate | Use as content inventory input; do not copy into frontend. |
| Method assets | `/Users/rainie/Desktop/riasec_v11_content_assets/01_riasec_method_assets/` | docs-only unless mirrored by backend contracts | Cross-check against existing interpretation/quality/module contracts. |
| QA fixtures | `/Users/rainie/Desktop/riasec_v11_content_assets/06_qa_fixtures/` | docs-only | Seed future fixture matrix after schema validator exists. |

## 6. Missing Runtime Fields / Slots

| Missing / incomplete item | Required before user-facing deep copy? | Owner | Notes |
| --- | --- | --- | --- |
| Block-level deep copy schema with locale/version/status/evidence level | yes | backend/content | Current slot contract names modules but does not define renderable block shape. |
| Runtime registry loader or content resolver | yes | backend | Missing content must omit module, not trigger frontend fallback. |
| Dimension deep copy payload | yes for deep result page | content/psychometrics/backend | Must avoid norm/percentile claims. |
| Core drive/cost/shadow payload | yes for deep result page | content/psychometrics/backend | Must remain interest interpretation, not personality diagnosis. |
| Pair/triad blend key coverage matrix | yes for blend modules | content/psychometrics/backend | Coverage must be explicit; missing keys fail closed. |
| 140Q contextual narrative payload | yes for 140Q cards | content/psychometrics/backend | Must be contextual evidence, not a better answer. |
| Structural difference/tension state payload | yes for cross-form narrative | psychometrics/backend/content | No raw delta, no "60Q wrong" framing. |
| Aspirations and disagree path runtime state | no for first deep copy slice; yes for later overlay | product/backend/content | Must not mutate measured result. |
| Deep-copy-specific forbidden claim fixture matrix | yes before public deep copy | QA/backend/frontend | Must scan payload and rendered output. |

## 7. Required Content Assets

P0 before public deep copy:

- `riasec_deep_copy_slot_schema_v1`: backend schema for renderable block payloads; owner backend/content; depends on current slot readiness contract.
- `riasec_dimension_deep_copy_v1`: six-dimension interest copy; owner content/psychometrics; boundary: no ability/personality/success claims.
- `riasec_pair_blend_copy_v1`: pair blend copy keyed by Holland code pairs; owner content/psychometrics; boundary: no career matching language.
- `riasec_low_quality_cautious_copy_v1`: cautious reading copy; owner psychometrics/content; boundary: 60Q strong low-quality cannot be overclaimed.
- `riasec_deep_copy_forbidden_claim_matrix_v1`: QA matrix; owner QA/backend/frontend; boundary: exact claim scanner and rendered-output coverage.

P1 after P0 schema and loader:

- `riasec_140q_contextual_cards_v1`: task/environment/role narratives; owner content/psychometrics; boundary: 140Q is contextual, not more accurate.
- `riasec_structural_difference_copy_v1`: bounded cross-form narrative; owner psychometrics/content; boundary: no raw score delta.
- `riasec_core_drive_cost_shadow_v1`: deeper interpretation blocks; owner content/psychometrics; boundary: interest evidence only.

P2 after measured-result identity is stable:

- `riasec_aspirations_calibration_copy_v1`: owner product/content; boundary: does not change measured code.
- `riasec_disagree_path_copy_v1`: owner product/content; boundary: feedback is overlay only.
- `riasec_feedback_response_copy_v1`: owner product/content; boundary: raw feedback not exposed in share/PDF.

## 8. Required Fixtures

- Baseline 60Q clear profile with no deep content: module omission must be safe.
- 60Q blended profile with pair slot available.
- 60Q broad/near-tie profile with pair slot missing.
- 60Q low-quality boundary: strong modules hidden, cautious copy only if backend-provided.
- 140Q contextual form: task/environment/role cards visible only with backend payload.
- 140Q tension: structural difference narrative without raw-score delta or "wrong result" framing.
- Missing content: unknown slot and missing slot both fail closed.
- Forbidden claim payload: backend validator rejects claim fields and unsupported source fields.
- Rendered output: frontend does not display forbidden career, fit, success, ranking, raw delta, or accuracy-overclaim wording.

## 9. PR Train Proposal

| PR | Repo | Goal | Depends on | Scope | Acceptance | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| RIASEC-DEEP-COPY-00 | fap-web | Register train and readiness scan. | RIASEC-PERSONALIZATION-07 | `docs/codex/**` only. | Manifest/state valid; scan report exists; no runtime files changed. | Remove train entries/report. |
| RIASEC-DEEP-COPY-01 | fap-api | Harden deep copy slot schema contract. | 00 | `RiasecContentRegistrySlotContract`, tests. | Slot schema defines block shape, locale/version/status/evidence level, forbidden fields. | Revert schema extension. |
| RIASEC-DEEP-COPY-02 | fap-api | Add registry loader/resolver contract. | 01 | RIASEC registry resolver, tests. | Missing/unknown content omits modules; no frontend fallback. | Disable lookup. |
| RIASEC-DEEP-COPY-03 | fap-api | Wire dimension and core drive/cost/shadow slots into composer/projection. | 02 | Projection/composer/tests. | Backend emits deterministic modules only when content exists. | Stop emitting modules. |
| RIASEC-DEEP-COPY-04 | fap-api | Wire pair and triad blend slots. | 02 | Resolver/composer/tests. | Pair/triad keys are explicit and fail closed when missing. | Stop emitting blend modules. |
| RIASEC-DEEP-COPY-05 | fap-api | Wire 140Q contextual narrative slots. | 02 | 140Q contextual module resolver/tests. | Task/environment/role cards are contextual only and never described as more accurate. | Stop emitting 140Q modules. |
| RIASEC-DEEP-COPY-06 | fap-api | Wire cautious, structural, aspiration, disagree, and feedback response slots. | 02 | Quality/feedback/copy resolver contracts. | Low-quality and feedback paths do not mutate measured result. | Stop emitting optional modules. |
| RIASEC-DEEP-COPY-07 | fap-web | Consume backend deep copy modules fail-closed. | 03, 04, 05, 06 | RIASEC assembler/shell/tests. | Frontend renders backend modules only; unknown modules hidden. | Revert to Trusted Result v1.5 shell. |
| RIASEC-DEEP-COPY-08 | fap-api | Add external asset dry-run validator; no import. | 01, 02 | Validator/tests/docs. | External Desktop assets can be validated without becoming runtime authority. | Remove dry-run validator. |
| RIASEC-DEEP-COPY-09 | fap-web | Add deep copy contract fixtures and forbidden claim tests. | 07 | Contract fixtures/tests. | Payload and rendered output block forbidden claims. | Remove fixtures/tests. |
| RIASEC-DEEP-COPY-10 | fap-web | Freeze acceptance and remaining gaps. | 07, 08, 09 | Acceptance report/tests. | Deep copy authority is documented; no Big Five parity claim. | Remove acceptance report/tests. |

## 10. Recommended First Implementation PR

Recommended first implementation PR: `RIASEC-DEEP-COPY-01 - Deep copy slot schema contract hardening`.

It must come before loader, projection, UI, dry-run import, and fixtures because the current slot contract only names coarse slots. Without a validated block schema, later PRs would either let the frontend invent content shape or import candidate copy without a backend authority boundary.

## 11. No-Go Conditions

- Do not claim RIASEC reaches Big Five parity from this train registration.
- Do not import final external copy directly into frontend code.
- Do not add frontend fallback interpretation copy.
- Do not add career matching, job fit, occupation ranking, career success prediction, or fit scores.
- Do not display occupation examples as matches.
- Do not invent O*NET, SOC, source URL, or reviewed registry source rows.
- Do not describe 140Q as more accurate than 60Q.
- Do not compare 60Q/140Q raw score deltas.
- Do not let feedback mutate measured Holland code, RIASEC scores, snapshots, share payloads, or PDFs.
- Do not add runtime AI-generated formal report text.
- Do not add norm, percentile, z, or t-score claims for RIASEC.

## 12. Sidecar Issues

| Issue | Severity | Evidence | Blocks RIASEC-DEEP-COPY-00? | Suggested owner |
| --- | --- | --- | --- | --- |
| fap-api working tree has unrelated dirty state on `codex/pr-rt-04-article-baseline-republish`. | P2 | `git -C /Users/rainie/Desktop/GitHub/fap-api status --short --branch` showed unrelated modified backend/article/career docs files during scan. | no | current fap-api branch owner |
| fap-api manifest/state may need companion registration before fap-api DEEP-COPY implementation PRs. | P1 | This PR registers the train in fap-web because it is the current PR-train owner for this scan; fap-api was not touched. | no | RIASEC-DEEP-COPY-01 executor |
| External assets are outside repo authority. | P1 | `/Users/rainie/Desktop/riasec_personalization_assets_v2/` and `/Users/rainie/Desktop/riasec_v11_content_assets/` are candidate docs only. | no | content/backend |
| Deep copy runtime copy is not populated. | P0 for public deep copy | `RiasecContentRegistrySlotContract.php:47` reports readiness-only status. | no | backend/content |

## 13. Changed Files

- Added: `/Users/rainie/Desktop/GitHub/fap-web/docs/codex/riasec-deep-copy-00-readiness-scan.md`
- Modified: `/Users/rainie/Desktop/GitHub/fap-web/docs/codex/pr-train.yaml`
- Modified: `/Users/rainie/Desktop/GitHub/fap-web/docs/codex/pr-train-state.json`
- Deleted: none
