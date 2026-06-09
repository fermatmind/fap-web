# SCIENCE-CONTENTPAGE-CLAIM-GATE-01

Mode: approved claim QA gate.

This gate defines claim boundaries for science, methodology, reliability, data, and misconception ContentPages after CMS/backend approval. The approved pages still must not include diagnostic, guarantee, endorsement, imitation, unsupported proof, item-bank leakage, or privacy-overclaim language.

## Decision

PASSED for the approved Research & Methods ContentPage set. Footer exposure is allowed after CMS/backend authority, while header, search submission, paid/community distribution, private-route references, and unsupported claims remain blocked.

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
| `/science` | approved CMS/backend authority |
| `/item-design-notes` | approved CMS/backend authority |
| `/reliability-validity` | approved CMS/backend authority |
| `/data-privacy` | approved CMS/backend authority |
| `/common-misconceptions` | approved CMS/backend authority |
| `/method-boundaries` | approved existing authority |

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
- approved review state;
- Unknown preserved as Unknown;
- visible source or evidence alignment requirements;
- public canonical route references only.

This document intentionally does not provide page body copy, H1, meta, CTA, advertising copy, or social copy. Public body copy remains CMS/backend-authoritative.

## Review Requirements

- Codex QA validates the JSON gate and focused contract.
- Operator approval has passed for the approved Research & Methods ContentPage set.
- `publish_allowed` is true for the approved CMS/backend records.
- FAQ schema may be eligible only from visible CMS FAQ items.
- Header, search submission, paid/community distribution, and private-route references remain blocked by later gates.

## Non-Runtime Guarantees

No private payment, result, order, share, tokenized route, tracking, paid ads, or deployment behavior is changed by this gate.
