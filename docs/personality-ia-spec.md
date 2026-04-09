# personality-ia-spec.md

Status: V1 Draft  
Scope: Personality board only  
Primary routes covered:
- `/[locale]/personality`
- `/[locale]/personality/[type]`

This document defines the first complete IA draft for FermatMind’s “人格” board.

It is based on the current live board, the existing asset inventory of 16 MBTI type files, and the routing/role scan already completed.

This is not a UI polish brief.  
This is not a final visual design document.  
This is a **page-role and information architecture specification**.

---

## 1) Core decision

The personality board is defined as:

**MBTI 16 型人格的决策中枢页（Decision Hub）**

It is not:
- a full MBTI encyclopedia
- a generic personality library
- a career directory
- a search product
- a topic center replacement
- a test landing page replacement

It is:
- the front door for the MBTI/16-type board
- the place where users decide how to enter
- the place where users browse and compare the 16 types
- the place where users move from type curiosity into test, type detail, or recommendation

---

## 2) Product role statement

The personality board must help users do three things:

1. understand what this board is for  
2. choose how to enter  
3. move into the next correct layer

The board must answer:

- Is this a place to start the MBTI test?
- Is this a place to browse the 16 types?
- Is this a place to move from type understanding into career or collaboration judgment?

The answer is:

**Yes — but only in a controlled, layered way.**

---

## 3) Page tree

## 3.1 Approved route tree for current phase

The approved minimum route tree is:

```text
/[locale]/personality
/[locale]/personality/[type]
```

These are the only personality-board routes that should be treated as first-class in the current phase.

## 3.2 Related but external routes

These routes remain valid and may be linked to, but they are **not** owned by the personality board:

```text
/[locale]/tests/mbti-personality-test-16-personality-types
/[locale]/tests/mbti-personality-test-16-personality-types/take
/[locale]/topics/mbti
/[locale]/career/recommendations
/[locale]/career/recommendations/mbti/[type]
/[locale]/career/jobs/[slug]
```

The personality board may hand users off to them, but must not duplicate their primary jobs.

## 3.3 Deferred routes

These routes are intentionally deferred and are **not** part of the current IA:

```text
/[locale]/personality/career
/[locale]/personality/teamwork
/[locale]/personality/library
```

They may be considered later only if the board accumulates enough unique page-level responsibility to justify them.

Current rule:

* do not create them now
* do not design the hub around their future existence
* do not preload their jobs into the hub

---

## 4) Route role contracts

## 4.1 `/[locale]/personality`

### Primary role

**MBTI decision hub**

### It must do

* introduce the personality board clearly
* provide a direct MBTI test start path
* provide a full 16-type browsing surface
* offer limited scenario-based guidance
* offer limited recommendation preview to prove downstream value exists
* support quick search / quick locate
* support a compact method and FAQ layer

### It must not do

* replace the MBTI test landing page
* replace the MBTI topic center
* become a full career recommendation directory
* become a long-form article page
* become a generic glossary/library
* become a dashboard of statistics with no clear next step
* become a dumping ground for deep type content

### Allowed CTA types

Only these CTA families are allowed on the hub:

1. Start / continue MBTI test
2. Open a specific type page
3. Open recommendation detail or recommendation index as a secondary continuation

### CTA types that should not dominate

* duplicate topic-center CTAs
* repeated global “start now” variants that point to the same destination
* extra “learn more” flows that do not create a new decision path

---

## 4.2 `/[locale]/personality/[type]`

### Primary role

**Single-type profile page**

### It must do

* explain one type clearly
* separate the general type from A/T or similar sub-variants if applicable
* connect the type to career, collaboration, and growth
* give the user a clear path into:

  * MBTI verification / test
  * career recommendation detail
  * relevant guides/articles

### It must not do

* carry the full 16-type system
* repeat the hub’s search and directory jobs
* repeat a full board-wide scenario matrix
* become a replacement for the career recommendation detail page

### Allowed CTA types

1. Start / verify MBTI test
2. Open this type’s recommendation path
3. Open related guide/article

---

## 5) IA principle for the board

