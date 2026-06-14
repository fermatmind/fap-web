# Codex Validation Handoff Prompt

Validate a public profile content package before import or render handoff.

## Required Inputs

- content package JSON
- source ledger JSON
- model output ledger JSON
- framework asset map
- target launch state

## Required Checks

- JSON Schema validation
- source/evidence QA
- bilingual parity
- private-result boundary
- framework no-go
- indexability gate
- duplicate risk

## Output

Return a validation report with pass/fail status, blockers, and next PR recommendation.
