# SCIENCE-CONTENTPAGE-CLAIM-GATE-01

Mode: contract and QA gate only.

This gate defines claim boundaries for science, methodology, reliability, data, and misconception ContentPage drafts before any CMS import, publication, schema exposure, footer link, sitemap entry, llms entry, or social distribution.

## Decision

CONDITIONAL. Science content page drafts may continue as non-public draft assets only when claim review blocks medical diagnosis, career guarantee, official endorsement, competitor imitation, and unsupported proof claims.

## Source Assets

| Source | Role |
|---|---|
| `docs/seo/science-contentpage-route-authority-scan-01.md` | Route and authority scan |
| fap-api `backend/docs/seo/science-contentpage-cms-field-mapping-01.md` | Backend field-mapping scan |
| `docs/claims/semantic-claim-scanner-baseline.md` | Existing claim scanner baseline |
| `docs/claims/seo-geo-llms-claim-guards.md` | SEO/GEO exposure claim boundary |

## Candidate Public Routes

The only canonical route candidates covered by this gate are:

| Route | Status |
|---|---|
| `/science` | draft-only until CMS review and publication approval |
| `/item-design-notes` | draft-only until CMS review and publication approval |
| `/reliability-validity` | draft-only until CMS review and publication approval |
| `/data-privacy` | draft-only until CMS review and publication approval |
| `/common-misconceptions` | draft-only until CMS review and publication approval |
| `/method-boundaries` | existing authority, revision workflow only |

Private, tokenized, payment, order, result, share, history, and user-specific routes are forbidden in source links, CTA slots, FAQ answers, examples, or proof references.

## Claim Blocks

| Claim area | Status | Gate |
|---|---|---|
| Medical or clinical diagnosis | forbidden | Must not state or imply diagnostic use, treatment advice, crisis handling, or clinical equivalence. |
| Career outcome guarantee | forbidden | Must not promise hiring, best job, salary, promotion, school admission, or success outcomes. |
| Official endorsement | forbidden | Must not imply certification, partnership, authorization, or endorsement by test publishers, charities, platforms, employers, or institutions unless verified and approved. |
| Competitor imitation or attack | forbidden | Must not copy competitor structures or frame pages as competitor attack content. |
| Unsupported proof or certainty | forbidden | Must not claim exact accuracy, scientific proof, stable prediction, or evidence strength when data is Unknown or under review. |
| Item bank leakage | forbidden | Must not expose proprietary item wording, scoring keys, answer patterns, or security-sensitive test internals. |
| Data/privacy overclaim | forbidden | Must not promise deletion/export/storage behavior beyond policy and backend capability. |

## Allowed Boundary Language Class

Allowed content remains conceptual and bounded:

- method limits;
- non-diagnostic explanation;
- evidence level notes;
- draft review state;
- Unknown preserved as Unknown;
- visible source or evidence alignment requirements;
- public canonical route references only.

This document intentionally does not provide publishable page copy, H1, meta, CTA, FAQ text, advertising copy, or social copy.

## Review Requirements

- GPT owner may prepare request-card inputs only.
- Codex QA must validate the JSON gate and focused contract.
- Operator approval is required before CMS import or publication.
- `publish_allowed` remains false.
- FAQ schema, sitemap, llms, footer, and social distribution remain blocked until later gates.

## Non-Runtime Guarantees

No runtime route behavior, CMS data, sitemap, llms, schema, metadata, canonical, footer, header, tracking, paid ads, payment, result, order, share, or deployment behavior is changed by this PR.
