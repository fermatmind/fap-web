# Evidence Container Readiness Gate

Version: `discoverability.evidence_container_readiness_gate.v1`

Scope: PR-DF-07

This gate defines how FermatMind checks whether a public page family is ready for Evidence Container work. It is a readiness contract only. It does not create new content, expand Topic Graph, add hidden FAQ/schema, change sitemap/llms exposure, or redesign runtime UI.

## Readiness Rule

A page family is Evidence Container ready only when visible HTML can support answer-engine absorption without relying on hidden schema or frontend-invented SEO truth.

Minimum requirements:

- A visible Quick Answer or equivalent primary answer.
- At least one non-FAQ evidence genre.
- A visible Caveat or Boundary block when the page can affect health, career, or identity decisions.
- Public canonical next steps only.
- FAQ JSON-LD, if present, must match visible FAQ text.
- No private flows in next steps, related links, llms summaries, or JSON-LD references.

## Block Taxonomy

Allowed visible block types:

- `quick_answer`
- `definition`
- `comparison`
- `how_to`
- `evidence_facts`
- `caveat`
- `faq`
- `next_step`
- `related_links`
- `last_reviewed`

FAQ-only pages are not Evidence Container ready. FAQ can support a page, but it cannot be the only evidence genre.

## Page-family Readiness

| Page family | Current readiness | Gate before expansion |
| --- | --- | --- |
| Test detail | partial | Add visible facts, caveat, and next step checks before GEO expansion. |
| Article detail | partial | Existing `answer_surface_v1` rendering can be gated for visible FAQ/schema alignment. |
| Topic detail | partial | Requires concept definition, comparison, and canonical related links before Topic Graph expansion. |
| Personality detail | partial | Requires type boundary and non-destiny caveat before personality graph expansion. |
| Career guide | partial | Requires visible how-to steps and career decision caveat. |
| Career job detail | not_ready | Must wait for performance, availability, indexability, sitemap, llms, and evidence gates. |
| Mental-health test | partial | Requires non-medical caveat and crisis/professional boundary. |

## Anti-patterns

- Hidden FAQ schema not reflected in visible HTML.
- FAQ-only GEO pages.
- Generic AI-written summaries without CMS/backend ownership.
- Next-step links to `/tests/*/take`, `/result/*`, `/orders/*`, `/share/*`, payment, or private history flows.
- Using JSON-LD to compensate for thin visible content.

## Validation

`tests/contracts/evidence-container-readiness-gate.contract.test.ts` validates this gate against the versioned fixture in `tests/contracts/fixtures/discoverability-foundation/evidence-container-readiness-gate.v1.json`.

PR-DF-07 intentionally stops at readiness validation. Rendering richer Evidence Containers for real page families belongs in later, page-family-specific PRs.
