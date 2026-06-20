---
name: career-skills-entry-asset-factory
description: FermatMind career skills and entry-path content-asset workflow for skills, knowledge, education, credentials, portfolio, internships, and preparation checklists. Use when Codex needs to create, audit, repair, or freeze career entry-path assets.
---

# Career Skills Entry Asset Factory

Use this skill for skills, knowledge, credentials, and entry-path preparation.

Pipeline:

`manifest -> skills evidence -> evidence audit -> trust audit -> skills synthesis -> synthesis audit -> skills asset -> asset audit -> freeze`.

This block inherits the shared factory contract and the shared skill-evidence usefulness standard. Preparation advice must become verifiable evidence a learner or career changer can build, not generic motivation.

## Non-Negotiable Rules

- Depend on PASS identity and work-activities blocks.
- Separate universal skills, occupation-specific tools, education, credentials, licenses, portfolio, and local hiring signals.
- Credential and licensing claims require region-specific sources and explicit boundaries.
- Do not guarantee admission, certification, hiring, salary, immigration, or promotion.
- If a path differs by country, state the country boundary or leave it out.
- Do not transform job-board preferences into formal requirements.
- Separate required credentials from helpful skills, common employer preferences, and optional portfolio signals.
- Do not invent local certificates, exam paths, or licensing rules to make a path feel complete.

## Outputs

- skill clusters
- knowledge areas
- tools/practice assets
- education and credential boundaries
- entry preparation checklist
- evidence-backed next steps

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
