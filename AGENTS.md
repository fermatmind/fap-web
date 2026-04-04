# AGENTS.md

This file defines the operating rules for agents working in the `fap-web` repository.

If a task involves UI, UX, visual polish, landing pages, homepage redesign, tests hub, category hubs, result pages, responsive behavior, design consistency, copy framing, component refinement, or presentation logic, follow this file strictly.

When this file conflicts with a vague task request, prefer this file.
When this file conflicts with explicit human instructions in the current task, follow the human instructions while preserving the spirit of this file wherever possible.

This file is the long-lived rule system for FermatMind frontend work.
Do not treat temporary iteration ideas as permanent rules unless they are added here.

---

## 1) Project identity

- Product: **FermatMind / 费马测试**
- Positioning: **a structured self-understanding product for youth education, career direction, and decision support**
- Brand signature: **识微，见远。**
- Core promise: **人生架构，始于度量。**
- Default product descriptor: **面向青年教育与就业决策的结构化认知系统。**
- Brand personality: **The Objective Strategist / 冷静的智囊**
- Tone: **minimal, precise, evidence-led**
- Frontend goal: make the product feel **premium, trustworthy, clear, structured, sharp, and user-first**

This is not:
- a toy demo
- a hacker console
- a sci-fi landing page
- a generic SaaS template
- a site map pretending to be a product
- a strategy deck rendered as UI
- a psychology self-help site

This is:
- a real consumer-facing product
- for real-world self-understanding and decision support
- that must help users quickly understand what it is, why it matters, where to start, and what they get back

---

## 2) Core product truth

FermatMind should present itself as:

- a serious self-assessment product
- for real-world decisions around self-understanding, learning, career direction, and collaboration
- with structured explanation and bounded interpretation
- without emotional manipulation
- without fake scientific certainty
- without theatrical “system console” performance
- without pretending to be clinical diagnosis when it is not

The frontend must communicate:

1. what the product is
2. who it is for
3. what decisions it helps with
4. where the user should start
5. what kind of result the user gets back
6. why it can be trusted
7. what its evidence boundaries are

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
- a portal
- a product strategy memo

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
- believable product/report surfaces

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
- giant abstract geometry with no product meaning
- giant empty cards with no information scent

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
- strong visual anchors
- quiet supporting text

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
3. what the result gives back
4. structured explanation
5. methodology context

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
- a product manager explaining IA
- a content strategist explaining why sections exist

### 4.3 Must do

Prefer phrasing that is:

- specific
- calm
- interpretable
- bounded
- useful for decision-making
- product-like rather than essay-like

Good direction:

- “Use structured results and scenario interpretation to support better decisions.”
- “Start from a question, then move into a result worth reading.”
- “See how your profile may affect learning, career choice, and collaboration.”
- “Choose between quick and deeper versions when a product has variants.”

### 4.4 Must not do

Do not use:

- emotional pleading
- vague inspiration filler
- absolute scientific certainty
- deterministic life promises
- fake authority phrasing
- empty theater phrasing
- overly dense internal jargon
- UI copy that explains why a section exists

Avoid lines like:

- “We hope to help you...”
- “This is the absolute truth...”
- “SYSTEM STATUS: LOCKED”
- “ENTERING CORE PROTOCOL ZONE”
- “TRACE MODE: VERIFIED”
- “RACK_STATUS”
- “DEPLOY”
- “AUDIT ARCHIVE”
- “This block exists to...”
- “This layer is for...”
- “Start by question when urgency is high...”
- “The homepage should...”
- any similar performative or internal-strategy language unless it has real user-facing meaning

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

For major marketing and entry pages, structure the page so users can understand and act without reading everything.

Default homepage sequence should be close to:

1. **Hero**
2. **Immediate start layer**
3. **Secondary browse layer**
4. **Results / output value**
5. **Trust / boundaries**
6. **Final CTA**
7. **Footer**

Each section should have:

- one job
- one dominant visual idea
- one primary takeaway
- one primary action, if any

Do not stack sections that all compete for attention.
Do not use two adjacent sections to answer the same question in the same way.

---

## 6) Homepage rules

The homepage is the highest-priority marketing surface.

### 6.1 Homepage objective

Within 3 seconds, the homepage must answer:

1. What is FermatMind?
2. Who is it for?
3. Why should I trust it?
4. Where do I start?
5. What kind of result will I get?

### 6.2 Homepage must do

The homepage must:

