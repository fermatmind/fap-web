# MBTI Desktop Clone Asset Slot Consumption Cutover

## Authoritative owner
- `fap-api` is the authoritative owner for MBTI desktop clone copy (`content`) and asset references (`asset_slots`).
- Public read contract remains: `GET /api/v0.5/personality/{fullCodeSlug}/desktop-clone?locale=zh-CN`.
- `fap-web` now consumes both storage copy and storage asset slots from the same payload.

## Runtime boundary (unchanged)
- Runtime still owns: fullCode/baseCode runtime truth, display title, bars/dimensions, actions, unlock/purchase, runtime price.
- Storage owner now provides:
  - `content` (hero/intro/traits/chapter/finalOffer copy)
  - `asset_slots` (7 canonical slot refs)
- Placeholder rendering is retained as a fallback path when slot ref is missing/invalid.

## Canonical asset slots
- `hero-illustration`
- `traits-illustration`
- `traits-summary-illustration`
- `career-illustration`
- `growth-illustration`
- `relationships-illustration`
- `final-offer-illustration`

Consumption is keyed by `slot_id` and never by array index.

## Status behavior
- `ready`: render real asset when `asset_ref` resolves to URL/path.
- `placeholder`: render existing placeholder visual block.
- `disabled`: do not render real asset; keep layout stable with fallback visual shell.
- `ready` + invalid `asset_ref`: downgrade to placeholder path (no UI exception).

## Consumer architecture
- Adapter: `/Users/rainie/Desktop/GitHub/fap-web/lib/cms/personality-desktop-clone.ts`
  - validates canonical payload (incl. 7-slot shape)
  - normalizes snake_case contract (`slot_id/aspect_ratio/asset_ref`)
  - keeps legacy camelCase compatibility for transition safety
- Slot mapper: `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/mbtiDesktopClone.assets.ts`
  - `indexAssetSlotsById(assetSlots)`
  - `getCloneAssetSlot(assetSlots, slotId)`
- Unified renderer: `/Users/rainie/Desktop/GitHub/fap-web/components/result/mbti/clone/MbtiCloneAssetSlot.tsx`
  - single ready/placeholder/disabled decision path
  - safe fallback on broken refs

## Current rollout notes
- Local/contract verification in this PR uses mockable payload scenarios for:
  - `INFJ-A` ready asset case
  - `ENTJ-T` ready asset case
  - fallback case (storage miss / disabled)
- Production ready-slot coverage depends on backend published data rollout.

## Next steps
1. Expand ready-slot coverage by updating backend owner data only (no schema change).
2. Add non-zh coverage once backend locale content/assets are published.
3. Decide mobile/Big5 parity in separate PRs (out of scope here).
