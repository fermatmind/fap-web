# FermatMind UASP Runtime Integration Readiness Report

Scope: PR-UASP2B-RPT report consolidation train.

Runtime behavior changed: no.

This report consolidates the UASP Runtime Integration readiness scan into one canonical document. It is a governance/report/contract artifact only. It does not implement UASP runtime, does not onboard new tests, does not change scoring, does not change report entitlement, does not change checkout/payment, does not change profile runtime, does not change recommendation runtime, and does not widen SEO/GEO exposure.

## 1. Executive Summary

UASP v1 governance/contract layer is complete: the repo has approved enums, a signal contract schema, first-batch scale mappings, decision domain registry, eligibility guards, profile/sensitivity policy, and readiness dashboard. The current state is still runtime-integration incomplete: UASP fields are not yet consumed by backend scale lookup/catalog, frontend test runtime, result/report payloads, SEO/GEO generation, freemium runtime, profile/memory, or recommendation runtime.

The Phase 2B runtime integration can start, but only as read-only metadata and fail-closed guards. The first safe step is a `uasp_signal_v1` metadata envelope keyed by backend `scale_code`, then bounded display/guard consumption in test detail and result/report surfaces. Profile persistence, sensitive signal storage, generalized recommendation, new scale onboarding, SEO/GEO exposure widening, and commerce behavior changes remain blocked.

Final readiness:

- UASP v1 governance/contract layer = complete
- UASP runtime metadata integration = ready to start
- UASP profile memory = blocked
- UASP generalized recommendation = blocked
- UASP new scale onboarding = blocked
- UASP sensitive signal persistence = blocked
- UASP SEO/GEO = guard-only, no expansion

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

| Area | Current State | Status | Boundary | Evidence |
| --- | --- | --- | --- | --- |
| `/v0.3/me/attempts` | Attempt/report history exists, but it is not UASP Profile. | `backend_ready` | Read-only history can reference UASP metadata later; it is not profile memory. | `backend/routes/api.php`; `backend/app/Services/V0_3/Me/MeAttemptsService.php` |
| `MeProfileService` | Returns org/user/anon/roles, not UASP signal profile. | `blocked` | Do not claim `/me/profile` UASP readiness. | `backend/app/Services/V0_3/Me/MeProfileService.php`; `backend/app/Http/Controllers/API/V0_3/MeController.php` |
| Memory service | Memory infrastructure exists with consent/version/deleted state, but is not UASP-governed durable signal memory. | `partial` | Keep separate from UASP profile until lifecycle/export/delete coverage is defined. | `backend/database/migrations/2026_01_28_140100_create_memories_table.php`; `backend/app/Services/Memory/MemoryService.php` |
| DSAR lifecycle | Does not yet cover all UASP memory candidates such as memories, profile projections, recommendation snapshots, and saved career items. | `blocked` | Blocks sensitive/profile signal persistence. | `backend/app/Services/Attempts/UserDataLifecycleService.php` |
| Saved careers | Visitor-key preference store, not UASP profile memory. | `safe_to_defer` | Do not promote saved careers into UASP profile. | `backend/app/Http/Controllers/API/V0_5/Career/CareerShortlistController.php`; `components/career/CareerShortlistAction.tsx` |
| `profile_contribution` | Policy says first-batch scales may contribute, but runtime storage is not implemented. | `blocked` | `profile_contribution = blocked for runtime storage` in Phase 2B. | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json` |

## 11. Recommendation UASP Integration Matrix

| Area | Current State | Status | Boundary | Evidence |
| --- | --- | --- | --- | --- |
| MBTI recommendation | Snapshot/deterministic career-direction support exists; UASP says `next_step_only`. | `partial` | Display/next-step only; not live personalized recommender. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`; `backend/app/Services/Career/Bundles/CareerRecommendationDetailBundleBuilder.php` |
| RIASEC | UASP says `candidate_signal`, but runtime is not full recommender. | `dangerous_if_integrated` | Candidate signal only; do not feed recommender without graph/evidence/claim proof. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json` |
| Big Five | UASP says `explanation_only`. | `blocked` | Must not become career matching/recommendation authority. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json` |
| Enneagram | UASP says `explanation_only`; not career mainline. | `blocked` | Motivation explanation only. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json` |
| Career scoring runtime | Backend scoring and claim gates exist outside UASP. | `partial` | UASP `recommendation_eligible = guard-only`. | `backend/app/Domain/Career/Scoring/ScoringEngine5D.php`; `backend/app/Domain/Career/Scoring/ClaimPermissionsCompiler.php` |
| Frontend local ranking | Forbidden as authority. | `blocked` | Must not become recommendation engine. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json` |

