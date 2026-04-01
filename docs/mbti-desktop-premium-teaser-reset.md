# MBTI Desktop Premium Teaser Reset

## Goal
This PR resets the chapter-end premium teaser structure for MBTI desktop clone to match the 16P-style role:

1. main chapter canonical blocks end first
2. two chapter-end premium teaser blocks render next
3. each teaser is title + blurred content area + centered unified lock card overlay
4. then flow continues to the next chapter (or Final Offer)

## Compatibility fields used as teaser sources
These six fields are still compatibility-retained in API contract and are now rendered only in chapter-end teaser blocks:

- `chapters.career.careerIdeas`
- `chapters.career.workStyles`
- `chapters.growth.whatEnergizes`
- `chapters.growth.whatDrains`
- `chapters.relationships.superpowers`
- `chapters.relationships.pitfalls`

Priority for teaser item data:

1. compatibility field items
2. fallback mapping from chapter locked block blurred items

No hardcoded teaser item source is introduced.

## Removed floating unlock-card titles
The following floating unlock-card titles are removed from the chapter-end UI:

- Career: `解锁岗位簇` / `解锁工作方式`
- Growth: `解锁补能条件` / `解锁耗损模式`
- Relationships: `解锁关系优势` / `解锁关系盲点`

They are replaced by chapter content titles while keeping a unified centered lock overlay.

## Chapter-end teaser titles after reset

### Career
- `你可能会喜欢的职业选择`
- `适合你的工作方式`

### Growth
- `什么能让你充满活力？`
- `什么让你精力力竭？`

### Relationships
- `你的人际关系优势`
- `人际关系陷阱`

## Positioning rules enforced
- teaser blocks are rendered after `Strengths / Weaknesses` (and after `matched_jobs / matched_guides` for Career)
- teaser blocks stay inside their own chapter section
- chapter-end spacing remains stable before the next section
- no detached floating unlock card remains as a separate role from teaser content

## Explicitly unchanged
- ResultClient / RichResultReport integration
- Big5 and mobile surfaces
- Hero / Rail / Final Offer structure and purchase behavior
- payment / unlock backend logic
- asset slot consumption logic
- backend owner and API contract
- runtime personalization scope

## Next step
After chapter-end teaser structure is stable, runtime personalization can be evaluated independently without further teaser-role reshaping.

## Screenshots
- `docs/pr-assets/mbti-desktop-career-teaser-reset.png`
- `docs/pr-assets/mbti-desktop-growth-teaser-reset.png`
- `docs/pr-assets/mbti-desktop-relationships-teaser-reset.png`
