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
10. `package_frozen`
11. `independent_qa_pass`
12. `dry_run_ready`
13. `draft_imported`
14. `readback_pass`
15. `published`
16. `live_qa_pass`

## Advancement Rules

- A state may advance only when the previous gate report exists and has an accepted PASS verdict.
- `baseline_frozen` requires archived artifacts plus a SHA-256 manifest.
- V2 promotion proceeds only through trusted backend dispatch after independent QA; the exact artifact SHA is integrity and rollback evidence, not an approval credential.
- A failed state must write `open_failures.json` before a same-scope repair or recovery goal is suggested.
- No downstream block may treat an upstream block as trusted until the upstream block is frozen or final repaired with SHA.

## Stop Conditions

Stop only with a named machine-gate, authority, direct-action, or separately controlled-scope classification. Do not convert missing baselines, failed audits, repair exhaustion, or direct-import attempts into an approval-only transition.
