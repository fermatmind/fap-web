# FermatMind UASP Runtime Integration Readiness Report

Scope: PR-UASP2B-RPT report consolidation train.

Runtime behavior changed: no.

This report consolidates the UASP Runtime Integration readiness scan into one canonical document. It is a governance/report/contract artifact only. It does not implement UASP runtime, does not onboard new tests, does not change scoring, does not change report entitlement, does not change checkout/payment, does not change profile runtime, does not change recommendation runtime, and does not widen SEO/GEO exposure.

## 1. Executive Summary

Status: pending completion in PR-UASP2B-RPT-06.

## 2. UASP Artifact Reality Matrix

| Area | Status | Runtime Consumption | Evidence |
| --- | --- | --- | --- |
| UASP signal contract schema | `artifact_only` | Docs and contract tests only. No `app/`, `components/`, or `lib/` runtime consumer imports the UASP schema. | `docs/assessment/uasp/uasp-signal-contract-schema.md`; `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json`; `tests/contracts/uasp-signal-contract-schema.contract.test.ts` |
| Existing scale signal registry | `artifact_only` | First-batch mappings exist for MBTI, BIG5_OCEAN, RIASEC, and ENNEAGRAM, but runtime scale catalog/lookup does not return UASP fields. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`; `backend/app/Http/Controllers/API/V0_3/ScalesLookupController.php` |
| Decision domain registry | `artifact_only` | Domain definitions are contract-governed; result/report/test detail runtime does not consume decision domains. | `docs/assessment/uasp/generated/uasp-decision-domain-registry.v1.json`; `tests/contracts/uasp-decision-domain-registry.contract.test.ts` |
| Eligibility guards | `artifact_only` | Guard rules exist for claim, recommendation, SEO/GEO, and freemium, but they do not alter public runtime behavior. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`; `tests/contracts/uasp-eligibility-guards.contract.test.ts` |
| Profile and sensitivity policy | `artifact_only` | Policy exists; no UASP profile storage or sensitivity runtime is wired. | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json`; `backend/app/Services/V0_3/Me/MeProfileService.php` |
| UASP readiness dashboard | `artifact_only` | Dashboard says the contract layer is ready while runtime implementation is out of scope. | `docs/assessment/uasp/generated/uasp-readiness-dashboard.v1.json`; `tests/contracts/uasp-readiness-dashboard.contract.test.ts` |

## 3. Backend Scale Registry Integration Matrix

| UASP Field / Field Group | Current Backend State | Status | Recommended Phase 2B Handling | Evidence |
| --- | --- | --- | --- | --- |
| `scale_code` | Already runtime-present through scale registry, attempts, results, SKU, report access, and scale lookup APIs. | `backend_ready` | Use as join key for read-only `uasp_signal_v1`. | `backend/routes/api.php`; `backend/app/Models/ScaleRegistry.php`; `backend/app/Http/Controllers/API/V0_3/ScalesLookupController.php` |
| `scale_slug` | Derivable from `primary_slug` and slug maps. | `backend_ready` | Expose via existing lookup/catalog payload; do not duplicate in UASP storage. | `backend/database/migrations/2026_01_29_090000_create_scales_registry_table.php`; `backend/app/Services/Scale/ScaleRegistry.php` |
| `form_code` | Partially available through public forms projection and take flow form selection. | `partial` | Keep as transform-derived field first; do not require DB migration in first runtime envelope. | `backend/app/Services/Scale/PublicScaleFormsProjector.php`; `app/(localized)/[locale]/tests/[slug]/take/page.tsx` |
| `signal_type`, `result_shape`, `stability` | Defined only in UASP artifacts. | `ready_for_integration` | Add to backend-owned read-only scale metadata projection. | `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json`; `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json` |
| `sensitivity` | Defined in UASP policy; backend has separate hardcoded sensitive scale treatment. | `requires_human_decision` | Expose read-only after policy alignment; do not use for storage yet. | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json`; `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` |
| `decision_domains` | Defined only in UASP artifacts. | `ready_for_integration` | Backend response field first; frontend may render bounded signal meaning later. | `docs/assessment/uasp/generated/uasp-decision-domain-registry.v1.json` |
| `claim_level` | UASP artifact-only; runtime career claim gating uses `claim_permissions`. | `partial` | Add guard metadata; do not replace career `claim_permissions`. | `docs/claims/generated/public-claim-boundary-matrix.v1.json`; `lib/career/contracts/claimPermissions.ts` |
| `profile_contribution` | Policy exists, but no UASP-governed profile persistence exists. | `blocked` | Metadata only; runtime storage must remain blocked. | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json`; `backend/app/Services/V0_3/Me/MeProfileService.php` |
| `recommendation_eligible` | UASP artifact-only; career recommendation runtime is snapshot/graph-specific. | `dangerous_if_integrated` | Guard-only. Do not feed scoring or recommendation runtime. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`; `backend/app/Domain/Career/Scoring/ScoringEngine5D.php` |
| `seo_geo_eligible` | UASP artifact-only; runtime uses indexability, robots, sitemap, llms exposure policy. | `partial` | Non-widening guard only. Do not auto-add sitemap/llms URLs. | `next-sitemap.config.js`; `app/llms.txt/route.ts`; `app/llms-full.txt/route.ts` |
| `freemium_status` | UASP artifact-only; runtime uses SKU, report access, offers, entitlement. | `partial` | Readiness/claim guard only. Do not change checkout or report access. | `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json`; `backend/app/Services/Report/ReportAccess.php`; `backend/app/Services/Commerce/SkuCatalog.php` |

