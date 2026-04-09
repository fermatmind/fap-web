# personality-ui-spec.md

Status: V1 Draft  
Scope: Personality board UI specification  
Routes covered:
- `/[locale]/personality`
- `/[locale]/personality/[type]`

This document translates the current personality IA draft into a module-level UI specification.

It does not define implementation details.  
It does not define component APIs.  
It does not prescribe Tailwind, TSX structure, or code architecture.

It defines:
- module order
- module responsibility
- hierarchy
- CTA policy
- summary vs deep content boundaries
- hub page vs type page visual contrast

---

## 1) Executive summary

The personality board should present two clearly different page types:

### `/[locale]/personality`
A **decision hub**.
It should feel:
- broad
- fast to scan
- comparison-oriented
- navigation-heavy
- summary-first

It should not feel:
- like a long article
- like a recommendation directory
- like a second test landing page
- like a type detail page repeated 16 times

### `/[locale]/personality/[type]`
A **single-type deep page**.
It should feel:
- singular
- focused
- more narrative
- more interpretive
- more type-owned

It should not feel:
- like a mini hub
- like a general MBTI board
- like a flat CMS dump

The core UI rule is:

**Hub page = choose and compare.**  
**Type page = understand and continue.**

---

## 2) `/[locale]/personality` page module stack

The hub page should use the following approved module stack.

## 2.1 Approved stack

1. Hub Hero
2. Quick Locate
3. Type Navigator Workbench
4. Scenario Router
5. Career Preview
6. Methodology
7. FAQ

This is the full approved stack.
No additional primary sections should be introduced unless the IA is revised.

---

## 2.2 Module specifications

### 1. Hub Hero

#### Job
State what the board is, why it exists, and what users should do first.

#### Module level
- primary
- above the fold
- must carry the clearest page identity

#### Must contain
- board title
- one short summary
- one primary CTA to start or continue MBTI testing
- optionally one secondary CTA if it creates a genuinely different route

#### Must not contain
- dense educational content
- recommendation detail content
- more than one secondary route cluster
- large card mosaics

#### Judgment
- keep
- compress aggressively
- summary-only

---

### 2. Quick Locate

#### Job
Let already-motivated users jump directly to a type or related destination.

#### Module level
- primary utility
- should live near the top
- should visually support Hero rather than compete with it

#### Must contain
- search / quick locate input
- immediate destination-oriented behavior

#### Must not contain
- search-product framing
- long helper text
- multiple explanatory submodules

#### Judgment
- keep
- summary-only
- utility-first

---

### 3. Type Navigator Workbench

#### Job
Serve as the main 16-type browse-and-compare surface.

#### Module level
- primary
- core identity section
- should feel like the operational center of the hub

#### Must contain
- complete 16-type inventory
- clear family grouping or equivalent structural grouping
- one primary CTA into each type page
- one secondary CTA into recommendation where relevant

#### Must not contain
- essay-length copy
- repeated board-level explanation
- repeated test-entry messaging inside every card

#### Judgment
- keep
- do not remove
- keep directory power, compress explanatory overhead

---

### 4. Scenario Router

#### Job
Offer an alternate entry path for users who think in use cases rather than type labels.

#### Module level
- secondary
- should appear below the main type-browsing layer
- should not overpower the Workbench

#### Must contain
- compact scenario framing
- a clear action into the relevant next route

#### Must not contain
- giant matrix density
- too many nested CTA levels
- deep scenario content bodies

#### Judgment
- keep
- compress
- summary-only
- likely the first candidate for visual simplification if the page becomes too heavy

---

### 5. Career Preview

#### Job
Demonstrate that the personality board connects to real recommendation depth.

#### Module level
- secondary
- trust-building and proof-of-depth layer
- should not compete with Workbench for primary attention

#### Must contain
- a limited number of preview units
- explanation that recommendation depth exists downstream
- continuation into recommendation surfaces

#### Must not contain
- dense career grids
- broad job-browse behavior
- recommendation-directory behavior

#### Judgment
- keep
- compress
- preview-only

---

### 6. Methodology

#### Job
Explain how the board should be used.

#### Module level
- tertiary
- trust layer
- explanatory support, not discovery layer

#### Must contain
- practical usage explanation
- clear operational framing
- what this page does not replace

#### Must not contain
- long essays
- MBTI theory deep dives
- duplicated FAQ content

#### Judgment
- keep
- summary-only
- may use collapsible presentation

---

### 7. FAQ

#### Job
Resolve repeated user confusion and support structured SEO.

#### Module level
- tertiary
- end-of-page clarification layer

#### Must contain
- compact high-value questions
- short direct answers

#### Must not contain
- article-like depth
- broad educational content
- low-value keyword filler

#### Judgment
- keep
- compress
- best rendered in foldable / accordion form

---

