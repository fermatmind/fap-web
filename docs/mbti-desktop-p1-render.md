# MBTI Desktop P1 Render Integration

## Scope
This PR integrates P1 deep-content rendering on MBTI desktop clone (`zh-CN` only) for:
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

## Render status
### Now rendered (zh-CN desktop clone)
- Career:
  - `career_ideas`
  - `work_styles`
- Growth:
  - `what_energizes`
  - `what_drains`
- Relationships:
  - `superpowers`
  - `pitfalls`

### Still not rendered (intentional)
- runtime personalization blocks and selectors, including:
  - `selection_fingerprint`
  - `selection_evidence`
  - `same-type divergence`
  - `adaptive selection`
  - `memory/action journey`

## Data ownership boundary
### Storage content (authoritative)
From `fap-api` published desktop-clone contract:
- `content.hero.*`
- `content.intro.*`
- `content.letters_intro`
- `content.overview`
- `content.traits.*`
- `content.chapters.*` (including the 6 P1 modules above)
- `content.finalOffer.*`
- `asset_slots`

### Runtime (unchanged)
- fullCode/baseCode runtime truth
- display title and dimension bars
- rail/actions/tools wiring
- unlock/checkout flow
- runtime price and CTA state

## Fallback behavior
- `zh-CN`: render P1 modules when the module field exists.
- non-zh: do not render P1 modules and do not throw.
- single-module miss: hide only that module.
- no local authored-content fallback is re-enabled for runtime ownership.

## Implementation map
- Adapter parse:
  - `/Users/rainie/Desktop/GitHub/fap-web/lib/cms/personality-desktop-clone.ts`
- Slot/resolver extension:
  - `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/mbtiDesktopClone.slots.ts`
  - `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/mbtiDesktopClone.resolve.ts`
- P1 presentational blocks:
  - `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/MbtiCloneIdeaListBlock.tsx`
  - `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/MbtiCloneEnergyBlock.tsx`
  - `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/MbtiCloneRelationshipInsightBlock.tsx`
- Section placement:
  - `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/MbtiCloneNarrativeSection.tsx`
  - `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/MbtiDesktopCloneShell.tsx`

## Contract coverage
- Adapter contract:
  - `/Users/rainie/Desktop/GitHub/fap-web/tests/contracts/personality-desktop-clone-api.contract.test.ts`
- Storage cutover/resolver contract:
  - `/Users/rainie/Desktop/GitHub/fap-web/tests/contracts/mbti-desktop-storage-cutover.contract.test.ts`
- P1 render contract:
  - `/Users/rainie/Desktop/GitHub/fap-web/tests/contracts/mbti-desktop-p1-render.contract.test.tsx`
- Backward compatibility checks:
  - `/Users/rainie/Desktop/GitHub/fap-web/tests/contracts/mbti-desktop-p0-render.contract.test.tsx`
  - `/Users/rainie/Desktop/GitHub/fap-web/tests/contracts/mbti-desktop-shell-cta.contract.test.tsx`
  - `/Users/rainie/Desktop/GitHub/fap-web/tests/contracts/mbti-desktop-asset-slot-consumption.contract.test.tsx`

## Next PR
Next PR should focus on runtime personalization mounting on top of this content-complete desktop shell, not owner migration.
