# FermatMind Design System

Status: V0 operating draft
Date: 2026-06-09
Owner: fap-web UI, CMS rendering, and public conversion surfaces

This document is the unified design-system entry point for FermatMind frontend work.
It consolidates the existing UX, homepage redesign, CMS authority, and release-gate documents into one working contract.

It is not a final visual taste board. It will not, by itself, produce the exact website direction the operator wants. That requires a separate taste-lock pass with references, screenshots, rejected examples, and production visual QA.

## Source Documents

Use this file first, then open the source document only when the PR needs deeper context.

| Source | Use when |
|---|---|
| `docs/homepage-redesign/spec.md` | Homepage narrative, hero, quick start, resources, footer, and motion intent. |
| `docs/homepage-redesign/plan.md` | Homepage implementation phases and rollback notes. |
| `docs/homepage-redesign/seo-constraints.md` | Homepage SEO and public-route constraints. |
| `docs/ux/fermatmind-ux-component-inventory.md` | File ownership, component inventory, backend seams, and UX risks. |
| `docs/ux/fermatmind-ux-conversion-surface-map.md` | Conversion surfaces, authority layers, and privacy blockers. |
| `docs/ux/fermatmind-ux-safe-pr-plan.md` | PR sequencing and scope boundaries for UX work. |
| `docs/personality-ui-spec.md` | Personality hub and type-detail UI intent. |
| `docs/ui-unification-release-runbook.md` | UI release gates, visual regression, rollout, and rollback. |
| `AGENTS.md` | Repository-wide authority, PR discipline, and frontend content rules. |

## Design Problem

FermatMind is not a generic SaaS landing page.
It is a public assessment, career direction, and result interpretation product with CMS-backed content, private result flows, SEO surfaces, and safety-sensitive routes.

The UI must satisfy four demands at the same time:

1. Look premium enough to earn trust.
2. Make it easy to start a useful test.
3. Keep CMS/backend as content authority.
4. Avoid exposing private result, order, payment, share, history, or sensitive query data.

The current docs are strong on authority and safety. They are weaker on visual taste. That is why following the documents literally may still produce a technically correct but visually unsatisfying website.

## North Star

FermatMind should feel like a calm, premium cognitive product:

- clear before clever;
- structured before decorative;
- product-led before editorial;
- trustworthy without badge theater;
- modern without generic SaaS gradients;
- useful without becoming a dense directory wall.

The first screen should communicate:

1. This is FermatMind.
2. It helps me understand myself or choose a direction.
3. I can start a free test quickly.
4. The product has method boundaries and privacy discipline.

## Current Visual Gap

This design system should not pretend that the final visual direction is already solved.

Open questions:

- Should the site feel more like a research lab, premium product, editorial assessment magazine, or calm operating system?
- Should the homepage lead with a full-bleed visual scene, a result-preview artifact, or a dense test-entry surface?
- Should cards remain the main unit, or should more sections use bands, tables, workbench layouts, and editorial columns?
- Which sites are acceptable references, and which are explicitly rejected?
- What level of illustration, photography, diagram, and motion is acceptable?

Until those are answered, each PR should avoid broad aesthetic reinvention. Use the rules below to reduce drift, then run a separate visual-direction pass.

## Visual Taste Lock Needed

Before a major redesign, create a short taste-lock artifact with:

1. Three accepted reference sites or screenshots.
2. Three rejected reference sites or screenshots.
3. One chosen visual direction.
4. Color temperature: warm, neutral, cool, or mixed.
5. Density target: sparse, balanced, or dense.
6. Hero type: product artifact, editorial image, test finder, or immersive visual.
7. Card policy: rare, moderate, or dense.
8. Motion policy: none, subtle, or signature moments.
9. Typography direction: product sans, editorial serif accent, or mixed.
10. The one thing the redesign must not look like.

Without this, design iteration will keep producing acceptable-but-not-right UI.

## Authority Rules

Frontend may own:

- rendering components;
- layout, spacing, typography, interaction, icons, and responsive behavior;
- test-taking UI state and product flows;
- API adapters and data normalization;
- privacy-safe analytics transport;
- visual QA and contract tests.

Frontend must not own:

- homepage editorial copy, CTA copy, module order, featured items, or landing SEO;
- articles, article SEO, article covers, related content, categories, tags, or publication state;
- help, policy, company, brand, careers, about, charter, foundation, privacy, terms, refund, support page body content;
- sitemap, llms, and SEO enumeration where backend/CMS authority exists;
- trust claims, user-count claims, scientific validation claims, review/rating claims, or partnership implications unless CMS/backend authority and review evidence exist.