## 2.3 Keep / move / compress / remove table for hub page

| Module | Job | Keep | Move | Compress | Remove |
| --- | --- | --- | --- | --- | --- |
| Hub Hero | orient and start | yes | no | yes | no |
| Quick Locate | direct jump utility | yes | no | yes | no |
| Type Navigator Workbench | 16-type browse and compare | yes | no | moderate only | no |
| Scenario Router | alternate use-case entry | yes | no | yes | not yet |
| Career Preview | prove downstream recommendation depth | yes | no | yes | no |
| Methodology | usage explanation | yes | no | yes | no |
| FAQ | confusion reduction + SEO support | yes | no | yes | no |

---

## 3) `/[locale]/personality/[type]` page module stack

The type page should be clearly deeper and more singular than the hub.

## 3.1 Approved stack

1. Type Hero
2. Type Summary / Signature Block
3. Variant Split or Variant Framing
4. Career Module
5. Collaboration Module
6. Growth Module
7. Related Guides / Related Reading
8. Continuation CTA Band

This stack may be adapted slightly per type, but the page should remain recognizably single-type and continuation-oriented.

---

## 3.2 Module specifications

### 1. Type Hero

#### Job
Introduce the type and establish the page’s specific identity.

#### Module level
- primary
- must feel more singular than the hub hero

#### Must contain
- type code
- type name
- short interpretive summary
- one verification CTA or one primary continuation CTA

#### Must not contain
- full board-level navigation density
- scenario-matrix behavior
- 16-type comparison surfaces

#### Judgment
- keep
- not summary-only, but still concise

---

### 2. Type Summary / Signature Block

#### Job
Provide the clearest short explanation of what defines the type.

#### Module level
- primary support
- should immediately deepen the Hero

#### Must contain
- core definition
- short strengths / risks or equivalent signature framing

#### Must not contain
- excessive CMS repetition
- giant trait laundry lists without synthesis

#### Judgment
- keep
- compress if source content is too repetitive

---

### 3. Variant Split or Variant Framing

#### Job
Clarify A/T or equivalent variant nuance if present.

#### Module level
- secondary but important
- should appear early because it changes interpretation

#### Must contain
- clear distinction between base type and variant nuance
- just enough depth to affect interpretation

#### Must not contain
- a whole second page crammed inline
- repeated restatement of the base profile

#### Judgment
- keep
- compress to the minimum useful distinction

---

### 4. Career Module

#### Job
Explain how this type tends to show up in work and recommendation logic.

#### Module level
- primary continuation layer
- usually the strongest downstream action layer

#### Must contain
- type-to-work interpretation
- one clear CTA into recommendation detail

#### Must not contain
- recommendation-directory density
- broad job walls

#### Judgment
- keep
- not summary-only, but still scoped

---

### 5. Collaboration Module

#### Job
Explain how this type tends to behave in team or social execution contexts.

#### Module level
- secondary interpretive layer

#### Must contain
- meaningful collaboration lens
- type-specific explanation

#### Must not contain
- broad teamwork product behavior
- hub-level comparison tables

#### Judgment
- keep
- may be partially collapsible on mobile

---

### 6. Growth Module

#### Job
Explain likely bottlenecks and useful next-step direction.

#### Module level
- secondary interpretive layer

#### Must contain
- bottleneck framing
- practical advice

#### Must not contain
- generic self-help language
- vague encouragement with no type grounding

#### Judgment
- keep
- compress if repetitive

---

### 7. Related Guides / Related Reading

#### Job
Offer reading continuation that is clearly connected to this type.

#### Module level
- tertiary
- supporting continuation only

#### Must contain
- limited, relevant guide/article links

#### Must not contain
- full content-library behavior
- giant reading walls

#### Judgment
- keep
- compress hard

---

### 8. Continuation CTA Band

#### Job
Give the user a final clear next step.

#### Module level
- tertiary but action-critical

#### Must contain
- one test verification CTA or one recommendation CTA
- optional second continuation only if it is meaningfully different

#### Must not contain
- five adjacent buttons to related surfaces
- repeated copies of earlier CTA groups

#### Judgment
- keep
- tighten to 1–2 meaningful actions

---

## 3.3 Keep / move / compress / remove table for type page

| Module | Job | Keep | Move | Compress | Remove |
| --- | --- | --- | --- | --- | --- |
| Type Hero | identify one type | yes | no | light only | no |
| Type Summary | define the type | yes | no | yes if repetitive | no |
| Variant Split | separate variant nuance | yes | no | yes | no |
| Career Module | connect to work / recommendation | yes | no | moderate only | no |
| Collaboration Module | explain team/social execution | yes | no | yes | no |
| Growth Module | interpret bottlenecks and next step | yes | no | yes | no |
| Related Reading | light continuation | yes | no | yes | possible later if noise grows |
| Continuation CTA Band | final action handoff | yes | no | yes | no |

