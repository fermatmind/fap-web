# CMS Content Package QA

Purpose: decide whether a content package can enter preview flow.

Required files or sections:

- `manifest.json`.
- `SEO_BRIEF`.
- frontmatter.
- `claim_gate.md`.
- `operator_review.md`.
- `codex_handoff.md`.
- `CMS_FIELDS`.
- `CMS_IMPORT_DRAFT`.
- `DYNAMIC_CTA_CONTRACT`.
- `INTERNAL_LINK_PLAN`.
- `HREFLANG_ROUTING_TREE_CONTRACT`.
- `CANONICAL_PLAN`.
- `SCHEMA_ELIGIBILITY_PLAN`.
- `PRIVATE_URL_GUARD`.

Checks:

1. File tree complete.
2. Slug, locale, and translation group consistent.
3. Canonical and hreflang plan are explicit.
4. Claims have references and boundary notes.
5. FAQ and CTA are explicit and safe.
6. Private URL guard is present.
7. Schema eligibility is not automatic enablement.
8. CMS fields can map to known backend fields.

Decision:

- `GO_FOR_PREVIEW` only when all required evidence exists and no blocker remains.
- `NO_GO_FOR_PREVIEW` when any blocker, missing field, unsafe claim, private URL, or authority drift exists.

Outputs:

- `CONTENT_PACKAGE_INTEGRITY_REPORT.md`.
- `CODEX_QA_<slug>.md`.
- `CMS_IMPORT_READY_REPORT.md`.

No-go: no import, no CMS write, no publish.
