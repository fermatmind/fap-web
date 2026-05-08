# UASP Signal Contract Schema v1

Scope: PR-UASP-01

Train: universal-assessment-signal-platform-v1-train

Runtime behavior changed: no

## Purpose

Universal Assessment Signal Platform v1 makes each existing assessment a governed signal source before it can enter FermatMind OS surfaces.

This artifact is contract/schema only. It does not onboard new tests, change scoring, change reports, change checkout/payment, widen SEO/GEO exposure, implement recommendations, or implement profile runtime.

## Manual Decision Source

Source files:

- `/Users/rainie/Desktop/UASP_v1_manual_decision_for_codex.md`
- `/Users/rainie/Desktop/uasp_v1_manual_decision_enums.json`

Manual decision version: `uasp.manual-decision.v1`

Policy: Do not invent enums. If an existing scale does not fit the approved UASP v1 enums, mark it `requires_human_decision` in later readiness artifacts instead of adding a new enum.

## Contract Fields

Every UASP v1 scale/form signal record must expose these fields:

- `scale_code`
- `scale_slug`
- `form_code`
- `signal_type`
- `result_shape`
- `stability`
- `sensitivity`
- `decision_domains`
- `claim_level`
- `profile_contribution`
- `recommendation_eligible`
- `report_eligible`
- `seo_geo_eligible`
- `freemium_status`
- `evidence_required`
- `disclaimer_required`
- `runtime_authority_owner`
- `frontend_fallback_policy`
- `version`
- `locale_support`
- `source_authority`
- `rollback_policy`

## Approved Enums

### `signal_type`

`identity`, `trait`, `interest`, `ability`, `emotion`, `relationship`, `workstyle`, `motivation`, `state`, `value`, `learning`

### `result_shape`

`type`, `vector`, `band`, `score`, `facet_vector`, `profile`, `hybrid`, `state`, `ability_estimate`, `ranked_profile`

### `stability`

`stable_trait`, `semi_stable_preference`, `temporary_state`, `ability_estimate`, `contextual_pattern`, `developmental`, `unknown`

### `sensitivity`

`normal`, `sensitive`, `mental_health_sensitive`, `ability_sensitive`, `minor_sensitive`, `workplace_sensitive`, `relationship_sensitive`

### `profile_contribution`

`none`, `summary_only`, `longitudinal`, `sensitive_opt_in`, `ephemeral`, `blocked`

### `decision_domain`

`self_understanding`, `career_decision`, `workstyle_decision`, `relationship_decision`, `learning_growth`, `emotional_state`, `ability_growth`, `team_communication`, `leadership_growth`, `life_direction`

### `claim_level`

`descriptive`, `interpretive`, `directional`, `decision_support`, `recommendation_candidate`, `forbidden`

### `recommendation_eligible`

`not_eligible`, `explanation_only`, `next_step_only`, `candidate_signal`, `eligible_with_guard`

### `seo_geo_eligible`

`not_eligible`, `seo_only`, `geo_candidate`, `llms_eligible`, `llms_full_eligible`, `private_noindex`

### `freemium_status`

`not_monetized`, `free_only`, `backend_ready`, `frontend_partial`, `full_loop`, `bundle_candidate`, `blocked`

## Default Gates

Future, new, or unknown scales must default to:

- `recommendation_eligible = not_eligible`
- `seo_geo_eligible = not_eligible`
- `profile_contribution = none`
- `freemium_status = blocked`
- `claim_level = descriptive`
- `stability = unknown`
- `report_eligible = false`
- `evidence_required = true`
- `disclaimer_required = false`
- `frontend_fallback_policy = forbidden_for_new_surface`

## Hard Rules

- A scale cannot be public-catalog-ready without a UASP signal contract.
- A scale cannot be recommendation-ready without claim, evidence, graph, and runtime support.
- A scale cannot be SEO/GEO-ready without evidence, discoverability, and claim boundary.
- A scale cannot be monetization-ready without freemium parity proof.
- A scale cannot enter long-term profile without a profile contribution policy.
- Sensitive scales require sensitivity policy and disclaimer rules.
- Mental-health-sensitive scales must not be diagnostic.
- Ability-sensitive scales must not evaluate human worth.
- Frontend fallback cannot become scale authority.

## No Runtime Change Statement

This PR adds UASP v1 schema and contract artifacts only. It does not change application runtime, public routes, sitemap/llms output, scoring, reports, checkout/payment, profile runtime, recommendation runtime, or SEO/GEO exposure.
