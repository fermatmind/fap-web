# AGENTS.md

This file defines the operating rules for agents working in the `fap-web` repository.

If a task involves UI, UX, visual polish, landing pages, homepage redesign, result pages, responsive behavior, design consistency, copy framing, component refinement, or presentation logic, follow this file strictly.

When this file conflicts with a vague task request, prefer this file.
When this file conflicts with explicit human instructions in the current task, follow the human instructions while preserving the spirit of this file wherever possible.

---

## 1) Project identity

- Product: **FermatMind / 费马测试**
- Positioning: **a structured self-understanding product for youth education, career direction, and decision support**
- Brand slogan: **识微，见远。See the Micro. Lead the Macro.**
- Action line: **人生架构，始于度量。**
- Brand personality: **The Objective Strategist / 冷静的智囊**
- Tone: **minimal, precise, evidence-led**
- Frontend goal: make the product feel **premium, trustworthy, clear, structured, and user-first**

This is not a toy demo, not a hacker console, and not a sci-fi landing page.
It is a real consumer-facing product that must help users quickly understand what it is, why it matters, and where to begin.

---

## 2) Core product truth

FermatMind should present itself as:

- a serious self-assessment product
- for real-world decisions around self-understanding, learning, career, and direction
- with structured explanation and bounded interpretation
- without emotional manipulation
- without fake scientific certainty
- without theatrical “system console” performance

The frontend must communicate:

1. what the product is
2. who it is for
3. what decisions it helps with
4. where the user should start
5. why it can be trusted
6. what its evidence boundaries are

---

## 3) Non-negotiable brand rules

### 3.1 Desired feel

The UI should feel:

- calm
- deliberate
- premium
- rigorous
- legible
- restrained
- data-literate
- modern
- intentional on both desktop and mobile

### 3.2 Forbidden feel

Do **not** make the site feel like:

- a hacker console
- a terminal simulator
- a protocol roleplay
- a fake lab dashboard
- a crypto landing page
- a generic SaaS template
- a cute illustration product
- a flashy over-animated startup page

### 3.3 Visual identity guardrails

Allowed visual language:

- geometric lines
- restrained grids
- structured icons
- precise spacing
- sparse but meaningful data visuals
- calm contrast
- deliberate hierarchy
- industrial minimalism
- mono accents used with purpose

Forbidden visual language:

- 3D mascots
- hand-drawn illustration
- colorful emoji as visual decoration
- soft-cute anthropomorphic graphics
- cluttered glow effects
- meaningless chrome
- fake code blocks used as decoration
- noisy futuristic gimmicks
- overly dense control-panel widgets

### 3.4 Typography and composition

Prefer:

- strong hierarchy
- few text sizes used consistently
- generous whitespace
- clear scan paths
- one dominant idea per section
- one primary action per section
- short copy that can be scanned in seconds
- composition first, components second

Do not solve weak hierarchy by adding more cards, pills, labels, borders, or decorative elements.

### 3.5 Spacing & negative space

FermatMind should feel breathable, deliberate, and premium.

Rules:

- On premium landing surfaces such as the homepage hero and major section transitions, use **large vertical spacing intentionally**, not default spacing.
- On desktop, major section gaps should usually land in a **large-span range** (commonly around `96px–160px`, depending on composition).
- On mobile, spacing should still feel generous and intentional, but must be scaled appropriately rather than mechanically copying desktop values.
- Do not compress section spacing merely to “fill the page.”
- Do not crowd modules together just to increase visible content density.
- Negative space is part of the design system, not leftover area.

Use spacing to create authority, hierarchy, and calm.

---

## 4) Copy and communication rules

### 4.1 Default copy principle

Always lead with:

1. user value
2. scenario relevance
3. structured explanation
4. methodology context

Not the other way around.

Say what the user gets before explaining how the underlying system works.

### 4.2 Tone rules

Write like:

- a chief analyst
- a systems thinker
- a calm expert

Do not write like:

- a hype marketer
- a soft emotional coach
- a fanboy of your own system
- a sci-fi interface narrator