## 12. Scale-specific Runtime Risk Matrix

| Runtime Area | Current State | Status | Risk Boundary | Evidence |
| --- | --- | --- | --- | --- |
| Frontend take dispatch | Switches by `scale_code` and form behavior. | `safe_to_defer` | Acceptable for first batch; should not be generalized in report train. | `app/(localized)/[locale]/tests/[slug]/take/page.tsx` |
| Frontend fallback seeds | Public test seeds can bypass UASP if expanded. | `dangerous_if_integrated` | Future scale additions must require UASP contract and fallback owner gate. | `lib/content.ts`; `docs/runtime/generated/fallback-owner-gates.v1.json` |
| Rich result/report shells | Scale-specific shells and module logic. | `partial` | Add metadata envelope only; do not rewrite report shell routing now. | `components/result/RichResultReport.tsx`; `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx` |
| Backend questions/forms | Branches by scale and driver. | `partial` | Good enough for first batch, not future 20-scale onboarding. | `backend/app/Http/Controllers/API/V0_3/ScalesController.php`; `backend/app/Services/Scale/PublicScaleFormsProjector.php` |
| Backend scoring | Driver/scorer routing is scale/driver-specific. | `safe_to_defer` | Do not generalize scoring in UASP metadata integration. | `backend/app/Services/Assessment/AssessmentEngine.php`; `backend/config/fap.php` |
| SDS code mismatch | UASP artifact uses `SDS20`; backend uses `SDS_20`. | `requires_human_decision` | Canonical code normalization needed before sensitive scale runtime integration. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`; `backend/database/seeders/ScaleRegistrySeeder.php` |

## 13. UASP Runtime Ownership Matrix

| UASP Field / Area | Source of Truth Owner | Storage Recommendation | Runtime Consumer | Status |
| --- | --- | --- | --- | --- |
| `scale_code`, `scale_slug`, `form_code` | Backend scale registry | Existing DB/API fields or transform | Backend/frontend catalog, result/report envelope | `backend_ready` |
| `signal_type`, `result_shape`, `stability` | Backend UASP/scale metadata projection seeded from approved artifacts | Backend config/registry JSON namespace before DB migration | Test detail, result/report metadata display | `ready_for_integration` |
| `sensitivity`, `disclaimer_required` | Human policy + backend UASP metadata | Backend metadata; CMS copy for disclaimers | Result/report/test detail guard display | `requires_human_decision` |
| `decision_domains` | Backend UASP metadata | Backend response field | Test detail signal meaning, future CTA guard | `ready_for_integration` |
| `claim_level` | Backend/CMS governance | Backend metadata + CMS claim copy | Claim guard tests, copy validation | `partial` |
| `profile_contribution` | Human privacy/product decision | Artifact only for now; no runtime storage | Read-only display/guard only | `blocked` |
| `recommendation_eligible` | Product/graph governance | Artifact/backend metadata only | Guard tests only, not recommender runtime | `dangerous_if_integrated` |
| `seo_geo_eligible` | Discoverability governance | Backend metadata + SEO guard fixture | Sitemap/llms non-widening validator | `partial` |
| `freemium_status`, `report_eligible` | Freemium ledger + backend report authority | Readiness artifact and backend-derived proof | Offer/paywall claim guard only | `partial` |
| `runtime_authority_owner`, `frontend_fallback_policy`, `source_authority`, `rollback_policy` | Platform governance | Backend response/config artifact | Future scale onboarding gate | `ready_for_integration` |

## 14. P0 / P1 / P2 / P3 Backlog

| Priority | Item | Status | Owner / Gate | Evidence |
| --- | --- | --- | --- | --- |
| `P0` | Runtime Metadata Envelope Contract | `ready_for_integration` | Backend scale registry + UASP artifact projection | `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json`; `backend/app/Models/ScaleRegistry.php` |
| `P0` | Profile Write Blocker | `blocked` | Privacy/product decision before any profile persistence | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json`; `backend/app/Services/V0_3/Me/MeProfileService.php` |
| `P0` | Recommendation Guard | `dangerous_if_integrated` | Product/graph governance; guard-only until graph/evidence/claim proof exists | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`; `backend/app/Domain/Career/Scoring/ScoringEngine5D.php` |
| `P0` | Future Scale Onboarding Gate | `ready_for_integration` | Contract gate requiring UASP metadata and fallback owner proof | `docs/assessment/uasp/generated/uasp-readiness-dashboard.v1.json`; `docs/runtime/generated/fallback-owner-gates.v1.json` |
| `P1` | Result / Report Metadata Rendering Guard | `partial` | Frontend result/report shell consumes read-only metadata only | `components/result/RichResultReport.tsx`; `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx` |
| `P1` | SEO/GEO Eligibility Guard | `partial` | Discoverability guard, no URL widening | `app/llms.txt/route.ts`; `app/llms-full.txt/route.ts`; `next-sitemap.config.js` |
| `P1` | Freemium UASP Guard | `partial` | Freemium parity proof required before monetization claims | `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json`; `backend/app/Services/Commerce/SkuCatalog.php` |
| `P2` | Sensitive Scale Canonical Code Decision | `requires_human_decision` | Human canonicalization of `SDS20` vs `SDS_20` before sensitive runtime integration | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`; `backend/database/seeders/ScaleRegistrySeeder.php` |
| `P2` | CMS Disclaimer Ownership | `requires_human_decision` | Human/CMS policy for disclaimer copy and localization | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json` |
| `P3` | Full UASP Profile Memory Architecture | `blocked` | Long-term architecture only after DSAR/consent lifecycle closes | `backend/app/Services/Attempts/UserDataLifecycleService.php`; `backend/app/Services/Memory/MemoryService.php` |

## 15. Phase 2B Runtime Integration PR Train Proposal

| PR | Scope | Status | Must Not Touch | Evidence |
| --- | --- | --- | --- | --- |
| PR-UASP2B-01 Runtime Metadata Envelope Contract | Add backend/read-only `uasp_signal_v1` envelope contract using approved UASP artifact fields keyed by `scale_code`. | `ready_for_integration` | scoring, report entitlement, payment, recommendation, profile writes | `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json`; `backend/app/Models/ScaleRegistry.php` |
| PR-UASP2B-02 Result / Report UASP Metadata Rendering Guard | Let result/report surfaces display bounded signal metadata and caveats only after envelope exists. | `partial` | paid module logic, shell routing rewrite, scoring interpretation | `components/result/RichResultReport.tsx`; `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` |
| PR-UASP2B-03 SEO/GEO UASP Eligibility Guard | Add non-widening validators that prevent future scales from entering sitemap/llms/llms-full without UASP + evidence + claim authority. | `partial` | sitemap URL set, llms exposure, JSON-LD widening | `docs/seo/generated/discoverability-authority-matrix.v1.json`; `app/llms-full.txt/route.ts` |
| PR-UASP2B-04 Freemium UASP Guard | Add guard that prevents future scales from claiming monetization readiness without parity proof. | `partial` | checkout, payment, entitlement, report access | `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json`; `backend/app/Services/Report/ReportAccess.php` |
| PR-UASP2B-05 Recommendation UASP Guard | Lock `recommendation_eligible` as guard-only and block Big Five/RIASEC overclaim paths. | `dangerous_if_integrated` | recommender runtime, career scoring, graph expansion | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`; `backend/app/Domain/Career/Scoring/ClaimPermissionsCompiler.php` |
| PR-UASP2B-06 Profile Write Blocker & Memory Readiness Ledger | Add explicit blockers and readiness ledger for profile contribution, sensitive storage, DSAR coverage, and memory lifecycle. | `blocked` | profile persistence, sensitive signal storage, saved careers promotion | `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json`; `backend/app/Services/Attempts/UserDataLifecycleService.php` |

