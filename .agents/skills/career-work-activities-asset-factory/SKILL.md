---
name: career-work-activities-asset-factory
description: FermatMind career work-activities content-asset workflow for responsibilities, tasks, tools, stakeholders, work settings, and environment. Use when Codex needs to create, audit, repair, or freeze career work-content ledgers.
---

# Career Work Activities Asset Factory

Use this skill for the work-content block. It describes what people in the occupation actually do and where the work happens.

Pipeline:

`manifest -> work evidence -> evidence audit -> trust audit -> work synthesis -> synthesis audit -> work asset -> asset audit -> freeze`.

This block is the preferred next production line after salary and AI Impact. It inherits the shared factory contract and should use the AI Impact v5 lesson that engineering PASS is not enough: every work row needs workflow specificity, tool/context evidence, template-reuse checks, and final independent QA before staging preview.

## Non-Negotiable Rules

- Depend on a PASS identity boundary before describing tasks.
- Use O*NET tasks/work activities, BLS OOH, national career profiles, employer/industry profiles, and credible role descriptions.
- Separate task, tool, stakeholder, setting, schedule, and environment facts.
- Do not render SEO search metadata, target queries, or internal intent labels as work context.
- Do not add generic filler like “communicates with stakeholders” unless the source and occupation context make it specific.
- If a source is adjacent, state the adjacent boundary in evidence and synthesis.
- Do not collapse tasks, tools, stakeholders, settings, and environment into one generic paragraph.
- If evidence is broad-family only, reopen evidence rather than producing template work prose.

## Outputs

- core responsibilities
- task clusters
- tools and systems
- stakeholders
- typical settings
- work rhythm and environment tolerance

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