### 4.3 Must do

Prefer phrasing that is:

- specific
- calm
- interpretable
- bounded
- useful for decision-making

Good direction:

- “Understand your trait structure in a clearer, more decision-relevant way.”
- “See how your profile may affect learning, career choice, and collaboration.”
- “Use structured results, normative context, and scenario interpretation to support better decisions.”
- “Start with a free assessment, then explore a deeper report if needed.”

### 4.4 Must not do

Do not use:

- emotional pleading
- vague inspiration filler
- absolute scientific certainty
- deterministic life promises
- fake authority phrasing
- empty theater phrasing
- overly dense internal jargon

Avoid lines like:

- “We hope to help you...”
- “This is the absolute truth...”
- “SYSTEM STATUS: LOCKED”
- “ENTERING CORE PROTOCOL ZONE”
- “TRACE MODE: VERIFIED”
- “RACK_STATUS”
- “DEPLOY”
- “AUDIT ARCHIVE”
- any similar performative console language unless it has real user-facing meaning

### 4.5 Evidence boundaries

Never imply:

- clinical diagnosis
- guaranteed outcomes
- deterministic career destiny
- scientific certainty beyond the product’s evidence boundary
- that a score alone defines a person

The product can be rigorous without pretending to be omniscient.

---

## 5) Information architecture principles

For major landing pages, especially the homepage, structure the page in this order unless the existing page architecture strongly requires a close equivalent:

1. **Hero**
2. **Support / explanation**
3. **Primary choices or product entry points**
4. **Trust / methodology / privacy / evidence boundaries**
5. **Final CTA**

Each section should have:

- one job
- one dominant visual idea
- one primary takeaway
- one primary action, if any

Do not stack sections that all compete for attention.

---

## 6) Homepage rules

The homepage is the highest-priority marketing surface.

### 6.1 Homepage objective

Within 3 seconds, the homepage must answer:

1. What is FermatMind?
2. Who is it for?
3. Why should I trust it?
4. Where do I start?

### 6.2 Homepage must do

The homepage must:

- feel like a real product, not a concept interface
- lead with user benefit before system language
- make the main CTA obvious
- make the product name and main value proposition unmistakable
- create visual continuity across sections
- frame trust in human-readable terms
- guide the user toward starting an assessment

### 6.3 Homepage must not do

The homepage must not:

- open with a wall of protocol language
- bury the product value under system theater
- overuse status chips, badges, grid labels, IDs, or fake telemetry
- rely on self-congratulatory proof framing
- make users decode the product before they can use it

### 6.4 Hero rules

The hero should:

- make the brand/product name prominent
- make the value proposition clear immediately
- support the value proposition with one strong supporting explanation
- present one primary CTA and at most one secondary CTA
- use one dominant visual anchor, not many competing decorative elements

Do not turn the hero into a dashboard collage.

### 6.5 Assessment entry rules

Assessment entry cards or modules must be:

- problem-led
- understandable immediately
- framed around real user questions or outcomes

Prefer:

- “Career direction”
- “Personality structure”
- “Emotional state”
- “Collaboration style”
- “Learning and decision patterns”

Avoid internal-method-first framing like:

- “Used to establish...”
- “Used to anchor...”
- “Used to evaluate...”

These may appear later in detail copy, but should not dominate the primary entry layer.

### 6.6 Trust section rules

Trust should be framed through:

- methodology
- privacy
- scenarios of use
- normative context
- interpretation boundaries
- product discipline

Trust must be credible and human-readable.

Do not use fake trust devices:

- fake testimonials
- fake ratings
- fake counters
- fake badges
- fake partner logos
- fake media mentions
- unverifiable “verified value” framing

If real proof is not available in the code/content source, do not invent it.

---

## 7) Shared component and design system rules

### 7.1 No second design system

Do not create a parallel design system.
Do not introduce a second visual language beside the existing one.
Refactor and improve the current system instead of layering a new one on top.

### 7.2 Prefer token discipline

Before introducing new values, inspect and reuse:

