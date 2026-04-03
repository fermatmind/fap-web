# Homepage Redesign Spec

## Goal
Rebuild the FermatMind homepage so it combines premium product order, efficient test discovery, and SEO-safe information architecture without introducing fake trust or crawler-only content.

## Visual Thesis
Calm-premium and evidence-led: deep ink surfaces, disciplined grid structure, generous spacing, and one strong visual anchor that feels analytical rather than theatrical.

## Homepage Narrative
The homepage must answer four questions within three seconds:
1. What is FermatMind?
2. Who is it for?
3. Where should I start?
4. Why is it trustworthy?

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
- Use a single dominant visual plane: structured report geometry plus guided entry points, not a dashboard collage.
- Keep CTA count to two.
- Add a compact trust rail directly in the hero.
- Keep the first screen readable in one glance on desktop and mobile.
- Avoid left-copy/right-generic-card SaaS composition; the hero should feel like one integrated surface.

## Quick-Start Strategy
- Organize by user question, not by test inventory.
- Expose the highest-intent paths first:
  - career direction
  - personality structure
  - current emotional state
  - collaboration and relationship style
  - choosing the right assessment
- Each path must include a short explanation and one clear start action.
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

The family section should scan like a curated product map, not a dense directory wall.

## Trust / Methodology Strategy
- Present trust as readable product discipline, not badge theater.
- Use accessible disclosure/accordion rows for:
  - methodology basis
  - result boundaries
  - privacy and anonymity
  - usage scenarios
  - ongoing research / professional background
- Keep the collapsed summary useful by itself.
- Expanded content must be visible, keyboard reachable, and meaningful to users.

## Resources Strategy
- Show only the most important 3-4 resources on the homepage.
- Treat resources as a support layer that deepens understanding and strengthens discoverability.
- Prefer resource types that already exist in the repo: articles, topics, career guides, help pages.

## Footer Strategy
- Footer must be navigational, not a keyword farm.
- Organize around real user tasks:
  - top tests
  - test categories
  - resources
  - support and policies
- Keep anchor text natural and route-backed.
- Preserve access to privacy, terms, refund, help, and contact surfaces.

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
