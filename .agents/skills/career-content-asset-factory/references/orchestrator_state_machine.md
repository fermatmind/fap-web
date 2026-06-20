# Orchestrator State Machine

The orchestrator advances block assets through explicit states. It never infers readiness from a file existing alone.

## Content States

1. `not_started`
2. `manifest_ready`
3. `evidence_in_progress`
4. `evidence_pass`
5. `synthesis_pass`
6. `asset_pass`
7. `baseline_frozen`
8. `final_qa_pass`
9. `final_repaired_pass`
10. `staging_preview_ready`
11. `editorial_review_pass`
12. `approved`
13. `production_imported`
14. `post_import_qa_pass`

## Advancement Rules

- A state may advance only when the previous gate report exists and has an accepted PASS verdict.
- `baseline_frozen` requires archived artifacts plus a SHA-256 manifest.
- `production_imported` requires explicit human approval naming an exact artifact SHA.
- A failed state must write `open_failures.json` before any repair goal is suggested.
- No downstream block may treat an upstream block as trusted until the upstream block is frozen or final repaired with SHA.

## Stop Conditions

Stop on missing dependency, contaminated baseline, failed trust audit, failed quality gate after three repairs, missing authority, missing exact SHA approval, or any runtime/SEO scope drift.