- feel like a real product, not a concept interface
- lead with user benefit before system language
- make the main CTA obvious at page level (not necessarily inside hero)
- make the product name and main value proposition unmistakable
- create visual continuity across sections
- frame trust in human-readable terms
- guide the user toward starting an assessment
- create desire for the result, not just explain the assessment

### 6.3 Homepage must not do

The homepage must not:

- open with a wall of protocol language
- bury the product value under system theater
- overuse status chips, badges, grid labels, IDs, or fake telemetry
- rely on self-congratulatory proof framing
- make users decode the product before they can use it
- explain its own IA or section logic in user-facing copy
- repeat the same “how to start” message in two adjacent sections

### 6.4 Homepage hero rules

The hero should:

- make the brand/product signature prominent
- make the value proposition clear immediately
- support the value proposition with concise copy (supporting line is optional when noise needs to be reduced)
- prefer one primary CTA and at most one secondary CTA, but may omit hero CTA when immediate-start entry is already the next block and clearly visible
- use one dominant visual anchor, not many competing decorative elements
- feel like a premium product front door, not a product explainer

Do not turn the hero into:
- a dashboard collage
- a label-heavy scaffold
- a collection of helper tags
- a stock-visual composition
- a hollow abstract graphic

### 6.5 Homepage messaging hierarchy

Default homepage messaging, unless a task-specific approved copy overrides it:

- Brand signature: **识微 见远**
- H1: **人生架构，始于度量**
- Subhead: **面向青年教育与就业决策的结构化认知系统。**
- Supporting line: **从人格、能力与状态出发，把天赋、倾向与情境反应整理成可执行的判断依据。**

Presentation note:
- Do not force all messaging layers to appear simultaneously in hero.
- The technical brand label (for example `FermatMind / 费马测试`), supporting line, hero CTA row, and trust chips are optional presentation layers.
- When these layers are removed for focus, keep start-path clarity in the immediate-start section and final CTA section.
- Current homepage baseline for typography and spacing:
  - line 1 (`识微 见远`) is the largest visual line
  - line 2 (`人生架构，始于度量`) is the second line with strong but lower emphasis than line 1
  - line 3 (`面向青年教育与就业决策的结构化认知系统。`) should stay single-line on desktop when layout allows
  - vertical spacing between these three lines should remain tight and intentional (avoid loose stacking)

Do not weaken this into generic self-help language.
Do not replace it with softer but flatter “understand yourself more clearly” phrasing unless explicitly instructed.

### 6.6 Homepage entry-layer rules

The homepage may contain both:

- an immediate start layer
- a secondary browse layer

But they must have clearly different jobs.

#### Immediate start layer
This layer serves users who want to start now.

Rules:
- must be question-led
- must feel action-led
- must have the highest intent
- cards must be concise
- do not over-explain

#### Secondary browse layer
This layer serves users who know the domain but not the exact assessment.

Rules:
- must feel calmer and more exploratory
- must be visually secondary to the immediate start layer
- must not repeat the same “how to start” logic in full
- must feel like curated browsing, not a second start layer

### 6.7 Homepage results preview rules

Results Preview is not a feature explanation block.
It is a **result desire block**.

Rules:
- show what the product gives back
- make results feel valuable, legible, and worth owning
- use one primary result surface plus supporting result surfaces where useful
- let visuals carry more persuasion than body copy
- keep copy short and sharp

Do not use:
- giant empty cards
- meaningless abstract geometry
- oversized black polygons
- generic placeholders
- overly explanatory preview text

The section should make users feel:
“I want this result.”

### 6.8 Homepage trust section rules

Trust should be framed through:

- methodology
- privacy
- scenarios of use
- interpretation boundaries
- product discipline

Trust must be:
- credible
- bounded
- short
- human-readable

Do not use fake trust devices:
- fake testimonials
- fake ratings
- fake counters
- fake badges
- fake partner logos
- fake media mentions
- unverifiable “verified value” framing

### 6.9 Homepage resources rules

The homepage should not become a resource hub.
Resources are support, not the main stage.

If resources appear on the homepage:
- keep them light
- show only high-signal items
- do not let them compete with product entry and results value

### 6.10 Homepage footer rules

The footer should:
- remain useful
- remain navigable
- feel quiet and secondary
- not feel like a portal
- not explain itself

Keep grouped navigation if useful, but reduce visual and cognitive weight.
Social links and support details should be visually weaker than the main footer navigation.

### 6.11 Homepage header alignment rules

Homepage header alignment must match the homepage content rails.

