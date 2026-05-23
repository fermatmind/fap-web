# MBTI Desktop First-Screen Convergence

## What changed

- Removed the desktop first-screen `lettersIntro` block so the five MBTI letter explanation cards no longer render under the hero.
- Removed the standalone `overview` white card that previously sat above `Personality Traits`.
- Moved the `overview.paragraphs` content source into the `Personality Traits` post-bars body slot.
- Replaced the old `traits.body` copy at that position instead of stacking both sources together.

## Why

- The previous desktop first screen had two extra layers on top of the 16P-style reading flow:
  - the five-card letter explanation grid
  - the standalone overview card
- Those layers made the first screen heavier than the intended cadence.
- The new order matches the tighter 16P rhythm more closely:
  - Hero
  - intro paragraphs
  - Personality Traits
  - bars + summary pane
  - overview-derived body copy
  - Career

## Source handling

- No new content source was introduced.
- No copy was hardcoded into the render layer.
- The traits follow-up body now prefers `overview.paragraphs`; it only falls back to the legacy `traits.body` source when overview content is unavailable.

## Explicitly unchanged

- Hero structure
- bars and summary pane
- Rail
- Career, Growth, Relationships chapter structure
- mobile
- Big5
- unlock / payment / offer flow
- backend contract

## Evidence

- Before screenshot: [`docs/pr-assets/mbti-desktop-first-screen-before.png`](<workspace>/fap-web/docs/pr-assets/mbti-desktop-first-screen-before.png)
- After screenshot: [`docs/pr-assets/mbti-desktop-first-screen-after.png`](<workspace>/fap-web/docs/pr-assets/mbti-desktop-first-screen-after.png)