The hub page is currently overloaded because it tries to do too many first-order jobs at once.

This specification resolves that overload with one simple rule:

### Rule

**The hub may preview many directions, but it may deeply own only one thing: the 16-type decision hub experience.**

That means:

* the hub can preview career relevance

* but it cannot become a career directory

* the hub can preview scenario entry

* but it cannot become the main scenario product

* the hub can explain methodology

* but it cannot turn into an MBTI theory page

* the hub can start the test

* but it cannot become a duplicate of the MBTI test landing page

---

## 6) `/personality` section stack

The hub page should keep only the sections that support its core job.

## 6.1 Approved section stack

1. Hero Summary
2. Quick Locate
3. Type Navigator Workbench
4. Scenario Router (compact)
5. Career Preview (compact)
6. Methodology
7. FAQ

This is the maximum approved stack for the hub in the current phase.

## 6.2 Section-by-section role contract

### 1. Hero Summary

#### Job

State what the board is and provide the primary test-start action.

#### Must include

* page identity
* one primary MBTI test handoff
* one secondary board-level continuation if justified
* short summary only

#### Must not include

* long educational text
* deep recommendation content
* duplicate utility CTAs that repeat the same action

---

### 2. Quick Locate

#### Job

Provide a practical jump tool for users who already know a type code or relevant job keyword.

#### Must include

* fast utility search / quick locate
* immediate jump behavior

#### Must not include

* full search-product complexity
* heavy autocomplete logic that turns the page into a search-first tool

---

### 3. Type Navigator Workbench

#### Job

Act as the true 16-type browsing and comparison layer.

#### Must include

* all 16 types
* a coherent group/family structure
* a clear primary action into each type page
* a clear secondary action into recommendations if present

#### Must not include

* excessive explanatory copy
* large educational text blocks
* repeated test-entry CTAs on every card unless justified

This is one of the **core identity sections** of the hub and should remain.

---

### 4. Scenario Router (compact)

#### Job

Help users enter by use case when they do not want to begin with type browsing.

#### Approved use cases

The hub may support compact scenario entry such as:

* career
* major / study
* teamwork
* relationship
* growth

#### Must include

* short scenario framing
* a compact path into the relevant next step

#### Must not include

* a second full hub inside the hub
* giant matrices with multiple nested CTA layers
* full scenario-specific content bodies

This section must stay **compact**.

---

### 5. Career Preview (compact)

#### Job

Prove that the board connects to real recommendation depth.

#### Must include

* a limited preview of recommendation logic
* evidence that downstream recommendation detail exists
* a route into career recommendation surfaces

#### Must not include

* a full career wall
* job directory density
* large recommendation grids that dominate the page

This section must remain a **preview**, not a destination.

---

### 6. Methodology

#### Job

Explain how to use the board correctly.

#### Must include

* what the board helps with
* what it does not replace
* what to do next if users want more certainty

#### Must not include

* long MBTI primer content
* duplicated FAQ copy
* essay-style methodology pages

Methodology must be:

* short
* practical
* operational

---

### 7. FAQ

#### Job

Reduce confusion and support structured SEO.

#### Must include

* practical, repeated user questions
* answers that remove decision friction

#### Must not include

* generic MBTI article content
* duplicates of long methodology prose
* broad theory content better suited to topic pages

FAQ should stay **compact**.

---

## 7) What must move off the hub

The hub must stop carrying content that properly belongs to the type pages or external routes.

## 7.1 Move to `/personality/[type]`

The following belongs on the type page, not the hub:

* deep type narrative
* detailed strengths / risks
* full A/T or sub-variant distinction
* type-specific collaboration patterns
* type-specific growth planning
* deep career explanation for one type
* linked guides and articles centered on one type

## 7.2 Move to external routes

The following belongs elsewhere:

### MBTI test landing page

* full cold-start persuasion for taking the test
* all test-specific explanation
* test logistics and onboarding

### Topic center

* MBTI article clusters
* educational topic exploration
* reading-first information architecture

### Career recommendations

* full recommendation directory
* broad job-browsing grids
* job-level recommendation comparisons

---

## 8) What stays on the hub

