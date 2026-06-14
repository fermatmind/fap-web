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
- raw ChatGPT critical violation count
- raw ChatGPT batch readiness decision
- raw Codex draft critical violation count
- raw Codex draft batch readiness decision
- source/evidence QA
- bilingual parity
- private-result boundary
- framework no-go
- indexability gate
- duplicate risk

## Output

Return a validation report with pass/fail status, blockers, and next PR recommendation.

## Batch Readiness Rule

Codex self-repair must not hide generator failure. GO for batch only when raw or repaired generator output has zero critical contract violations and final Codex packages pass all QA gates. If Codex has to repair canonical paths, robots, indexability flags, required keys, `sections` shape, or lowercase `faq`, report that repair separately and keep batch readiness PARTIAL or NO-GO unless a repaired generator output itself passes.
