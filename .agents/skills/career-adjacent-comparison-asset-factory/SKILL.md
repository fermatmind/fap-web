---
name: career-adjacent-comparison-asset-factory
description: FermatMind adjacent career comparison content-asset workflow for related occupations, transfer paths, differences, and switching boundaries. Use when Codex needs to create, audit, repair, or freeze adjacent-career assets.
---

# Career Adjacent Comparison Asset Factory

Use this skill for adjacent occupations and transfer-path comparison.

Pipeline:

`manifest -> adjacent evidence -> evidence audit -> trust audit -> adjacent synthesis -> synthesis audit -> adjacent asset -> asset audit -> freeze`.

This block inherits the shared factory contract but must use stricter proxy defenses than most blocks. Adjacent comparison cannot be driven by title similarity, salary similarity, or broad family alone.

## Non-Negotiable Rules

- Depend on PASS identity and work-activities blocks for both the source career and compared careers.
- Do not use salary similarity or title similarity alone to define adjacency.
- Distinguish adjacent, broader aggregate, narrower specialization, and unrelated title collision.
- Do not promise easy transitions or guaranteed mobility.
- Every comparison row must have a reason, shared skills, key difference, and transfer boundary.
- Each adjacent recommendation must trace to work-activities and skills evidence for both roles.
- If evidence cannot separate duties and transfer cost, mark the comparison `REPAIR_REQUIRED`.

## Outputs

- adjacent career set
- comparison table
- transferability notes
- key differences
- switching risks and prerequisites

## Required References

Read:

1. `references/source_rules.md`
2. `references/trust_rules.md`
3. `references/writing_rules.md`
4. `references/quality_gates.md`
5. `../career-content-asset-factory/references/shared_pipeline_contract.md`
6. `../career-content-asset-factory/references/shared_gate_rules.md`
7. `../career-content-asset-factory/references/shared_editorial_quality_gate.md`
