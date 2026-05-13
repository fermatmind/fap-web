# RIASEC Trusted Result v1.5 Smoke Acceptance

Date: 2026-05-13

Status: Conditional GO for formal launch hardening. The acceptance gate verifies the frontend read paths and rendered contract boundaries that were added during the RIASEC Trusted Result v1.5 train and AH-01 through AH-04.

## Covered Paths

- Result read consumes `riasec.public_projection.v2`.
- Formal report read consumes the same projection contract and keeps `snapshot_bound` true in the view model.
- Report access exposes a snapshot-bound ready state for PDF availability.
- Share creation and share read preserve the RIASEC projection contract.
- PDF read uses the report PDF endpoint and RIASEC filename/form metadata.
- History read keeps compare disabled for cross-form raw-score changes.
- Technical Note reads the backend RIASEC Technical Note endpoint.
- Activity Explorer remains `content_examples_only` with `content_example_not_registry_match`.
- Feedback overlay remains observation-only and cannot mutate measured scores or Holland Code.

## Sidecars

- AH-02 and AH-03 fap-web checks had transient Big Five contract timeout on first run; reruns passed.
- AH-04 fap-api had pre-existing local career audit dirty work during implementation; staged and merged PR scope was isolated to RIASEC Activity Explorer and train metadata.

## Launch Assessment

Conditional GO:

- The Trusted Result v1.5 user-visible core is covered by frontend contract smoke tests.
- Career examples are examples only, not registry-backed claims.
- Technical Note route is open for RIASEC and remains backend-authored.
- No AI-generated formal report path is introduced.

Remaining follow-up:

- Run a deployed-environment smoke after backend and frontend deployment cutover.
- Keep real career registry matching out of this launch until reviewed source rows exist.
- Keep feedback overlay separate from measured results until a reviewed feedback event stream/read model is introduced.
