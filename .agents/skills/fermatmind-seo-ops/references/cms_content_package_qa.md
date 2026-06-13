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
9. Social/cover image gate and body visual gate are checked separately.
10. Active import surfaces contain no unresolved Media Library visual placeholders, private URL examples, old aliases, or sensitive query keys.

Decision:

- `GO_FOR_PREVIEW` only when all required evidence exists and no blocker remains.
- `NO_GO_FOR_PREVIEW` when any blocker, missing field, unsafe claim, private URL, or authority drift exists.

Outputs:

- `CONTENT_PACKAGE_INTEGRITY_REPORT.md`.
- `CODEX_QA_<slug>.md`.
- `CMS_IMPORT_READY_REPORT.md`.

No-go: no import, no CMS write, no publish.

## V1.1 bilingual article pair additions

For a pair of new zh/en articles, require:

- shared article-pair manifest.
- one CMS draft payload per locale.
- shared `translation_group_id` plan.
- locale-specific canonical plan.
- hreflang hold plan unless both routes are explicitly ready.
- schema hold plan unless explicit schema gate is allowed.
- sitemap/llms hold plan unless explicit release is approved.
- social image metadata plan with public Media Library asset, alt, dimensions, and hero/og variants.
- Search Channel hold plan for every channel.
- generated report and content-package zip no-commit attestation.
- body visual status, verified body visual asset or operator-authorized fallback, and no unresolved active placeholder.

If the topic touches career resilience, layoffs, industry change, AI disruption, career security, employability, or future-proofing, run the V1.1 career resilience claim taxonomy from `claim_gate_playbook.md`.
