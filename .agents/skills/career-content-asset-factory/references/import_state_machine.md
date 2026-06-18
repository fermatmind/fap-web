# Career Content Import State Machine

Content production and public import are separate lanes.

Allowed states:

1. `dry_run`
2. `staging_preview`
3. `editorial_review`
4. `approved`
5. `production_imported`

Only `approved` content may transition to `production_imported`.

## Required Import Checks

- row count and slug count match the frozen baseline
- SHA-256 manifest matches approved artifact
- dry-run authority gate PASS
- staging preview write PASS
- API smoke PASS
- editorial QA PASS
- rollback plan present

Do not perform production import without explicit user approval naming the exact artifact SHA.

