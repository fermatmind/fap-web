# Block Factory Contract

A block factory owns one content block and must obey the shared orchestrator state machine.

## Required Block Outputs

- manifest and validation
- evidence ledger and evidence audit
- synthesis or estimate ledger and audit
- reader asset ledger and audit
- optional candidate ledgers such as `search_projection.jsonl`
- freeze report and SHA manifest
- final independent QA and repair reports

## Required Block Responsibilities

- Define source rules.
- Define trust rules.
- Define block-specific editorial/competitive quality gates.
- Preserve slug, locale, seed ordinal, official codes, source URLs, source IDs, and derivation hashes unless an explicit reopen process is approved.
- Return verdicts only through gate artifacts.

## Disallowed Responsibilities

- Production import.
- Runtime SEO release.
- Frontend fallback content.
- Page assembly fact creation.
- Declaring another block ready.