## 16. Codex-safe vs Human-decision-required Matrix

| Work Area | Status | Codex-safe Action | Human Decision Required | Evidence |
| --- | --- | --- | --- | --- |
| UASP metadata envelope schema/contract | `ready_for_integration` | Add read-only contract, fixtures, and validators. | Storage permanence and backend ownership confirmation if DB migration is proposed. | `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json` |
| Result/report metadata display guard | `partial` | Render existing metadata/caveats after backend envelope exists. | Exact user-facing copy and localization for sensitive disclaimers. | `components/result/RichResultReport.tsx` |
| Claim and recommendation guards | `dangerous_if_integrated` | Add tests that keep `recommendation_eligible` guard-only. | Any decision to make RIASEC/Big Five feed recommendation runtime. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json` |
| SEO/GEO eligibility guard | `partial` | Add non-widening validators and readiness fixtures. | Any new public exposure, llms-full eligibility, or sensitive scale indexability. | `app/llms.txt/route.ts`; `app/llms-full.txt/route.ts` |
| Freemium readiness guard | `partial` | Validate that `full_loop` requires parity proof. | Product/commercial decision to monetize non-MBTI scales. | `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json` |
| Profile contribution / memory | `blocked` | Add blocker tests and readiness ledger only. | Consent, retention, DSAR, deletion, sensitive storage, and longitudinal profile policy. | `backend/app/Services/Memory/MemoryService.php`; `backend/app/Services/Attempts/UserDataLifecycleService.php` |
| Sensitive scale canonicalization | `requires_human_decision` | Document mismatch and block runtime integration. | Canonical `SDS20` vs `SDS_20` code decision. | `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`; `backend/database/seeders/ScaleRegistrySeeder.php` |

## 17. What Must Not Be Integrated Yet

- UASP profile persistence must not be implemented.
- Sensitive signal storage must not be enabled.
- Saved careers must not be promoted to UASP profile memory.
- MBTI longitudinal memory must not be generalized.
- Generalized recommendation must not be implemented.
- RIASEC must not be represented as a precise career recommender.
- Big Five must not be represented as career matching/recommendation runtime.
- `recommendation_eligible` must not trigger scoring, graph expansion, or recommender input.
- `seo_geo_eligible` must not widen sitemap, `llms.txt`, `llms-full.txt`, JSON-LD, or indexable exposure.
- `freemium_status` must not alter checkout, payment, entitlement, report access, SKU, or paywall behavior.
- Future scale onboarding must not start until UASP runtime metadata and fallback gates are enforced.
- Sensitive/clinical examples must remain private/noindex and non-diagnostic until human privacy and disclaimer decisions are complete.

## 18. Final Phase 2B Readiness Assessment

| Assessment Area | Status | Final Judgment | Evidence |
| --- | --- | --- | --- |
| UASP v1 governance/contract layer | `ready_for_integration` | Complete. Approved enums, mappings, domains, guards, profile policy, and dashboard exist. | `docs/assessment/uasp/generated/uasp-readiness-dashboard.v1.json` |
| UASP runtime metadata integration | `ready_for_integration` | Ready to start as read-only envelope and guard integration. | `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json`; `backend/app/Models/ScaleRegistry.php` |
| Result/report runtime | `partial` | Can consume metadata later; must not change scoring, report entitlement, or paid modules. | `backend/app/Http/Controllers/API/V0_3/AttemptReadController.php`; `components/result/RichResultReport.tsx` |
| SEO/GEO runtime | `partial` | Guard-only, no expansion. UASP cannot add URLs or schema by itself. | `app/llms.txt/route.ts`; `next-sitemap.config.js` |
| Freemium runtime | `partial` | Guard-only. MBTI is reference full loop; other scales require parity proof. | `docs/freemium/generated/freemium-cross-scale-parity-ledger.v1.json` |
| Profile memory | `blocked` | Blocked until consent, DSAR, deletion, retention, and sensitive storage policy are runtime-ready. | `backend/app/Services/V0_3/Me/MeProfileService.php`; `backend/app/Services/Attempts/UserDataLifecycleService.php` |
| Generalized recommendation | `blocked` | Blocked. UASP `recommendation_eligible` is guard-only. | `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json` |
| New scale onboarding | `blocked` | Blocked until future scale gate is wired to runtime authority and fallback policy. | `docs/assessment/uasp/generated/uasp-readiness-dashboard.v1.json`; `docs/runtime/generated/fallback-owner-gates.v1.json` |

Final statement: Phase 2B may begin with metadata envelope and guard-only runtime integration. It must not begin with profile memory, generalized recommendation, new scale onboarding, sensitive persistence, SEO/GEO expansion, freemium behavior changes, or scoring/report/payment changes.

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
