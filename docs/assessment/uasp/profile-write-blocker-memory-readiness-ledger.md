# UASP Profile Write Blocker & Memory Readiness Ledger v1

Scope: PR-UASP2B-06

Train: uasp-runtime-metadata-integration-train

Runtime behavior changed: no

## Purpose

This ledger makes `profile_contribution` enforceable as a blocker/readiness field for Phase 2B. It prevents UASP metadata from writing long-term profile memory, storing sensitive signals, or promoting existing history/preference infrastructure into UASP-governed memory.

This PR is ledger/blocker only. It does not change profile runtime, write memory, change saved careers, change attempts, change auth/user model, change privacy runtime, change report history, or enable sensitive storage.

## Runtime Storage Boundary

`profile_contribution` is metadata and readiness policy only in Phase 2B. First-batch mappings can say `longitudinal` or `summary_only`, but runtime profile writes remain blocked until consent, retention, deletion, DSAR, versioned interpretation, and sensitivity policy are implemented and approved.

## Blocker Rules

- No UASP profile persistence.
- No sensitive signal storage.
- No saved careers to UASP profile memory promotion.
- No `/me/attempts` to UASP profile promotion.
- No MBTI longitudinal memory generalization.
- `mental_health_sensitive` signals cannot default to `longitudinal`.
- `ability_sensitive` signals cannot evaluate human worth, employment suitability, or hiring suitability.
- `emotional_state` signals default to `ephemeral` or `sensitive_opt_in`.
- `sensitive_opt_in` requires future explicit consent policy before runtime storage.
- `blocked` means no profile contribution.

## Existing Infrastructure Boundaries

| Surface | Current role | UASP boundary |
|---|---|---|
| `/v0.3/me/attempts` | Attempt/report history | Not UASP profile memory. |
| `MeProfileService` | Org/user/anonymous identity and roles | Does not return UASP signal profile fields. |
| Saved careers | Visitor-key preference store | Not UASP profile memory. |
| Memory services | Existing infrastructure | Not UASP-governed durable memory. |
| DSAR lifecycle | Existing user data lifecycle | Does not yet cover all UASP memory candidates. |
| Report history | Access/history surface | Not longitudinal signal memory. |
| Recommendation snapshots | Snapshot direction support | Not UASP profile memory. |

## Future Prerequisites Before Profile Writes

- Explicit human-approved profile product policy.
- Explicit consent model for sensitive and opt-in signals.
- Retention categories wired to runtime storage.
- Deletion and DSAR coverage for every future memory target.
- Versioned interpretation and re-interpretation policy.
- Sensitive-signal disclaimer and storage boundaries.
- Backend-owned profile memory contract.
- Frontend read-only rendering that cannot invent profile authority.

## Evidence

- UASP profile/sensitivity policy: `docs/assessment/uasp/generated/uasp-profile-sensitivity-policy.v1.json`
- UASP runtime integration report: `docs/assessment/uasp/generated/uasp-runtime-integration-readiness-report.v1.json`
- UASP signal registry: `docs/assessment/uasp/generated/existing-scale-signal-registry.v1.json`
- Backend attempt history service: `backend/app/Services/V0_3/Me/MeAttemptsService.php`
- Backend profile service: `backend/app/Services/V0_3/Me/MeProfileService.php`
- Backend DSAR lifecycle service: `backend/app/Services/Attempts/UserDataLifecycleService.php`
- Backend memory service: `backend/app/Services/Memory/MemoryService.php`
- Career saved preference controller: `backend/app/Http/Controllers/API/V0_5/Career/CareerShortlistController.php`

## No Runtime Change Statement

This PR adds profile write blocker and memory readiness ledger artifacts and tests only. It does not change profile runtime, write memory, change saved careers, change attempts, change auth/user model, change privacy runtime, change report history, change recommendation snapshots, or enable sensitive storage.