For CMS-backed surfaces:

1. Render CMS content when present.
2. Use stale last-known-good cache where the repository already supports it.
3. Render a minimal shell or empty/error state when content is missing.
4. Do not add full frontend fallback editorial content.

## Surface Map

| Surface | Primary route | Frontend renderer | Authority | Design posture |
|---|---|---|---|---|
| Homepage | `/`, `/zh`, `/en` | `HomePageExperience` | CMS `landing_surfaces.home` and page blocks | Premium entry, not inventory wall. |
| Tests hub | `/tests` | `TestsHubExperience` | CMS `landing_surfaces.tests` plus public scale catalog | Dense but scannable directory. |
| Test detail | `/tests/[slug]` | dynamic test page and scale sections | Scale lookup, CMS, backend gates | Conversion landing with method boundary. |
| Take flow | `/tests/[slug]/take` | quiz clients and question components | Backend questions, attempts, scoring | Focused, low-distraction completion flow. |
| Result | `/result/[id]` | result clients and scale shells | Backend report/access/projection APIs | Private, noindex, never SEO surface. |
| Articles | `/articles`, `/articles/[slug]` | article renderers | CMS articles and article SEO | Editorial authority, no local article copy. |
| Content pages | `/about`, `/privacy`, `/method-boundaries`, etc. | content page template | CMS `content_pages` | Trust pages, route-backed before footer exposure. |
| Footer | global chrome | `SiteFooter` | frontend links plus CMS route readiness | Utility navigation, not keyword farm. |

## Homepage Pattern

Homepage should be a premium front door with one clear start path.

Required:

- one dominant first-viewport idea;
- one primary CTA;
- no decorative split panel that makes the hero background look fragmented;
- no strategy language in visible UI;
- no local claim copy that CMS/backend cannot verify;
- popular tests visible without forcing a directory wall;
- recommended articles only from CMS-published public articles;
- footer links only to live, route-backed content.

Avoid:

- generic SaaS hero with left text and right dashboard card;
- nested cards inside larger cards;
- oversized decorative gradients;
- fake analytics/protocol text;
- putting CMS copy into frontend just to satisfy a visual request.

## Tests Hub Pattern

The tests hub is a decision surface.

It should help users answer:

- Which test should I take first?
- What is the difference between MBTI, Big Five, RIASEC, IQ, EQ, and Enneagram?
- Which version or form should I choose?

Required:

- high information density with clear hierarchy;
- stable card dimensions;
- category/filter controls that do not hide core tests;
- clinical/depression pending slugs hidden unless explicitly approved;
- no frontend local fallback copy for category authority.

## Test Detail Pattern

Test detail pages should feel specific, not generic.

Required:

- H1 and primary CTA above the fold;
- form/version choices where applicable;
- method boundary and result expectation;
- related articles from CMS only;
- no exaggerated certainty, diagnosis, career prediction, or scientific validation claims;
- no Review/AggregateRating/Product schema unless backed by verified source data.

## Quiz Pattern

The take flow should reduce distraction and preserve trust.

Required:

- clear progress;
- large touch targets;
- keyboard-accessible answers;
- stable layout during hover, focus, and answer state changes;
- recovery and stale-draft states;
- no raw answer text or private IDs in analytics payloads;
- no public SEO scripts on private result/order/share/pay/history paths.

## Result Pattern

Result pages are product value surfaces, but they are private.

Required:

- noindex and private-route discipline;
- no public analytics scripts for private paths;
- free summary and paid module boundaries from backend fields;
- no raw `attemptId`, `orderNo`, `reportId`, transaction id, email, phone, or private result id in visible DOM or tracking;
- paywall module names and order from backend/CMS, not invented locally.

## Article And Content Page Pattern

Articles and content pages are CMS-owned.

Required:

- article body rendering sanitizes rich text;
- article detail has exactly one page-level `h1`;
- CMS body `h1` should be downgraded or rejected by backend policy;
- content-page footer links must 200 in both languages before global exposure;
- missing content pages should not be linked as live trust assets.

## Footer Pattern

Footer should be useful navigation, not SEO stuffing.

Required:

- links must be route-backed and public;
- research/method links must have CMS content assets before exposure;
- footer groups should map to real user tasks;
- private result/order/share/pay/history routes must never be linked;
- if a route is live only in English, do not expose the matching Chinese footer link until the Chinese CMS asset exists.