Rules:
- Desktop header content should align with the same left/right rail used by hero and primary homepage sections.
- Do not let homepage nav collapse into a narrow centered cluster while body sections use a wider rail.
- Keep top navigation breathing room; avoid crowded trigger spacing that makes the bar feel compressed.
- When changing homepage container widths, update header and hero together unless there is an explicit reason not to.

---

## 7) Tests hub and category hub rules

### 7.1 Tests hub

The tests hub is a **curated front door**, not a directory wall.

It should:
- help users start from a question
- help users browse by domain
- reduce inventory feeling
- avoid explaining IA in UI copy

Do not make the tests hub sound like:
- a routing layer
- an inventory explanation
- an internal taxonomy diagram

### 7.2 Category hubs

Category hubs should feel like:
- small product pages
- curated entry points
- guided choices

Not:
- plain categorized list pages

Each category hub should ideally include:
- breadcrumb
- category hero
- featured assessments
- all assessments in category
- “how these differ” guidance
- related resources

Featured assessments must feel meaningfully different from the full list below.

---

## 8) Product-line and assessment-variant rules

Some assessments are product lines with meaningful variants.
Do not present them as a raw question-count choice.
Present them as a **depth choice**.

### 8.1 MBTI and Big Five variant rules

Use consistent productized naming and hierarchy across homepage, hubs, category pages, and detail pages.

Recommended direction:

- MBTI
  - quick / standard version
  - deep / full version

- Big Five
  - quick / standard version
  - full / deeper version

Keep question counts visible, but secondary.
Lead with the level of depth and expected use, not the burden.

Do not use misleading terms such as:
- clinical grade
- diagnostic grade
- scientifically guaranteed
unless such language is truly justified and approved.

### 8.2 Variant communication rules

Users should feel they are choosing:
- depth
- detail
- intended use

Not simply:
- more questions vs fewer questions

Variant surfaces must be:
- visually coherent
- consistent across pages
- easy to compare
- obviously intentional

---

## 9) Results and report surfaces

Results and report UI should feel like real product output.

Prefer:
- believable report surfaces
- structured visual summaries
- trait charts
- scenario mapping
- next-step guidance
- compact but high-finish result compositions

Avoid:
- abstract filler graphics
- giant meaningless shapes
- low-information placeholders
- decorative blocks with no product scent

If a preview exists:
- it should resemble a real result
- it must not fake personalized output before the user has completed an assessment

---

## 10) Shared component and design system rules

### 10.1 No second design system

Do not create a parallel design system.
Do not introduce a second visual language beside the existing one.
Refactor and improve the current system instead of layering a new one on top.

### 10.2 Prefer token discipline

Before introducing new values, inspect and reuse:

- spacing scale
- typography scale
- color tokens
- radius scale
- shadow usage
- motion patterns

Only add new tokens when absolutely necessary and keep additions minimal.

### 10.3 Component discipline

Prefer:

- reusable primitives
- coherent variants
- consistent spacing
- consistent interaction states
- consistent mobile behavior
- product-like surfaces with clear information scent

Avoid:

- page-specific one-off hacks unless unavoidable
- duplicated component variants that only differ cosmetically
- decorative components with no information or UX job

### 10.4 Dynamic block contract

Result-page and report-page components must be **config-driven** and **variant-aware**.

Rules:

- Components should support server-driven presentation variants such as `variant_key` or an equivalent config field.
- UI details such as emphasis level, icon weight, accent depth, and section treatment should adapt from configuration rather than being hardcoded into one static presentation.
- Dynamic data components must explicitly handle at least:
  - `loading`
  - `skeleton`
  - `empty`
  - `error`
  - `partial`
- Loading states must preserve layout stability as much as possible and avoid major layout shift.
- Do not make dynamic pages feel broken while the engine is computing.
- Do not hardcode a single visual treatment when the product clearly requires multi-variant result rendering.

Config-driven does not mean chaotic.
Variants must still remain inside one coherent FermatMind system.

---

## 11) Motion and interaction rules

Motion should be:

- sparse
- purposeful
- memorable in small number
- tied to hierarchy or feedback
- subtle and premium
- physically believable

Do not use motion as decoration spam.

Allowed motion use:

- gentle entrance hierarchy
- micro-interactions for focus/hover
- restrained emphasis for primary CTA or chart transitions
- smooth reveal tied to content meaning
- light staggered fade-in
- light press/scale feedback when appropriate

Avoid:

- constant pulsing
- large exaggerated parallax
- overlong transitions
- ornamental animation that distracts from scanning
- anything that weakens perceived performance

