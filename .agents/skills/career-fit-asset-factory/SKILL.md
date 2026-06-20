---
name: career-fit-asset-factory
description: FermatMind career fit content-asset workflow for RIASEC, personality/work-style signals, fit checklists, and test-conversion decision copy. Use when Codex needs to create, audit, repair, or freeze career fit assets.
---

# Career Fit Asset Factory

Use this skill for fit signals and test-conversion content. It helps readers decide whether to validate fit with FermatMind tests, without making diagnosis or outcome claims.

Pipeline:

`manifest -> fit evidence -> evidence audit -> trust audit -> fit synthesis -> synthesis audit -> fit asset -> asset audit -> freeze`.

This block inherits the shared factory contract but must not copy AI Impact scoring logic. Fit assets support test conversion and self-reflection; they are not diagnostic, predictive, or destiny claims.

## Non-Negotiable Rules

- Depend on PASS identity and work-activities blocks.
- Use O*NET interests/work styles/work values, validated test frameworks, and bounded interpretation.
- Do not claim a test can decide career destiny, income, employment, success, mental health, or personal value.
- Treat MBTI and Big Five as supplementary work-style language, not occupational proof.
- Keep RIASEC as the primary career-interest fit signal.
- Reader-facing CTAs must be localized and must not look like official occupational facts.
- Fit copy must distinguish interest fit, work-style fit, values fit, and mismatch signals.
- Do not overfit a personality framework to an occupation when work evidence is weak.

## Outputs

- RIASEC fit interpretation
- work-style fit signals
- fit decision checklist
- mismatch/risk cues
- test action module copy

## Required References

Read:

1. `references/source_rules.md`
2. `references/trust_rules.md`
3. `references/writing_rules.md`
4. `references/quality_gates.md`
5. `../career-content-asset-factory/references/shared_pipeline_contract.md`
6. `../career-content-asset-factory/references/shared_gate_rules.md`
7. `../career-content-asset-factory/references/shared_editorial_quality_gate.md`

## Shared Orchestrator Contract

This block inherits the shared orchestrator contract from `career-content-asset-factory`.

- The shared orchestrator owns global state, batch progression, freeze readiness, staging/import readiness, and next-goal planning.
- This block's source rules, trust rules, and block-specific gates remain authoritative for its own evidence, synthesis, and asset outputs.
- Staging, import, release, exact-SHA approval, post-import QA, and no-frontend-fallback rules are inherited from the shared orchestrator contract.
- Candidate `search_projection` or SEO/GEO/schema data must stay quarantined outside reader assets when this block produces it.
- This block must not self-declare PASS. PASS requires audited gate artifacts, frozen baseline outputs, and SHA manifests.