## 4. Frontend Test Runtime Integration Matrix

| Surface | Current State | Status | Phase 2B Recommendation | Evidence |
| --- | --- | --- | --- | --- |
| Test hub/catalog cards | Uses backend catalog items overlaid with frontend fallback public test seeds; no UASP metadata. | `frontend_partial` | Add UASP read-only guard before future scale onboarding; do not alter current card UI. | `lib/content.ts` |
| Slug/code mapping | Hardcoded canonical slug map and aliases. | `partial` | Keep as routing compatibility; do not let it become UASP authority. | `lib/assessmentSlugMap.ts` |
| Test detail page | Consumes lookup, `landing_surface_v1`, answer/SEO authority and fallback gates; no UASP `signal_type` or `claim_level`. | `frontend_partial` | Later render bounded signal meaning from backend UASP metadata. | `app/(localized)/[locale]/tests/[slug]/page.tsx` |
| Test take page | Dispatches clients by `scale_code`; MBTI/Big5/Enneagram/RIASEC form behavior remains scale-specific. | `safe_to_defer` | Do not generalize take flow in report train or Phase 2B metadata envelope. | `app/(localized)/[locale]/tests/[slug]/take/page.tsx` |
| Frontend fallback seeds | Can expose current public tests without UASP readiness if not gated. | `dangerous_if_integrated` | Future scale additions must fail without UASP contract/fallback owner. | `lib/content.ts`; `docs/runtime/generated/fallback-owner-gates.v1.json` |
| Result/report entry | Shell routing is scale-specific and does not consume UASP metadata. | `partial` | Add metadata envelope consumption later without changing shells. | `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`; `components/result/RichResultReport.tsx` |

## 5. Result / Report UASP Integration Matrix

| Surface | Current State | Status | Phase 2B Boundary | Evidence |
| --- | --- | --- | --- | --- |
| Attempt result payload | Carries `scale_code`, score data, result data, and scale-specific public projections; no UASP metadata envelope. | `backend_ready` | Add read-only `uasp_signal_v1` metadata. Do not change scoring or result interpretation. | `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` |
| Report payload | Builds scale-specific report payloads and access modules; no UASP metadata fields. | `backend_ready` | Add read-only signal metadata for display/guarding only. Do not change report entitlement. | `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php`; `backend/app/Services/Report/ReportAccess.php` |
| Frontend result client | Routes by scale-specific shells and projections. | `frontend_partial` | Consume UASP metadata only after backend envelope exists; do not rewire shell selection. | `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx` |
| Rich report shell | Uses scale-specific report shells and module access metadata. | `partial` | UASP metadata can render caveats and signal meaning, not modules or paid access. | `components/result/RichResultReport.tsx` |
| `profile_contribution` in result/report | Policy exists but storage semantics are not runtime-governed. | `blocked` | Result/report may display policy metadata, but must not persist profile signals. | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json` |
| `recommendation_eligible` in result/report | Policy exists but recommender runtime is separate. | `dangerous_if_integrated` | Treat as display/guard only; never trigger recommender. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json` |

## 6. Claim Runtime Integration Matrix

