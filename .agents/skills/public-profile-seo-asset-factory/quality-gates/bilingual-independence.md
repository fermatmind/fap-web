# Bilingual Independence

## Required

- zh-CN and en have matching asset coverage.
- Claims and method boundaries are aligned.
- Examples may be locale-specific.
- Final copy is independently written from the shared approved claim map, not raw machine translation or one locale copied into the other.
- Each locale has its own draft, evidence mapping, QA result, and `pending_manual_review` state.
- Model or agent review of one or both locales does not count as human review.

## Fail

Fail if one locale is missing, materially weaker, mechanically translated, missing its own evidence/QA record, or represented as human-reviewed by model output.
