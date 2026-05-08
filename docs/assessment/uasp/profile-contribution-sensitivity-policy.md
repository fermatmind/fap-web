# UASP Profile Contribution & Sensitivity Policy

Scope: PR-UASP-05

Train: universal-assessment-signal-platform-v1-train

Runtime behavior changed: no

This policy defines how Universal Assessment Signal Platform v1 classifies sensitivity, profile contribution, retention, and disclaimer requirements before any signal can contribute to future profile memory. It is policy and contract only. It does not implement profile memory, persist sensitive signals, change auth, change attempt storage, or change report access.

## Source Artifacts

- `docs/assessment/uasp/generated/uasp-signal-contract-schema.v1.json`
- `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`
- `docs/assessment/uasp/generated/uasp-eligibility-guards.v1.json`
- `/Users/rainie/Desktop/UASP_v1_manual_decision_for_codex.md`
- `/Users/rainie/Desktop/uasp_v1_manual_decision_enums.json`

## Sensitivity Policy

| Sensitivity | Default retention | Default disclaimer | Recommendation default |
| --- | --- | --- | --- |
| `normal` | `summary_storage` or `longitudinal_storage` when explicitly mapped | `none` or `informational` | Must follow scale registry |
| `sensitive` | `summary_storage` unless explicitly approved | `sensitive_result` | Explanation only unless separately gated |
| `mental_health_sensitive` | `session_only` or `opt_in_sensitive_storage` | `mental_health` | `not_eligible` |
| `ability_sensitive` | `summary_storage` only | `ability_estimate` | Explanation only; no human-worth or employment-suitability claims |
| `minor_sensitive` | `blocked_storage` until minor policy exists | `minor_protection` | `not_eligible` |
| `workplace_sensitive` | `summary_storage` | `workplace_context` | Explanation only unless separately gated |
| `relationship_sensitive` | `summary_storage` | `relationship_context` | Explanation only unless separately gated |

## Profile Contribution Policy

| Profile contribution | Runtime meaning | Allowed retention |
| --- | --- | --- |
| `none` | Signal does not contribute to profile memory. | `no_profile_storage` |
| `summary_only` | Signal may appear as a non-longitudinal summary when product policy allows it. | `summary_storage` |
| `longitudinal` | Signal may contribute to longitudinal profile interpretation when the scale is not sensitive and has versioned interpretation. | `longitudinal_storage` |
| `sensitive_opt_in` | Signal requires explicit future consent policy before storage. | `opt_in_sensitive_storage` |
| `ephemeral` | Signal describes a temporary state and must not be frozen as a stable trait. | `session_only` |
| `blocked` | Signal is blocked from profile contribution. | `blocked_storage` |

## Retention Categories

- `no_profile_storage`: no profile memory write.
- `summary_storage`: non-longitudinal summary only.
- `longitudinal_storage`: versioned longitudinal profile storage for approved non-sensitive signals.
- `opt_in_sensitive_storage`: future explicit consent required before runtime storage.
- `session_only`: temporary state only.
- `blocked_storage`: no storage path is allowed.

## Disclaimer Categories

- `none`: no additional disclaimer required.
- `informational`: general interpretation boundary.
- `sensitive_result`: sensitive but non-clinical interpretation boundary.
- `mental_health`: non-diagnostic mental-health boundary.
- `ability_estimate`: ability-estimate boundary; no human-worth claim.
- `workplace_context`: workplace-context boundary.
- `relationship_context`: relationship-context boundary.
- `minor_protection`: minor-protection boundary.

## Locked Rules

- `mental_health_sensitive` cannot default to `longitudinal`.
- `mental_health_sensitive` defaults to `recommendation_eligible = not_eligible`.
- `ability_sensitive` cannot claim human worth, employment suitability, or hiring suitability.
- `emotional_state` signals default to `ephemeral` or `sensitive_opt_in`.
- `sensitive_opt_in` requires explicit future consent policy before runtime storage.
- `blocked` means no profile contribution.
- First-batch scale profile contribution remains bound to the approved UASP v1 manual decision.

## First Batch Binding

| Scale | Sensitivity | Profile contribution | Retention | Disclaimer |
| --- | --- | --- | --- | --- |
| `MBTI` | `normal` | `longitudinal` | `longitudinal_storage` | `informational` |
| `BIG5_OCEAN` | `normal` | `longitudinal` | `longitudinal_storage` | `informational` |
| `RIASEC` | `normal` | `longitudinal` | `longitudinal_storage` | `informational` |
| `ENNEAGRAM` | `sensitive` | `summary_only` | `summary_storage` | `sensitive_result` |

## Protected Examples

SDS / Clinical examples remain blocked or opt-in only. They are not first-batch scales, are not onboarded, and do not gain runtime storage from this policy.

IQ / Raven examples remain ability-sensitive examples only. They are not first-batch scales and cannot evaluate human worth or employment suitability.

## No Runtime Change Statement

This PR does not implement profile memory, persist sensitive signals, change auth/user model, change attempt storage, change privacy runtime, change report access, or change recommendation runtime.
