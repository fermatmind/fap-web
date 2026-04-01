# MBTI Desktop Compatibility Fields (Deprecated Transition)

## Scope
This document clarifies compatibility semantics for six legacy desktop-clone fields:
- `career.career_ideas`
- `career.work_styles`
- `growth.what_energizes`
- `growth.what_drains`
- `relationships.superpowers`
- `relationships.pitfalls`

Out of scope remains unchanged:
- Big5
- mobile
- AI illustration
- runtime personalization
- owner/schema refactor
- purchase/unlock logic
- shell redesign

## Current desktop render status
### Canonical desktop main flow (rendered)
- Career:
  - `strengths`
  - `weaknesses`
  - `matched_jobs`
  - `matched_guides`
- Growth:
  - `strengths`
  - `weaknesses`
- Relationships:
  - `strengths`
  - `weaknesses`

### Compatibility layer only (not rendered in main flow)
- `career_ideas`
- `work_styles`
- `what_energizes`
- `what_drains`
- `superpowers`
- `pitfalls`

These fields are still parsed/kept for contract compatibility and transition safety, but they are no longer default rendered modules in current desktop main flow.

## Data ownership boundary
### Storage content (authoritative in API contract)
From `fap-api` published desktop-clone contract:
- `content.hero.*`
- `content.intro.*`
- `content.letters_intro`
- `content.overview`
- `content.traits.*`
- `content.chapters.*` (including compatibility-retained fields)
- `content.finalOffer.*`
- `asset_slots`

### Runtime (unchanged)
- fullCode/baseCode runtime truth
- display title and dimension bars
- rail/actions/tools wiring
- unlock/checkout flow
- runtime price and CTA state

## Contract coverage intent
- Adapter contract keeps compatibility parsing for these fields.
- Resolver contract keeps compatibility holding behavior.
- Render contract ensures converged desktop flow does not display these fields.