| Claim Area | Current State | Status | Runtime Boundary | Evidence |
| --- | --- | --- | --- | --- |
| Public claim boundary matrix | Exists as governance artifact and contract test. | `artifact_only` | Preserve forbidden baseline; do not change public copy in report train. | `docs/claims/generated/public-claim-boundary-matrix.v1.json`; `tests/contracts/public-claim-boundary-matrix.contract.test.ts` |
| Runtime career claim gating | Uses backend/frontend `claim_permissions`, not UASP `claim_level`. | `partial` | UASP `claim_level` can become guard metadata; it must not replace career claim permissions. | `lib/career/contracts/claimPermissions.ts`; `components/career/display/CareerDisplaySurface.tsx` |
| MBTI claim boundary | MBTI is identity/preference and `next_step_only` snapshot support. | `ready_for_integration` | Can describe preference, expression, identity, and career-direction support; cannot predict career success. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json` |
| Big Five claim boundary | Big Five is trait/workplace behavior and `explanation_only`. | `ready_for_integration` | Can explain behavior/workstyle; cannot claim precise career matching. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json` |
| RIASEC claim boundary | RIASEC is interest vector and `candidate_signal`. | `ready_for_integration` | Can describe career interest direction; cannot claim full or precise recommender runtime. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json` |
| Enneagram claim boundary | Enneagram is motivation/self-understanding and `explanation_only`. | `ready_for_integration` | Can explain motivation/workstyle/relationship patterns; should not enter career recommendation mainline. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json` |
| SDS/Clinical claim boundary | Sensitive state examples are blocked/private. | `blocked` | Must remain non-diagnostic, private/noindex, and not recommendation eligible. | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json` |

## 7. Evidence Runtime Integration Matrix

| Evidence Surface | Current State | Status | Phase 2B Boundary | Evidence |
| --- | --- | --- | --- | --- |
| Visible Evidence Container baseline | Runtime baseline exists for visible evidence markers and page-family readiness. | `partial` | Keep visible-only rule; do not claim universal evidence readiness. | `docs/geo/evidence-container-runtime-baseline.md`; `docs/geo/generated/evidence-container-runtime-baseline.v1.json`; `components/content/AnswerSurfaceSection.tsx` |
| UASP `evidence_required` | Defined in schema but not consumed by runtime. | `artifact_only` | Add as metadata gate; do not generate new evidence content. | `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json` |
| Signal-level evidence | Not separated from page-level answer/evidence blocks. | `blocked` | Requires future source authority before signal-specific evidence claims. | `components/content/AnswerSurfaceSection.tsx`; `lib/geo/evidenceContainer.ts` |
| FAQ / JSON-LD alignment | Existing governance requires visible FAQ/answer grounding; UASP does not drive it. | `partial` | Do not add hidden schema or FAQ stuffing. | `tests/contracts/evidence-container-readiness-gate.contract.test.ts`; `tests/contracts/structured-data-contract.contract.test.ts` |
| Sensitive scale evidence | Sensitive/mental-health examples are not UASP runtime-onboarded. | `blocked` | Require disclaimer/privacy decision before public evidence or llms-full use. | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json` |

## 8. SEO/GEO UASP Integration Matrix

| Surface | Current State | Status | Phase 2B Boundary | Evidence |
| --- | --- | --- | --- | --- |
| `seo_geo_eligible` | Defined in UASP artifacts but not consumed by sitemap, llms, metadata, or JSON-LD runtime. | `artifact_only` | Add non-widening guard only; do not change URL exposure. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`; `next-sitemap.config.js` |
| Sitemap generation | Uses existing discoverability authority, backend sitemap source, robots policy, and indexability. | `partial` | UASP may block future readiness; it must not silently add URLs. | `docs/seo/generated/discoverability-authority-matrix.v1.json`; `next-sitemap.config.js`; `backend/app/Http/Controllers/API/V0_5/SEO/SitemapSourceController.php` |
| `llms.txt` / `llms-full.txt` | Uses deny patterns, exposure policy, topic/test authority, and visible evidence/readiness rules; not UASP. | `partial` | `llms_full_eligible` requires visible evidence, claim boundary, and source authority. | `app/llms.txt/route.ts`; `app/llms-full.txt/route.ts`; `tests/contracts/llms-full-enrichment.contract.test.ts` |
| Sensitive/private signals | UASP policy blocks clinical/SDS examples; runtime exposure is not UASP-driven yet. | `blocked` | Sensitive scales cannot default to `llms_full_eligible` and should remain private/noindex until policy/runtime align. | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json`; `tests/contracts/private-noindex.contract.test.ts` |
| Metadata / JSON-LD | Runtime governed by existing SEO/structured data contracts; no UASP eligibility field. | `partial` | Do not infer JSON-LD readiness from UASP alone. | `tests/contracts/structured-data-contract.contract.test.ts`; `tests/contracts/canonical-hreflang-jsonld-parity.contract.test.ts` |

## 9. Freemium UASP Integration Matrix

