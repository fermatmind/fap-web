# Codex Skeptical Self-Review Prompt

Review the Codex-native draft as if it came from an external model.

Do not relax standards because Codex generated it.

Check:

- valid JSON
- exact canonical paths
- robots and indexability fields
- absence of forbidden boolean fields
- required keys
- `sections` array shape
- lowercase `faq` array shape
- Big Five dimensional language
- no official 32 type claim
- no clinical, hiring, therapy, deterministic career, intelligence, score, or result claims
- no private result leakage
- source evidence IDs only from the source ledger
- competitor copy risk
- bilingual parity

Report critical, major, and minor violations separately. Batch readiness can be GO only when raw or repaired output has zero critical contract violations and final packages pass QA.