---

## 4) CTA hierarchy rules

## 4.1 Global CTA rule

Every page should have one obvious next step.
Anything beyond that should justify itself by creating a different decision path, not by repeating the same destination.

## 4.2 Hub CTA hierarchy

### Primary
- Start MBTI test

### Secondary
- Open a type page
- Open recommendation detail or recommendation index

### Utility
- quick locate
- anchor jump

### Not allowed as repeated page-wide patterns
- repeated topic-center CTA groups
- repeated recommendation-directory CTA groups
- multiple adjacent “start test” variants pointing to the same route family

## 4.3 Type-page CTA hierarchy

### Primary
- verify / start MBTI test **or** open recommendation detail

The exact primary action may depend on the page strategy, but only one should dominate.

### Secondary
- related guide/article
- alternate continuation with a different job

### Not allowed
- hub-style CTA clutter
- multiple repeated CTA bands with the same destinations

---

## 5) Visual priority rules

## 5.1 Hub page visual rules

The hub should visually prioritize:
1. page identity
2. test handoff
3. type browsing
4. compact alternate entry paths
5. trust / explanation layers

### Hub visual character
- flatter and more operational
- more list / grid / navigation oriented
- less narrative
- more scan-friendly than immersive

### Hub anti-patterns
- oversized article-style text blocks
- giant dashboard-style stat blocks dominating the page
- deep content cards that look like mini type pages

## 5.2 Type page visual rules

The type page should visually prioritize:
1. type identity
2. interpretive explanation
3. work/collaboration/growth depth
4. continuation

### Type page visual character
- more narrative
- more typographic
- more singular
- less browse-heavy than the hub

### Type page anti-patterns
- hub-like 16-type browsing behavior
- long flat CMS dump without section emphasis
- too many equal-weight modules with no dominant interpretive center

## 5.3 Hub vs type page contrast rule

The two pages must not feel like the same template with different data.

### The hub should feel like
- a control surface
- a browse/decision page

### The type page should feel like
- a single-profile page
- a deep interpretation page

If both pages use the same visual weight distribution, users will not understand why both routes exist.

---

## 6) Summary-only rules

The following modules should likely remain summary-only on the hub:
- Hero Summary
- Quick Locate helper copy
- Scenario Router
- Career Preview intro copy
- Methodology
- FAQ answers

The following modules should not be summary-only by default on the type page:
- Type Summary
- Career Module
- Collaboration Module
- Growth Module

The rule is:

**summary on the hub, interpretation on the type page.**

---

## 7) Folding / collapsible rules

### Good candidates for folding
- hub Methodology
- hub FAQ
- secondary scenario hints
- extra utility/supporting CTA paths
- lower-priority related reading on type pages

### Poor candidates for folding
- hub primary Hero summary
- Quick Locate input
- Workbench primary inventory layer
- type-page core Hero
- type-page core summary

Use folding to reduce density, not to hide page identity.

---

## 8) Mobile behavior notes

## 8.1 Hub page mobile notes

The hub should preserve this reading order on mobile:
1. what this page is
2. how to start / locate
3. how to browse types
4. alternate entry modes
5. supporting trust layers

### Mobile rules for the hub
- keep Hero short
- keep Quick Locate visible early
- keep Workbench operational
- compress Scenario Router
- compress Career Preview
- fold Methodology and FAQ if needed

The page should not become an endless long-form wall on mobile.

## 8.2 Type page mobile notes

The type page should preserve:
1. type identity
2. core explanation
3. one clear next step

### Mobile rules for type pages
- keep the Hero and summary tightly stacked
- keep variant framing short
- preserve recommendation / verification action clarity
- fold tertiary reading modules before folding core type explanation

---

## 9) Risks if this UI spec is skipped

If this UI spec is skipped, the likely risks are:

1. the hub and type pages will continue to converge into one another
2. the hub will keep absorbing too many jobs
3. CTA duplication will return during implementation
4. content from the 16-file pack may be poured into the wrong page layer
5. the board may end up visually polished but structurally blurred
6. mobile density problems may be solved ad hoc instead of by page-role logic

The biggest risk is not visual inconsistency.
The biggest risk is that route boundaries will look correct in code but remain unclear in the product.

---

## 10) Recommended next step toward implementation spec

The recommended next document should probably be an implementation-facing spec that turns this UI spec into module contracts and data bindings.

A useful next document would likely define:
- module-to-data mapping
- which current modules survive unchanged
- which modules need content compression rules
- which hub fields are derived from the type pack
- how CTA normalization should be enforced

Recommended next document:
- `docs/personality-implementation-spec.md`

That document should bridge:
- IA
- UI module behavior
- content contracts
- implementation sequence

It should still avoid direct code, but it should be specific enough that implementation can begin without re-litigating page roles.
