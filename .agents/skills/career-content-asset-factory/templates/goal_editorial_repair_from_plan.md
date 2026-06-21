# Goal: Repair Career Content From Editorial Repair Plan

Use `career-content-asset-factory`.

Input:
- `editorial_repair_plan.json`
- completed PASS block baselines referenced by affected rows

Task:
Repair only the selected reader-facing fields listed in the plan.

Hard prohibitions:
- Do not change source URLs, source IDs, evidence IDs, row hashes, seed identity, official codes, salary values, AI impact scores, or source lineage.
- Do not generate new facts.
- Do not modify frozen baseline in place; write repaired output to a new directory.
- Do not modify runtime, SEO, CMS, staging, or production.
- Do not activate search_projection.

After repair:
- rerun editorial quality audit
- produce protected diff report
- stop for human review