These content families are approved to remain on `/personality`:

* board-level summary
* test handoff
* quick locate
* 16-type workbench
* compact scenario router
* compact career preview
* compact method
* compact FAQ

Everything else must justify itself or move down a level.

---

## 9) CTA policy

The hub page currently has too many CTAs that point to too few real destinations.
This must be normalized.

## 9.1 Allowed CTA hierarchy on `/personality`

### Primary CTA

* Start MBTI test

### Secondary CTA family

* Open a type page
* Open a recommendation detail/index page

### Utility CTA family

* quick search / quick locate actions
* anchor jumps within the page if truly useful

## 9.2 Forbidden CTA behavior

Do not allow:

* multiple near-identical test start CTAs in adjacent sections
* repeated “go to MBTI topic center” CTAs across the page
* repeated recommendation directory CTAs without new context
* section-level CTAs that restate the same destination with no new decision value

---

## 10) Personality content contracts

The asset scan shows that the 16 type content package is largely type-page-ready, not hub-ready.

So this spec defines two separate content contracts:

---

## 10.1 `PersonalityHubContent`

Use this for `/personality`.

```ts
type PersonalityHubContent = {
  hero: {
    eyebrow?: string;
    title: string;
    summary: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta?: {
      label: string;
      href: string;
    };
  };

  quickLocate: {
    title: string;
    placeholder: string;
    helperText?: string;
  };

  familyGroups: Array<{
    code: string;
    title: string;
    summary: string;
    types: Array<{
      code: string;
      label: string;
      href: string;
    }>;
  }>;

  typeWorkbench: Array<{
    code: string;
    nameZh: string;
    shortDefinition: string;
    href: string;
    recommendationHref?: string;
  }>;

  scenarioMatrix: Array<{
    key: string;
    title: string;
    summary: string;
    href: string;
  }>;

  careerPreview: {
    title: string;
    summary: string;
    featuredRoutes: Array<{
      label: string;
      href: string;
    }>;
  };

  methodology: {
    title: string;
    summary: string;
    bullets: string[];
  };

  faq: Array<{
    question: string;
    answer: string;
  }>;
};
```

### Contract rule

Hub content must be:

* summary-grade
* decision-supportive
* short
* non-duplicative

Hub content must not absorb deep type content.

---

## 10.2 `PersonalityTypeContent`

Use this for `/personality/[type]`.

```ts
type PersonalityTypeContent = {
  typeCode: string;
  typeNameZh: string;
  title: string;
  coreDefinition: string;
  summary: string;

  baseProfile: {
    shortIntro: string;
    strengths: string[];
    risks: string[];
  };

  variants?: {
    a?: {
      label: string;
      definition: string;
      strengths: string[];
      risks: string[];
    };
    t?: {
      label: string;
      definition: string;
      strengths: string[];
      risks: string[];
    };
  };

  collaboration: {
    summary: string;
    strengths: string[];
    risks: string[];
  };

  growth: {
    summary: string;
    bottlenecks: string[];
    advice: string[];
  };

  career: {
    summary: string;
    strengths: string[];
    risks: string[];
    nextStepHref?: string;
  };

  relatedGuides: Array<{
    label: string;
    href: string;
  }>;

  ctas: {
    test: {
      label: string;
      href: string;
    };
    recommendation?: {
      label: string;
      href: string;
    };
  };
};
```

### Contract rule

The 16 uploaded `.docx` files should be normalized toward this schema.
They should not be poured raw into the hub page.

---

## 11) Asset mapping rules

Based on the content inventory:

### 11.1 Content package status

The 16 MBTI docs are:

* largely consistent
* rich enough for type pages
* too deep for the hub
* close to JSON-ready
* missing explicit FAQ segmentation and machine-friendly route/CTA normalization

### 11.2 Mapping rule

* Use the content package as the **primary source** for `/personality/[type]`
* Derive only short summaries from it for `/personality`
* Do not duplicate long type content on the hub
* Normalize A/T sections into machine-readable variant fields
* Normalize CTA references into route enums or explicit links

### 11.3 Hub summary extraction rule

For each type file, only extract hub-level fields such as:

