# Career Batch Review Checklist

Use this checklist before approving any Career batch artifact prepared with Codex assistance.

## 1. Schema Integrity

- Confirm the batch output still matches the approved gold schema shape.
- Confirm required sections are present and forbidden sections remain absent.
- Fail review on schema drift, renamed contract fields, or structural flattening.

## 2. Required And Forbidden Fields

- Verify all required fields for the approved asset type are populated from the correct source.
- Verify unauthorized truth, score, trust, claim, or ranking fields were not added by Codex.
- Verify placeholder fields remain inside approved editorial-only sections.

## 3. Alias Scope

- Confirm aliases are limited to candidate alias scope and are clearly reviewable.
- Confirm aliases do not mutate occupation identity, ontology binding, or public truth claims.
- Confirm aliases do not expand first-wave frozen artifacts into editable draft inputs.

## 4. Editorial-Only Boundaries

- Confirm Codex work stays inside structure drafting, alias candidates, editorial placeholders, and reviewer-facing notes.
- Confirm the batch explicitly follows the rule: Codex drafts, backend computes truth.
- Confirm Laravel and the authority layer remain the source of truth for truth, score, trust, and claim fields.

## 5. First-Wave Boundary Protection

- Confirm first-wave frozen artifacts are treated as frozen reference artifacts only.
- Confirm no first-wave frozen artifact is used as an editable batch draft input.
- Confirm frozen first-wave launch outputs are not polluted by new draft-only batch material.

## 6. No Truth Invention

- Confirm Codex did not invent facts, truth fields, authority values, or backend-owned conclusions.
- Confirm missing truth data is escalated as a stop condition instead of patched with editorial guesses.

## 7. No Claim Invention

- Confirm Codex did not add new claim-bearing copy that implies backend authority.
- Confirm public claims remain constrained to backend-authored or backend-approved outputs.

## 8. No Score Invention

- Confirm Codex did not generate, estimate, or interpolate scores, confidence values, trust bands, or ranking outputs.
- Confirm score-bearing sections are sourced from backend computation only.

## 9. Recommendation And Job Boundary

- Confirm recommendation pages were not flattened into job pages.
- Confirm job pages were not rewritten into recommendation-style generic output.
- Confirm page-class separation remains intact across schema, copy, and review notes.

## 10. Release Handoff Readiness

- Confirm crosswalk validation completed without unresolved drift.
- Confirm backend-computed truth-bearing fields are present for publish-ready payloads.
- Confirm the batch is ready for release handoff without requiring frontend runtime changes or backend truth substitution.
