# Enneagram Public Personality Handoff Common Contract

Task: `ENNEAGRAM-PUBLIC-PERSONALITY-HANDOFF-COMMON-CONTRACT-01`

Verdict: `READY_FOR_POLICY_HANDOFF`

Mode: docs/contracts only. This is a common handoff contract from the Enneagram Result Page Agent to the Public Personality Content Agent. It is not public personality content generation, not a CMS package, not a CMS write, not publishing, not search submission, not provider execution, not backend import, not candidate activation, not deployment, not runtime mutation, and not private result access.

## Agent Boundary

- Producing agent: `enneagram_result_page`
- Receiving agent: `public_personality_content`
- Gate agent: `claim_privacy_safety_gate`
- Observer: `seo_geo_control`
- Observer: `analytics_gsc_opportunity`
- Scan verdict: `ENNEAGRAM_AUTHORITY_V2_116_PAGE_GOVERNANCE_ALIGNED`
- Public Personality Content Agent state: `authority_v2_governance_aligned`

## Current Authority V2 Estate

The existing backend-authoritative public estate is locked to:

- 1 hub, 3 centers, 9 core types, 18 wings, and 27 instinctual subtypes per locale;
- 58 identities across `en` and `zh-CN`;
- 116 public-page targets total.

This contract creates 0 pages and 0 routes. It must not expand into the separate 54 wing × instinct matrix, Tritype, generated pages, CMS writes, private-result-driven pages, or publishable body copy.

## Authority V2 Workflow Truth

- `en` and `zh-CN` are independently drafted from the same approved claim map.
- Every claim requires a V2 source-ledger reference; missing PR07 evidence fails closed.
- Model/agent QA is not human review. Assets remain `pending_manual_review` until a named human review record exists.
- Drafts live only in isolated working revisions. Published primary fingerprints and public revision pointers remain unchanged until a separate promotion gate.

## Allowed Inputs

Public Personality planning may consume only public-safe Enneagram handoff inputs:

- `public_enneagram_framework_summary`
- `public_type_names_and_labels`
- `public_type_ordering_coarse_safe`
- `public_motivation_pattern_summary`
- `public_center_or_triad_taxonomy_if_authority_supports`
- `public_wing_style_explanatory_taxonomy_if_authority_supports`
- `public_share_summary_safe_text`
- `public_low_quality_state`
- `public_diffuse_state`
- `public_close_call_state`
- `public_method_boundary_copy`
- `public_leans_toward_language`
- `public_closer_to_language`
- `public_may_reflect_language`
- `public_safe_cta_take_test`
- `public_safe_cta_compare_big_five`
- `public_safe_cta_compare_mbti`
- `locale`
- `public_projection_version`
- `public_quality_state`
- `public_safe_source_classification`

## Forbidden Inputs

The handoff must not consume private, raw, trace-level, internal, unreviewed, or finality-producing inputs:

- `attempt_id`
- `user_id`
- `raw_score`
- `display_score`
- `score_vector`
- `dominance_gap_abs`
- `dominance_gap_pct`
- `release_hash`
- `registry_hash`
- `content_hash`
- `schema_projection_internal_context`
- `source_refs`
- `qa_traces`
- `editor_notes`
- `private_report_text`
- `full_private_result_payload`
- `private_pdf_payload`
- `private_share_payload`
- `report_token`
- `private_result_url`
- `payment_state`
- `order_state`
- `benefit_state`
- `hidden_repair_drafts`
- `generated_candidate_payload_not_public_safe`
- `frontend_fallback_copy_as_authority`
- `final_type_certainty`
- `most_accurate_type_finality`

## Safe Output Taxonomy

Allowed outputs are planning and gate artifacts only:

- `public_type_explainer_candidate`
- `public_motivation_pattern_summary`
- `public_center_or_triads_explainer`
- `public_profile_package_candidate`
- `public_internal_link_candidate`
- `public_article_cluster_candidate`
- `cms_dry_run_candidate`
- `claim_gate_request`
- `private_boundary_report`
- `blocked_public_profile_report`

Forbidden outputs remain blocked:

- `private_result_profile`
- `attempt_based_profile`
- `deterministic_type_assignment`
- `final_type_certainty_claim`
- `clinical_diagnosis`
- `therapy_or_treatment_claim`
- `relationship_guarantee`
- `hiring_or_employment_suitability_claim`
- `salary_prediction`
- `performance_prediction`
- `success_prediction`
- `score_based_personality_ranking`
- `raw_result_based_profile`
- `private_report_text_rewrite`
- `public_page_generated_from_private_result_body`

## Public Language

Allowed phrase family:

- `may_reflect`
- `often_described_as`
- `can_be_used_for_reflection`
- `public_summary_only`
- `motivation_pattern`
- `not_fixed_identity`
- `not_diagnostic`
- `not_relationship_verdict`

Forbidden phrase family:

- `you_are_this_type`
- `definitely_type`
- `final_type`
- `most_accurate_type`
- `clinical_diagnosis`
- `treatment_plan`
- `relationship_match_guarantee`
- `hiring_decision`
- `success_prediction`
- `performance_prediction`

## Source Classification

Allowed source classes are limited to backend-owned public content assets, backend Authority V2 integrity gates, the Authority V2 source ledger and claim maps, backend public share summaries, result-page readiness handoffs, Runtime QA handoffs, Analytics handoffs, Safety Gate artifacts, and fap-web consumer contracts that prove boundaries but do not become content authority. Until PR07 supplies the V2 ledger, classify the dependency as `authority_v2_source_ledger_pending_pr07` and fail closed. Private, unreviewed, raw, hidden, or frontend fallback material remains `blocked_private_or_unreviewed_source` or `frontend_consumer_contract_not_authority`.

## HOLD Actions

This contract asserts:

- `no_cms`
- `no_publish`
- `no_search_submission`
- `no_provider_calls`
- `no_deploy`
- `no_runtime_instrumentation`
- `no_public_personality_runtime_mutation`
- `no_generated_pages`
- `no_backend_import`
- `no_candidate_activation`
- `no_opportunity_scoring`
- `no_search_channel_mutation`
- `no_raw_private_data`
- `no_private_result_text`
- `no_final_type_certainty`
- `no_diagnosis_therapy_treatment_hiring_salary_performance_success_relationship_claims`

Negative guarantees: runtime code changed: no; public personality runtime mutation: none; CMS writes: none; CMS package generation: none; publish action: none; search submission: none; provider calls: none; deployment triggered: no; backend import: none; candidate activation: none; generated pages: none; generated SEO artifacts: none; raw private result accessed: none; private result text reused: none.
