# Homepage Redesign Spec

## Goal
Rebuild the FermatMind homepage into a premium cognitive front door: immediately clear, easy to start, trustworthy, and naturally oriented toward `/tests` without turning the homepage into an inventory wall.

## Visual Thesis
Calm-premium and product-led: deep graphite surfaces, warm light support sections, disciplined spacing, and one strong visual anchor that feels like a result preview rather than a dashboard or concept object.

## Homepage Narrative
The homepage must answer four questions within three seconds:
1. What is FermatMind?
2. Who is it for?
3. Where should I start?
4. Why is it trustworthy?

Additional rule:
- The UI must never explain homepage strategy, IA rationale, SEO goals, or “why this block exists.” Those ideas belong in docs, not in user-facing copy.

Narrative order:
1. Immediate value statement and start path
2. Quick entry by user question
3. Broader assessment discoverability
4. How results help real decisions
5. Why the product can be trusted and where its boundaries are
6. Supporting resources and internal navigation
7. Final assessment-start CTA

## Section Order
1. Navbar with tests discoverability layer
2. Hero
3. Quick Start
4. Test Families
5. How Results Help
6. Methodology / Privacy / Trust
7. Resources Hub
8. Final CTA
9. Fat Footer

## Hero Strategy
- Keep the product unmistakable, but make the H1 a user-value sentence instead of a slogan-only treatment.
- Use a single dominant visual plane: abstracted report-preview geometry plus guided entry points, not a dashboard collage or a left-copy/right-generic-panel template.
- Keep CTA count to two.
- Add a compact trust rail directly in the hero.
- Keep the first screen readable in one glance on desktop and mobile.
- Hero should feel like one integrated product surface that previews both result structure and starting paths.

## Quick-Start Strategy
- Organize by user question, not by test inventory.
- Each card should contain only the question, one short explanation, and one entry action.
- Light “visual scent” is allowed through 2-3 real hints per card; no hover menu or second-level panel.
- Expose the highest-intent paths first:
  - career direction
  - personality structure
  - current emotional state
  - cognitive ability and strength
  - collaboration and relationship style
- Preserve SSR-visible copy so the block improves both user orientation and search comprehension.

## Test-Family Architecture
Each family must provide:
- family title
- one-line explanation
- 2-4 representative links
- one “explore all” action

Initial family set:
- Personality & trait structure
- Career & learning direction
- Emotional state & wellbeing
- Collaboration & relationship patterns
- Cognitive & ability signals

The family section should scan like a curated product map, not a dense directory wall or a second tests index.

## Results Preview Strategy
- Replace explanation-first value cards with abstracted sample report previews that show the shape of the product output.
- Keep previews generic and non-personalized.
- Pair those previews with only three short user-value lines:
  - see structure, not just labels
  - put results back into real contexts
  - use results to choose the next move

## Trust / Methodology Strategy
- Present trust as readable product discipline, not badge theater.
- Use accessible disclosure/accordion rows for:
  - methodology basis
  - result boundaries
  - privacy and anonymity
  - usage scenarios
- Keep the collapsed summary useful by itself.
- Expanded content must be visible, keyboard reachable, and meaningful to users.
- Compress trust to the fewest sections needed; do not let it become a whitepaper block.

## Resources Strategy
- Show only the most important 3 resources on the homepage.
- Treat resources as a support layer that deepens understanding and strengthens discoverability.
- Prefer resource types that already exist in the repo: articles, topics, career guides, help pages.
- Resource copy must stay user-facing; no “the homepage should only keep…” wording in the UI.

## Footer Strategy
- Footer must be navigational, not a keyword farm.
- Organize around real user tasks:
  - top tests
  - test categories
  - resources
  - support and policies
- Keep anchor text natural and route-backed.
- Preserve access to privacy, terms, refund, help, and contact surfaces.
- Never label a homepage footer block as “Homepage Navigation” or similar self-referential strategy language.

## Desktop Behavior
- Hero and Quick Start should feel like one continuous premium surface.
- Navbar discoverability should support broad scanning without a noisy mega-menu wall.
- Section spacing should remain large-span, typically 96px-160px between major beats.
- Footer should feel dense in utility, light in chrome.

## Mobile Behavior
- Keep the same core content as desktop.
- Recompose the hero into a vertically staged poster layout.
- Move discoverability into a mobile drawer with grouped entry points and visible hierarchy.
- Quick Start must remain highly scannable without horizontal overflow.
- Trust disclosures must stay readable and tap-friendly.

## Visual System Principles
- Reuse existing tokens where possible.
- Shift the homepage palette toward dark-ink premium with restrained warm accents.
- Use serif only as a controlled accent, not as the dominant reading face.
- Prefer panel rhythm, dividers, and layout structure over card piles.
- Remove console residue, fake telemetry, and decorative protocol language.

## Motion Budget
Allowed motion only:
- subtle hero entrance sequencing
- lightweight nav/discoverability reveal transitions
- disclosure expand/collapse feedback
- restrained hover elevation or underline movement

Motion constraints:
- no constant pulsing
- no scanline theatrics
- no ornamental looping background effects that dominate the page
- all non-essential motion disabled or reduced under `prefers-reduced-motion`
