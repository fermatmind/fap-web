---
name: career-identity-asset-factory
description: FermatMind career identity content-asset workflow for occupation definitions, official boundaries, title cleanup, aliases, and classification mappings. Use when Codex needs to create, audit, repair, or freeze career identity evidence, synthesis, or asset ledgers.
---

# Career Identity Asset Factory

Use this skill for the occupation identity block. It establishes what a career page is about before downstream blocks describe work, fit, entry paths, risks, adjacent careers, or page assembly.

Pipeline:

`manifest -> identity evidence -> evidence audit -> trust audit -> identity synthesis -> synthesis audit -> identity asset -> asset audit -> freeze`.

This block inherits the shared career content factory contract: `control_<previous> + new_50` batching, freeze before reuse, final independent QA, protected diff, and staging/import gates only after content PASS. Identity assets are upstream authority for other blocks, so their quality gate prioritizes official boundary accuracy over reader-prose polish.

## Non-Negotiable Rules

- Do not infer official occupation boundaries from a job title alone.
- Use official or authoritative classification sources first: O*NET, SOC, BLS, ESCO/ISCO, national occupational classification sources, and seed mappings.
- Preserve seed slug and canonical path. Title cleanup may add display titles but must not mutate slug identity.
- Distinguish exact occupation, aggregate occupation, adjacent occupation, alias, and local-market job title.
- Do not fabricate SOC/O*NET/ISCO/CIP codes or official definitions.
- If classification mapping is weak or ambiguous, mark the row `REPAIR_REQUIRED` or `BLOCKED`; do not smooth it over with generic wording.
- Do not use AI Impact, salary, fit, or adjacent-career signals to repair identity boundaries.
- Title cleanup must remove machine disambiguators and backend boundary phrases, but it must preserve the official mapping evidence.

## Outputs

- cleaned title and alias boundary
- official definition summary
- classification mapping and mapping quality
- inclusion/exclusion boundaries
- source list and review validity

## Required References

Read:

1. `references/source_rules.md`
2. `references/trust_rules.md`
3. `references/writing_rules.md`
4. `references/quality_gates.md`
5. `../career-content-asset-factory/references/shared_pipeline_contract.md`
6. `../career-content-asset-factory/references/shared_gate_rules.md`
7. `../career-content-asset-factory/references/shared_editorial_quality_gate.md`

## Scripts

Use the scripts in `scripts/` for the standard stages. They delegate shared orchestration to `career-content-asset-factory`; block-specific implementation must obey this skill's references.

## Shared Orchestrator Contract

This block inherits the shared orchestrator contract from `career-content-asset-factory`.

- The shared orchestrator owns global state, batch progression, freeze readiness, staging/import readiness, and next-goal planning.
- This block's source rules, trust rules, and block-specific gates remain authoritative for its own evidence, synthesis, and asset outputs.
- Staging, import, release, exact-SHA approval, post-import QA, and no-frontend-fallback rules are inherited from the shared orchestrator contract.
- Candidate `search_projection` or SEO/GEO/schema data must stay quarantined outside reader assets when this block produces it.
- This block must not self-declare PASS. PASS requires audited gate artifacts, frozen baseline outputs, and SHA manifests.