### 11.1 Navigation dropdown behavior

For top-level nav items with children:

Desktop should support:
- hover reveal
- keyboard focus reveal
- stable pointer transition into the panel
- Esc close
- click-outside close

Mobile should support:
- tap disclosure
- clear expanded/collapsed state
- touch-friendly targets

Do not rely on hover only.
Do not use misleading ARIA roles.

### 11.2 Paywall & locking interaction

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

## 12) Accessibility, usability, and responsiveness

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
- dropdown behavior on desktop and mobile
- result preview clarity on mobile

---

## 13) SEO and route safety

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

All important SEO-relevant content must be:
- user-visible
- user-useful
- semantically honest
- mobile-equivalent

Do not use:
- hidden text
- hidden links
- crawler-only content
- misleading structured data
- keyword-farm footer language

---

## 14) Performance and implementation constraints

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

### 14.1 AI-assistance privacy & code hygiene

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

AI assistance is allowed.
Unreviewed leakage is not.

---

## 15) Backend and product boundary rules

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

## 16) Source of truth priority

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

## 17) Working model for UI tasks

Before building, write these three things in the task notes or response:

1. **visual thesis**: one sentence describing mood, material, and energy
2. **content plan**: hero, support, detail, final CTA
3. **interaction thesis**: 2–3 motion or interaction ideas that improve feel without clutter

Then inspect the actual code and implement.

---

## 18) Default execution flow

For meaningful UI tasks, follow this order:

1. inspect the relevant live page if available
2. inspect the relevant repo files and shared primitives
3. identify the page’s structural and sensory problems
4. produce a short execution plan
5. implement directly in code
6. run validation
7. review the diff for regressions, overdesign, and inconsistency
8. report clearly what changed and what stayed untouched

Do not stop at critique if implementation is possible.

---

## 19) Validation requirements

Before finishing, run the relevant checks from the repo.
At minimum, use the project’s existing equivalents of:

- lint
- typecheck
- build

If the repo has route-specific tests or visual checks relevant to the touched area, run them too.

If browser tooling is available, verify the changed page on desktop and mobile widths after implementation.

If a check cannot run, state exactly why.
Do not claim validation you did not perform.

For homepage-related work, verify at minimum:
- hero clarity
- CTA hierarchy
- immediate start layer
- secondary browse layer
- results preview quality
- trust readability
- footer weight
- dropdown behavior
- desktop/mobile overflow

---

## 20) Output contract for agents

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

## 21) Done criteria

A UI task is done only when:

- the implementation exists in code
- the page is materially improved, not cosmetically shuffled
- the hierarchy is clearer
- the page feels more premium and trustworthy
- the product value is clearer
- the design is more coherent across sections
- desktop and mobile both feel intentional
- validation has been run or the exact blocker has been stated

For homepage work specifically:
- it must feel more like a premium product front door
- not more like an explainer page
- not more like a directory
- not more like a strategy memo

---

## 22) Repo-specific reminders for FermatMind

Always remember:

- FermatMind should feel **precise**, not performative
- It should feel **premium**, not flashy
- It should feel **evidence-led**, not self-mythologizing
- It should feel **structured**, not emotionally needy
- It should feel **human-readable**, not like an internal protocol console
- It should make users want the result, not just understand the product
- It should explain less by copy and more by hierarchy, composition, and product surface quality

Keep the identity.
Remove the theater.
Preserve the rigor.
Increase the trust.
Make the product easier to understand, easier to start, and more worth finishing.

---

## 23) Homepage rule maintenance

When homepage UI changes alter long-lived behavior, hierarchy, or brand expression, update this `AGENTS.md` in the same PR.

This includes changes to:
- brand messaging hierarchy
- homepage section responsibilities
- hero structure
- immediate start vs secondary browse logic
- results preview principles
- trust section principles
- footer behavior and weight
- navigation interaction rules
- product-line / variant presentation rules

Do **not** update `AGENTS.md` for:
- temporary experiments
- one-off visual trials
- unvalidated iteration ideas
- copy tests that are not yet stable
- small styling tweaks that do not change long-term rules

Promotion rule:
Only promote a homepage decision into `AGENTS.md` when it is:
1. implemented
2. reviewed
3. likely to persist across future iterations

If a homepage change is still exploratory, keep it in:
- task instructions
- iteration notes
- temporary design docs

Do not let `AGENTS.md` become a dump of unstable ideas.
It should stay stable, durable, and high-signal.
