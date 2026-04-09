# Career Batch Production SOP

## Purpose

This SOP defines the Codex-side operating procedure for Career batch production in `fap-web`.
It exists to keep draft assistance, review, and release handoff disciplined while preserving the authority boundary:

- Codex may draft structure, alias candidates, and editorial placeholders.
- Codex drafts, backend computes truth.
- Laravel and other authority-layer backend pipelines remain the source of truth for truth, score, trust, and claim computation.
- First-wave frozen artifacts are reference-only and must not be treated as editable batch draft inputs.

## Operating Principles

1. Codex only drafts allowed sections and must stay within editorial and structural boundaries.
2. Backend authority owns computed truth, derived scores, trust compilation, eligibility, and public claims.
3. Batch production must preserve the distinction between recommendation pages and job pages. No flattening across page classes is allowed.
4. Frozen first-wave launch artifacts may inform review, but they must not be copied forward as mutable inputs for a new batch.
5. Any schema mismatch, unauthorized truth field, or invented claim is a hard stop for review and publish.

## Phase 1: Raw Truth Seed

Collect the raw occupation seed from approved authority inputs and release artifacts.

- Use approved seed inputs, manifests, and crosswalk sources as read-only upstream material.
- Treat truth-seed payloads as source material to be bound into the gold schema, not as editorial output.
- Do not let Codex invent factual coverage where the raw truth seed is missing or ambiguous.

## Phase 2: Ontology Bind

Bind each occupation to the approved occupation ontology and batch scope.

- Confirm slug, occupation identity, family, and ontology anchors before drafting begins.
- Alias exploration may produce candidate labels, but ontology ownership does not move to Codex.
- Recommendation ontology and job ontology must remain distinct. Do not flatten recommendation assets into job-detail semantics or vice versa.

## Phase 3: Gold Schema Clone

Clone the approved gold schema shape for the batch output.

- Start from the current approved schema contract and field layout.
- Preserve required and forbidden field boundaries exactly.
- Structural drafting is allowed only inside approved editorial sections.
- No new truth, score, trust, or claim fields may be introduced on the Codex side.

## Phase 4: Codex Draft Pass

Generate the draftable portions of the asset package.

- Allowed: structure scaffolding, alias candidates, editorial placeholders, reviewer notes, and clearly marked draft copy.
- Not allowed: computed truth, derived scores, trust labels, ranking claims, eligibility guarantees, or factual assertions that belong to backend computation.
- Every drafted section must remain replaceable by backend-authoritative values without schema reshaping.

## Phase 5: Engine Compute Pass

Run the backend authority computation pass after Codex drafting.

- Laravel and the authority layer compute truth, scores, trust, and claim-bearing fields.
- Backend-owned outputs must overwrite draft placeholders where the schema defines computed values.
- If backend compute is unavailable, incomplete, or contradictory, stop the batch instead of patching around it in frontend docs or draft content.

## Phase 6: Crosswalk Validation Pass

Validate batch outputs against the approved crosswalks and schema boundaries.

- Confirm ontology bindings, aliases, and crosswalk coverage map to the approved occupation targets.
- Reject schema drift, missing required fields, forbidden fields, or page-class flattening.
- First-wave frozen artifacts may be used as comparison baselines only. They are not editable batch inputs.

## Phase 7: Trust Compile Pass

Compile trust-bearing output from backend-authoritative computation only.

- Trust, confidence, score, and claim-bearing summaries must come from backend-authoritative logic.
- Codex may prepare placeholders for presentation structure, but must not author final truth-bearing language.
- If trust compilation changes the allowed public assertions, review must happen against the backend-authored output.

## Phase 8: Review & Publish Gate

Hold release until governance review passes.

- Review against the batch checklist before publish or handoff.
- Confirm the final payload honors schema integrity, truth boundaries, page-class separation, and frozen first-wave protections.
- Publish only after backend-authoritative outputs are present for all truth-bearing sections.
- If any review item fails, stop and return the batch for correction rather than shipping partial governance compliance.

## Review Handoff Notes

- `fap-web` owns the Codex-facing SOP and review checklist.
- Backend repositories remain the authority layer for computed truth behavior.
- This SOP governs batch drafting and review. It does not authorize runtime rendering changes, route behavior changes, or backend source-of-truth substitution.
