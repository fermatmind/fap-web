---
name: career-page-assembly-asset-factory
description: FermatMind career page assembly workflow for composing PASS block assets into reader-safe career job pages, including FAQ, source disclosure, review validity, CTA ordering, and projection QA. Use when Codex needs to audit, assemble, repair, or freeze career page display assets.
---

# Career Page Assembly Asset Factory

Use this skill to compose independently PASS block assets into a page-ready career display surface. It must not invent missing facts.

Pipeline:

`manifest -> block dependency review -> assembly synthesis -> projection audit -> page asset -> editorial audit -> freeze`.

## Non-Negotiable Rules

- Use only PASS and frozen block assets.
- Do not create new occupational facts in the page assembly layer.
- If a required block is missing, show a bounded empty state or mark the row blocked; do not write fallback content.
- Preserve reader-safe projection: no raw enums, source IDs, internal lineage, unsupported salary claims, or hidden schema.
- Source and boundary disclosures should be concise by default and detailed only on expansion.
- Page CTA ordering must be product UI guidance, not occupational fact.

## Outputs

- page section order
- FAQ derived from PASS assets
- source disclosure
- review validity
- conversion CTA module
- projection/editorial audit report

## Required References

Read:

1. `references/source_rules.md`
2. `references/trust_rules.md`
3. `references/writing_rules.md`
4. `../career-content-asset-factory/references/shared_pipeline_contract.md`

