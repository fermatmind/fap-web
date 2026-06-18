# Evidence Repair Prompt Template

Repair only the listed rows for the named content block.

Do not generate reader-facing assets.
Do not modify control rows.
Do not fabricate facts or source URLs.
Use only third-party, official, or otherwise verifiable sources accepted by the block skill.

Required output:

- repaired evidence JSONL
- validation JSON
- audit report
- protected-field diff report

