# Global Content QA

Required checks:

- Package matches schema.
- Asset identity matches selected framework/entity/code/locale.
- Sections are useful and not placeholder-only unless the run mode explicitly allows placeholders.
- FAQ is visible content and not hidden schema-only.
- Method boundary is present.
- Claims are mapped to source ledger or marked as inference.
- Enneagram Authority V2 claims map to the V2 ledger and page claim map; missing evidence fails closed.
- Unreviewed assets remain `pending_manual_review`; model review is not human review.
- Working revisions are isolated from the published primary and public revision pointer.
- Internal links are local, safe, and locale-correct.

Stop if content is mostly template substitution.