- spacing scale
- typography scale
- color tokens
- radius scale
- shadow usage
- motion patterns

Only add new tokens when absolutely necessary and keep additions minimal.

### 7.3 Component discipline

Prefer:

- reusable primitives
- coherent variants
- consistent spacing
- consistent interaction states
- consistent mobile behavior

Avoid:

- page-specific one-off hacks unless unavoidable
- duplicated component variants that only differ cosmetically
- decorative components with no information or UX job

### 7.4 Dynamic block contract

Result-page and report-page components must be **config-driven** and **variant-aware**.

Rules:

- Components should support server-driven presentation variants such as `variant_key` or an equivalent config field.
- UI details such as emphasis level, icon weight, accent depth, and section treatment should be able to adapt from configuration rather than being hardcoded into one static presentation.
- Dynamic data components must explicitly handle at least:
  - `loading`
  - `skeleton`
  - `empty`
  - `error`
  - `partial`
- Loading states must preserve layout stability as much as possible and avoid major layout shift.
- Do not make dynamic pages feel broken while the engine is computing.
- Do not hardcode a single visual treatment when the product clearly requires multi-variant result rendering.

Config-driven does not mean chaotic. Variants must still remain inside one coherent FermatMind system.

---

## 8) Motion and interaction rules

Motion should be:

- sparse
- purposeful
- memorable in small number
- tied to hierarchy or feedback
- subtle and premium

Do not use motion as decoration spam.

Allowed motion use:

- gentle entrance hierarchy
- micro-interactions for focus/hover
- restrained emphasis for primary CTA or chart transitions
- smooth reveal tied to content meaning

Avoid:

- constant pulsing
- large exaggerated parallax
- overlong transitions
- ornamental animation that distracts from scanning
- anything that weakens perceived performance

### 8.1 Paywall & locking interaction

For locked modules on result pages or report pages, use the principle of:

**invite, do not punish**

Rules:

- Locked content should feel desirable and premium, not like an error state.
- Prefer elegant partial reveal patterns such as:
  - restrained backdrop blur
  - gradient masks
  - progressive preview surfaces
  - softened content fade
- Avoid harsh interruption patterns by default, such as:
  - aggressive blocking modals
  - error-like warnings
  - abrupt dead-end walls
- The unlock CTA should be one of the strongest actions **within the locked context**, and should usually be among the top visual actions on that page.
- On homepage and general marketing pages, the primary assessment-start CTA remains the top priority.
- Locking UI must preserve accessibility:
  - clear reading order
  - focus visibility
  - no keyboard trap
  - no misleading interaction on unavailable content
- Do not make locked UI feel cheap, punitive, or spammy.

The purpose of locking UI is to increase perceived value while preserving trust.

---

## 9) Accessibility, usability, and responsiveness

Every UI change must preserve or improve:

- semantic heading structure
- contrast
- focus states
- keyboard accessibility where relevant
- tap target size
- readable line lengths
- mobile spacing
- layout stability
- scanability on small screens

Mobile must not be treated as a compressed desktop.
It should feel intentionally designed.

Before finishing, check at least:

- hero readability on narrow screens
- CTA prominence on mobile
- card stacking and spacing
- text wrapping
- overflow issues
- heading rhythm
- trust section readability
- footer spacing and density

---

## 10) SEO and route safety

Do not degrade SEO or route behavior.

Do not casually change:

- route architecture
- metadata logic
- sitemap behavior
- robots behavior
- canonical logic
- noindex behavior
- locale routing
- structured content paths

If a UI task requires touching SEO-sensitive files, keep the change minimal and preserve existing semantics unless the task explicitly asks for SEO work.

Do not break marketing page discoverability.

---

## 11) Performance and implementation constraints

Prefer implementation choices that preserve or improve:

- build stability
- type safety
- runtime simplicity
- bundle discipline
- render performance

Do not add large dependencies for minor visual effects.

Prefer:

- existing stack patterns
- existing styling approach
- existing package manager
- existing scripts
- existing route structure

