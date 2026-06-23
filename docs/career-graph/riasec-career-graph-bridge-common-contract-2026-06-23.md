# RIASEC Career Graph Bridge Common Contract

Task: `RIASEC-CAREER-GRAPH-BRIDGE-COMMON-CONTRACT-01`

Verdict: `READY_FOR_POLICY_HANDOFF`

Mode: docs/contracts only. This is a handoff contract for future planning work, not Career Graph runtime implementation, not CMS writing, not publishing, not search submission, and not deterministic recommendation.

## Agent Boundary

- Producing agent: `riasec_result_page`
- Receiving agent: `career_content_graph`
- Gate agent: `claim_privacy_safety_gate`
- Observer: `analytics_gsc_opportunity`
- Canonical landing: `holland-career-interest-test-riasec`
- supported forms: `riasec_60`, `riasec_140`

## Allowed Inputs

Career Graph planning may consume only reviewed, public-safe RIASEC bridge inputs:

- `public_riasec_dimension_labels_and_order`
- `public_top_code_profile_shape_summary`
- `public_confidence_state`
- `public_caution_state`
- `public_low_quality_state`
- `public_method_boundary_copy`
- `reviewed_backend_owned_occupation_examples`
- `reviewed_backend_owned_activity_examples`
- `locale`
- `form_code_limited_to_riasec_60_or_riasec_140`
- `public_projection_version`
- `public_quality_state`

## Forbidden Inputs

The bridge must not consume private, unreviewed, raw, or trace-level inputs:

- `raw_item_answers`
- `raw_scores`
- `score_vectors`
- `percentiles`
- `selector_traces`
- `source_refs`
- `qa_traces`
- `editor_notes`
- `private_attempt_id`
- `user_id`
- `payment_state`
- `order_state`
- `report_access_state`
- `unreviewed_cms_text`
- `frontend_fallback_copy`
- `private_report_text`
- `full_private_result_payload`
- `hidden_repair_drafts`

## Safe Output Taxonomy

Allowed outputs are planning artifacts and exploration prompts only:

- `career_exploration_prompt`
- `major_exploration_prompt`
- `activity_pattern_prompt`
- `work_environment_prompt`
- `internal_link_candidate`
- `content_cluster_candidate`
- `cms_dry_run_candidate`
- `claim_gate_request`
- `blocked_recommendation_report`

Forbidden outputs remain blocked:

- `deterministic_career_recommendation`
- `admissions_prediction`
- `hiring_prediction`
- `salary_prediction`
- `performance_prediction`
- `success_prediction`
- `ability_ranking`
- `job_fit_score`
- `user_ranking`
- `occupation_ranking_as_objective_truth`
- `private_result_based_recommendation`
- `raw_score_based_match_reason`

## Bridge Language

Required safe phrase family:

- `examples_to_explore`
- `work_activities_to_compare`
- `career_areas_to_learn_about`
- `majors_or_roles_with_similar_activity_patterns`
- `starting_point_not_decision`

Forbidden phrase family:

- `best_career_for_you`
- `guaranteed_fit`
- `you_should_choose`
- `you_will_succeed`
- `hire_or_do_not_hire`
- `admissions_decision`
- `salary_prediction`
- `performance_prediction`
- `ability_measurement`
- `official_holland_type_determines_your_career`
- `low_score_means_cannot_do_this`

## Source Classification

Allowed source classes are limited to backend-owned public projection contracts, reviewed backend examples, fap-web consumer contracts, Runtime QA handoffs, Analytics handoffs, and Safety Gate artifacts. Missing review ledger evidence or private/unreviewed material must be classified as `blocked_private_or_unreviewed_source`.

## HOLD Actions

This contract asserts:

- `no_cms`
- `no_publish`
- `no_search_submission`
- `no_provider_calls`
- `no_deploy`
- `no_runtime_instrumentation`
- `no_career_graph_runtime_mutation`
- `no_generated_pages`
- `no_production_import`
- `no_opportunity_scoring`
- `no_search_channel_mutation`
- `no_raw_private_data`
- `no_deterministic_career_recommendation`
- `no_admissions_hiring_salary_performance_success_ability_claims`

Negative guarantees: runtime code changed: no; Career Graph runtime mutation: none; CMS writes: none; publish action: none; search submission: none; provider calls: none; deployment triggered: no; raw private result access: none.