| Surface | Current State | Status | Phase 2B Boundary | Evidence |
| --- | --- | --- | --- | --- |
| `freemium_status` | Defined in UASP artifacts; not consumed by checkout, offer, entitlement, report access, or PDF runtime. | `artifact_only` | Readiness/claim guard only; do not alter commerce runtime. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`; `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json` |
| MBTI full loop | Documented as full-loop reference and supported by existing report/commerce runtime. | `backend_ready` | Use as reference only; do not generalize automatically. | `docs/freemium/generated/freemium-runtime-coverage.v1.json`; `backend/app/Services/Report/ReportAccess.php` |
| Big Five | UASP marks `frontend_partial`; runtime support is not proven as full loop. | `frontend_partial` | Cannot claim monetization-ready without parity evidence. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`; `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json` |
| RIASEC | UASP marks `frontend_partial`; not full loop. | `frontend_partial` | Offer or report presence is not checkout parity proof. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`; `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json` |
| Enneagram | UASP marks `backend_ready`; public funnel parity is not full loop. | `backend_ready` | Backend readiness is not public conversion proof. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json` |
| Future scale | Default `blocked`. | `blocked` | Future scale cannot be monetization-ready without freemium parity proof. | `docs/assessment/uasp/generated/uasp-readiness-dashboard.v1.json` |
| SKU / offer / entitlement | Runtime exists but does not consume UASP `freemium_status`. | `partial` | Do not infer `full_loop` from SKU existence. | `backend/app/Services/Commerce/SkuCatalog.php`; `backend/app/Services/Commerce/EntitlementManager.php`; `backend/app/Services/Report/Resolvers/OfferResolver.php` |

## 10. Profile / Memory UASP Integration Matrix

Status: pending completion in PR-UASP2B-RPT-05.

## 11. Recommendation UASP Integration Matrix

Status: pending completion in PR-UASP2B-RPT-05.

## 12. Scale-specific Runtime Risk Matrix

Status: pending completion in PR-UASP2B-RPT-05.

## 13. UASP Runtime Ownership Matrix

Status: pending completion in PR-UASP2B-RPT-05.

## 14. P0 / P1 / P2 / P3 Backlog

Status: pending completion in PR-UASP2B-RPT-06.

## 15. Phase 2B Runtime Integration PR Train Proposal

Status: pending completion in PR-UASP2B-RPT-06.

## 16. Codex-safe vs Human-decision-required Matrix

Status: pending completion in PR-UASP2B-RPT-06.

## 17. What Must Not Be Integrated Yet

Status: pending completion in PR-UASP2B-RPT-06.

## 18. Final Phase 2B Readiness Assessment

Status: pending completion in PR-UASP2B-RPT-06.

## Source Artifact Index

The canonical machine-readable source artifact index is maintained in `docs/assessment/uasp/generated/uasp-runtime-integration-readiness-report.v1.json`.

### Phase 1A / PRAC Artifacts

- `docs/runtime/public-frontend-source-of-truth.md`
- `docs/runtime/generated/public-frontend-source-of-truth.v1.json`
- `docs/runtime/page-family-runtime-coverage.md`
- `docs/runtime/generated/page-family-runtime-coverage.v1.json`
- `docs/runtime/frontend-fallback-authority-inventory.md`
- `docs/runtime/generated/frontend-fallback-authority-inventory.v1.json`
- `docs/claims/public-claim-boundary-matrix.md`
- `docs/claims/generated/public-claim-boundary-matrix.v1.json`
- `docs/seo/discoverability-authority-convergence.md`
- `docs/seo/generated/discoverability-authority-matrix.v1.json`
- `docs/freemium/freemium-runtime-coverage.md`
- `docs/freemium/generated/freemium-runtime-coverage.v1.json`

### Phase 1B / PRA1B Artifacts

- `docs/runtime/fallback-owner-gates.md`
- `docs/runtime/generated/fallback-owner-gates.v1.json`
- `docs/geo/evidence-container-runtime-baseline.md`
- `docs/geo/generated/evidence-container-runtime-baseline.v1.json`
- `docs/freemium/freemium-cross-scale-parity-ledger.md`
- `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json`

### Phase 2A / UASP Artifacts

- `docs/assessment/uasp/uasp-signal-contract-schema.md`
- `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json`
- `docs/assessment/uasp/existing-scale-signal-mapping.md`
- `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`
- `docs/assessment/uasp/decision-domain-registry.md`
- `docs/assessment/uasp/generated/uasp-decision-domain-registry.v1.json`
- `docs/assessment/uasp/uasp-eligibility-guards.md`
- `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`
- `docs/assessment/uasp/profile-contribution-sensitivity-policy.md`
- `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json`
- `docs/assessment/uasp/uasp-readiness-dashboard.md`
- `docs/assessment/uasp/generated/uasp-readiness-dashboard.v1.json`