## Tokens

Current product tokens are partial and spread across CSS, Tailwind classes, and component-level variables.

Target token groups:

- color: background, surface, text, muted text, border, primary, accent, warning, success, danger;
- typography: display, heading, body, label, numeric;
- spacing: page, section, stack, inline, control;
- radius: control, card, media, modal;
- shadow: none, subtle, elevated, overlay;
- motion: duration, easing, reduced-motion fallback.

Token rule:

Do not create one-off visual systems per page. If a new color, radius, shadow, or typography style is needed across more than one section, define or document it as a token.

## Typography

Use product-readable typography first.

Rules:

- no viewport-width font scaling;
- no negative letter spacing for routine UI;
- display type only for true heroes;
- compact panels, cards, sidebars, and dashboards need smaller headings;
- serif may be an accent, not the default body system;
- Chinese and English must both fit containers without clipping or awkward wrapping.

## Color

Preferred feel:

- restrained, warm-neutral foundation;
- ink-like high-contrast text;
- teal or green accent for product action;
- warm accent only where it supports hierarchy.

Avoid:

- one-note teal-only or blue-slate-only palette;
- dominant purple gradients;
- beige/brown/orange-heavy palette;
- decorative orbs, bokeh blobs, and generic glow backgrounds;
- low-contrast gray text on warm surfaces.

## Components

Core components that need consistent treatment:

- primary CTA;
- secondary link;
- test card;
- article card;
- content-page body;
- method/trust disclosure;
- footer link group;
- quiz option;
- progress indicator;
- result module;
- paywall/unlock card.

Component rules:

- icon buttons should use recognizable icons when available;
- text buttons only for clear commands;
- cards should be individual repeated items, not page sections inside cards;
- avoid cards inside cards;
- fixed-format elements need stable dimensions;
- hover/focus must not resize layout;
- controls must have clear focus-visible states.

## Motion

Allowed:

- subtle hero entrance;
- nav/disclosure reveal;
- hover underline/elevation;
- quiz answer feedback;
- progress transition.

Not allowed:

- constant pulsing;
- ornamental looping backgrounds;
- scanline theatrics;
- motion that distracts from assessment completion;
- motion without `prefers-reduced-motion` fallback.

## Accessibility And QA

Every UI PR should check:

- one page-level `h1` where applicable;
- no text overlap at desktop and mobile viewports;
- keyboard navigation for interactive controls;
- focus-visible ring;
- touch target size around 48px for quiz and CTA controls;
- contrast for body text and controls;
- no private identifiers in DOM or analytics;
- no private route public tracking;
- screenshot review for the changed viewport.

## SEO And Public Exposure

Public exposure requires:

1. route returns 200;
2. canonical is self or intended canonical;
3. robots state is intended;
4. backend/CMS authority exists where applicable;
5. sitemap and llms exposure are aligned;
6. no private or sensitive URL;
7. bilingual parity when global navigation exposes both locales.

Do not use footer/header/global navigation to expose a page before content assets exist.

## Design Review Checklist

Before opening a UI PR:

- What surface is being changed?
- Is this render-only, CMS content, backend contract, or private flow?
- Which existing document is the authority?
- Which text is CMS-owned?
- Which claims are being shown?
- Does the design introduce new tokens?
- Does it increase card nesting?
- Does it expose clinical, private, or missing CMS pages?
- What local tests and visual checks were run?
- What is intentionally deferred?

## Why This Document Is Not Enough

This document controls correctness, consistency, and safety.
It does not lock taste.

A site can follow every rule above and still feel wrong because:

- the visual metaphor is undecided;
- the reference set is missing;
- the brand material is not codified;
- typography and imagery are not taste-locked;
- CMS content quality and layout intent are not always aligned;
- screenshots are reviewed reactively instead of against a chosen visual direction.

For the kind of website the operator wants, the next necessary artifact is:

`docs/design/fermatmind-visual-direction.md`

That document should contain accepted references, rejected references, a chosen direction, concrete screenshot-level criteria, and a first set of pages to redesign against that direction.

## Next Recommended Step

Run a focused visual-direction scan before the next major UI PR.

Proposed deliverable:

- `docs/design/fermatmind-visual-direction.md`

Scope:

- homepage first viewport;
- homepage popular tests section;
- article card grid;
- footer;
- tests hub first viewport.

Output:

- 2 to 3 viable directions;
- rejected styles;
- chosen direction;
- component implications;
- PR split;
- visual QA checklist.