* shortDefinition
* short work-style line
* route label
* optional recommendation hint

Do not extract:

* full strengths/risk blocks
* A/T narrative depth
* long career application text
* long collaboration/growth explanations

---

## 12) Hub content design rules

The hub should feel like:

* a decision workspace
* a type browsing surface
* a compact front door

The hub should not feel like:

* a long article
* a directory wall
* a second test landing page
* a recommendation board pretending to be a personality page

### 12.1 Hub writing rules

* write shorter than type pages
* write more operationally than encyclopedically
* explain just enough to move users
* do not drift into generic MBTI prose

### 12.2 Hub visual hierarchy rule

Visual hierarchy must reflect page-role hierarchy:

1. page identity
2. primary test handoff
3. type browsing
4. scenario routing
5. career preview
6. trust / method
7. FAQ

If a lower section becomes heavier than a higher one, the page role will blur again.

---

## 13) Type page design rules

Type pages should feel:

* singular
* specific
* deeper
* more type-owned
* more actionable in relation to work, growth, and collaboration

They should not feel like:

* mini encyclopedias
* general MBTI pages with a type label swapped in
* duplicate copies of the hub

Each type page must create a stronger reason to continue than the hub can.

---

## 14) Search / Quick Locate rule

Quick Locate is allowed on `/personality`, but it is a **utility**.
It must not redefine the page as a search-first product.

Rules:

* keep it fast
* keep it compact
* make it support the board
* do not let it dominate the hero identity

---

## 15) Recommendation relationship rule

The relationship between the personality board and career recommendations must be:

**preview → handoff**, not **preview → replacement**

That means:

* the hub may preview recommendation depth
* type pages may preview recommendation relevance
* but recommendation detail and recommendation directories remain separate products

---

## 16) Topic center relationship rule

The relationship between the personality board and the MBTI topic center must be:

**hub → topic handoff**, not **hub = topic center**

That means:

* the hub may link to the topic center
* but it should not duplicate topic-center depth
* if a section begins to behave like article navigation, it likely belongs elsewhere

---

## 17) Future route gates

Deferred routes may only be created if they meet real thresholds.

### `/personality/career`

Only create if:

* career-oriented personality content grows beyond preview-level
* users need a genuine intermediate layer between hub/type and recommendation detail

### `/personality/teamwork`

Only create if:

* teamwork content becomes a coherent product layer
* current scenario routing is no longer enough

### `/personality/library`

Only create if:

* a real personality knowledge library exists
* article inventory and reference logic justify a separate route

Until then:

* do not create them
* do not design the hub as though they already exist

---

## 18) Open questions

These items are intentionally left open for later implementation detail:

1. Should the secondary hub CTA point to `/topics/mbti` or be removed entirely?
2. Should Executive Snapshot remain as a persistent board element or be reduced further?
3. Should Quick Locate search both type codes and job titles, or only type-related entities?
4. Should the career preview on the hub point to a general recommendation index, or only to type-linked recommendations?
5. Should A/T variant pages ever become their own routes, or remain internal to `[type]` pages?

These questions do not block the current IA draft.
They should be resolved only after the page-role contract is implemented.

---

## 19) Immediate implementation implications

This spec implies the following implementation order:

### Phase 1

Stabilize the route roles:

* `/personality`
* `/personality/[type]`

### Phase 2

Define and implement:

* `PersonalityHubContent`
* `PersonalityTypeContent`

### Phase 3

Normalize the 16 type docs into the type schema.

### Phase 4

Refactor the hub UI so it behaves like a decision hub, not a mixed-role landing page.

### Phase 5

Refactor type pages to consume the normalized type schema.

---

## 20) Final definition

The final working definition for this first IA draft is:

### `/personality`

A compact MBTI decision hub that helps users:

* start the test
* browse the 16 types
* enter by scenario
* preview downstream career relevance

### `/personality/[type]`

A deep single-type page that helps users:

* understand one type
* understand its A/T nuance if present
* connect it to work, collaboration, and growth
* continue into recommendation or verification

That is the boundary.
Everything else should either move down one level or stay in adjacent products.