Inspect the repository before assuming package manager or command names.
Use the lockfile and package scripts as source of truth.

### 11.2 AI-assistance privacy & code hygiene

All AI-assisted code must be treated as draft material until reviewed by a human.

Rules:

- Do not place secret thresholds, confidential scoring logic, internal business rules, or sensitive operational details in:
  - comments
  - UI strings
  - debug labels
  - frontend constants
  - placeholder copy
- Do not leak internal decision weights, threshold values, monetization triggers, or hidden business semantics through explanatory comments.
- Keep code readable and maintainable; do **not** intentionally obfuscate the codebase.
- Use meaningful names for public code, but do not expose confidential logic more than necessary.
- Remove AI-generated dead code, verbose comments, imported junk, or copied patterns that do not belong in this repo.
- Review all AI-generated code for:
  - accidental privacy leakage
  - irrelevant borrowed patterns
  - external-repo residue
  - redundant complexity
  - non-idiomatic code style

AI assistance is allowed. Unreviewed leakage is not.

---

## 12) Backend and product boundary rules

This repo is frontend-first.
Do not expand a UI task into backend redesign.

Do not change without explicit instruction:

- API contracts
- payload semantics
- scoring logic
- business logic
- payment logic
- assessment methodology semantics
- analytics meaning
- legal/privacy meaning

If a UI change requires moving a tracking hook, preserve event semantics.

Do not invent fallback bridges in the consumer layer to hide weak UI or unclear product logic.

---

## 13) Source of truth priority

For frontend and UI tasks, use this priority:

1. explicit human instruction in the current task
2. this `AGENTS.md`
3. actual live product behavior
4. actual repo structure, components, styles, and content sources
5. existing design tokens and shared primitives
6. benchmark references only for information hierarchy and quality bar, never for cloning

If something is unknown, inspect first.
Do not guess when inspection is possible.

---

## 14) Working model for UI tasks

Before building, write these three things in the task notes or response:

1. **visual thesis**: one sentence describing mood, material, and energy
2. **content plan**: hero, support, detail, final CTA
3. **interaction thesis**: 2–3 motion or interaction ideas that improve feel without clutter

Then inspect the actual code and implement.

---

## 15) Default execution flow

For meaningful UI tasks, follow this order:

1. inspect the relevant live page if available
2. inspect the relevant repo files and shared primitives
3. identify the page’s structural problems
4. produce a short execution plan
5. implement directly in code
6. run validation
7. review the diff for regressions, overdesign, and inconsistency
8. report clearly what changed and what stayed untouched

Do not stop at critique if implementation is possible.

---

## 16) Validation requirements

Before finishing, run the relevant checks from the repo.
At minimum, use the project’s existing equivalents of:

- lint
- typecheck
- build

If the repo has route-specific tests or visual checks relevant to the touched area, run them too.

If browser tooling is available, verify the changed page on desktop and mobile widths after implementation.

If a check cannot run, state exactly why.
Do not claim validation you did not perform.

---

## 17) Output contract for agents

When completing a UI task, report:

1. files changed
2. structural changes made
3. copy direction changes made
4. visual problems removed
5. mobile/responsive issues addressed
6. validation performed
7. anything intentionally left untouched
8. any remaining risks or follow-up suggestions

Keep the report factual.
Do not exaggerate.

---

## 18) Done criteria

A UI task is done only when:

- the implementation exists in code
- the page is materially improved, not cosmetically shuffled
- the hierarchy is clearer
- the page feels more premium and trustworthy
- the product value is clearer
- the design is more coherent across sections
- desktop and mobile both feel intentional
- validation has been run or the exact blocker has been stated

---

## 19) Repo-specific reminders for FermatMind

Always remember:

- FermatMind should feel **precise**, not performative
- It should feel **premium**, not flashy
- It should feel **evidence-led**, not self-mythologizing
- It should feel **structured**, not emotionally needy
- It should feel **human-readable**, not like an internal protocol console

Keep the identity.
Remove the theater.
Preserve the rigor.
Increase the trust.
Make the product easier to understand and easier to start.
