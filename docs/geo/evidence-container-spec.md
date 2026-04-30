# FermatMind Evidence Container Spec

Status: P1 documentation standard
Owner: SEO/GEO strategy and CMS/API surface owners
Applies to: public, indexable FermatMind pages only
Non-goal: this document does not change runtime pages, CMS schemas, or API contracts

## 1. Purpose

FermatMind GEO work has two different jobs:

1. Citation selection: an AI search or answer engine chooses FermatMind as a source.
2. Citation absorption: the generated answer actually uses FermatMind definitions, comparisons, steps, career suggestions, evidence, or safety boundaries.

The Evidence Container is the page-level content standard for improving absorption after selection. It is not a schema type by itself and it is not a replacement for `seo_surface_v1`, `landing_surface_v1`, or `answer_surface_v1`.

Research context should be treated as descriptive, not causal. The cited GEO paper reports that high-influence fetched pages tend to be longer, more modular, semantically aligned with prompts, and rich in evidence genres such as definitions, numbers, comparisons, and how-to steps. It also reports that Q&A format alone does not reliably improve absorption. FermatMind should therefore not treat FAQ-only pages as complete GEO pages.

Platform behavior should also be interpreted descriptively. The research reports that Perplexity and Google cite a broader set of sources, while ChatGPT cites fewer sources but shows higher mean fetched-page influence in the studied sample. This does not prove a universal platform rule. FermatMind should measure selection and absorption separately per platform instead of optimizing for citation count alone.

## 2. Evidence Container Blocks

Each public page may include a bounded set of the following blocks. Blocks should be visible HTML first, then mirrored in `answer_surface_v1` or future extensions when available.

### Quick Answer

Purpose: give a direct, short answer to the page's core question.

Requirements:
- 1 to 3 short paragraphs or bullets.
- Plain language.
- Include the page's core entity, test, type, topic, or career term.
- Avoid promotional wording as the primary answer.

Use when:
- test detail page answers what the test measures.
- article detail answers the article's main question.
- topic/personality/career pages answer what the page is about.

Do not use as:
- a hidden SEO-only snippet.
- a substitute for full page content.

### Definition Block

Purpose: define a term in FermatMind's own language.

Requirements:
- Term name.
- Short definition.
- Scope boundary: what the term does and does not mean.
- Optional related terms.

Examples:
- MBTI
- Big Five
- Growth ID
- RIASEC
- INFJ
- career fit

### Comparison Block

Purpose: help AI systems and users distinguish similar concepts.

Requirements:
- Compare two to five concepts.
- Include dimensions, not just pros/cons.
- State when each concept is useful.
- Include caveats where needed.

Examples:
- MBTI vs Big Five.
- RIASEC vs personality tests.
- depression screening vs diagnosis.
- career guide vs career job detail.

### How-to / Procedure Block

Purpose: provide steps that can be reused in answer generation.

Requirements:
- Ordered steps.
- Each step should contain an action and decision criterion.
- Avoid vague inspiration-only phrasing.

Examples:
- how to use a test result for career decisions.
- how to compare two personality frameworks.
- how to interpret a screening result safely.

### Evidence / Facts Block

Purpose: provide bounded factual anchors.

Requirements:
- Facts, numbers, definitions, source refs, or method notes where available.
- No invented statistics.
- Distinguish FermatMind product facts from external research facts.
- Include date or version when the fact is versioned.

Examples:
- question count.
- form code.
- result model.
- reviewer or last-reviewed date.
- method boundary.

### Caveat / Boundary Block

Purpose: protect against overclaiming and make limitations easy to cite.

Requirements:
- State what the page cannot determine.
- State when professional or domain-specific judgment is needed.
- On mental-health pages, include non-medical language and crisis boundary.

Examples:
- personality tests do not define the whole person.
- career suggestions are decision support, not placement guarantees.
- online depression screening is not a diagnosis.

### FAQ Block

Purpose: answer common follow-up questions.

Requirements:
- Must match visible page content.
- Should not be the only GEO block.
- Prefer two to six strong FAQs over many thin entries.
- FAQ schema, if used, must match visible FAQ.

Do not use:
- hidden FAQ schema.
- invented FAQ not visible on the page.
- FAQ-only pages as complete GEO replacements.

### Next Step Block

Purpose: connect the answer to the next useful action.

Requirements:
- Maximum three primary next steps in `llms-full`.
- Links must be canonical, public, indexable, and final.
- No private flows such as result, order, share, payment, or take pages.

### Related Links

Purpose: expose clean internal graph context.

Requirements:
- Canonical public links only.
- Should support the current page topic.
- Avoid career job detail links until career availability gates pass.

### Last Reviewed / Reviewer

Purpose: make review freshness visible when available.

Requirements:
- Date.
- Reviewer or reviewer role if available.
- Content owner if available.

This field is optional until the CMS/API contract explicitly supports it.

## 3. Page Type Mapping

| Page type | Required blocks | Recommended blocks | Notes |
| --- | --- | --- | --- |
| Test detail | Quick Answer, Definition, Caveat, Next Step | Comparison, FAQ, Evidence/Facts | Must include question count, duration, form code, and safety boundary when available. |
| Article detail | Quick Answer, Definition or Comparison, Next Step | FAQ, Evidence/Facts, Caveat | PR-12 already renders existing `answer_surface_v1`; future work should add richer block taxonomy through backend surfaces. |
| Personality detail | Quick Answer, Definition, Caveat, Next Step | Comparison, career suggestions, FAQ | Avoid treating type as destiny. |
| Topic detail | Quick Answer, Definition, Comparison, Related Links | FAQ, Evidence/Facts | Topic pages should be strong concept hubs, not only link lists. |
| Career guide | Quick Answer, How-to, Caveat, Next Step | Evidence/Facts, Comparison, FAQ | Should provide reusable steps and career decision boundaries. |
| Career job detail | Quick Answer, Evidence/Facts, Caveat, Next Step | How-to, comparison to adjacent roles | Only after performance, 404, indexability, sitemap, and llms gates pass. |
| Mental-health test | Quick Answer, Caveat, Definition, Next Step | FAQ, Evidence/Facts | Optimize for safe boundary explanation, not diagnosis or clinical authority. |

## 4. Mental-health GEO Rule

Mental-health and emotional screening pages optimize for responsible limitation, not diagnosis.

Rules:
- Do not claim to diagnose depression, anxiety, or any condition.
- Do not claim to provide treatment.
- Do not imply the result replaces a doctor, therapist, psychiatrist, counselor, or emergency service.
- The target absorption is safe wording such as: "online screening can support self-reflection but is not a medical diagnosis."
- Crisis language must direct users to local emergency services or qualified professionals.

## 5. Career GEO Rule

Career job pages remain blocked from pSEO, paid landing, backlink targeting, sitemap, llms, and llms-full featured exposure until performance, 404, indexability, and availability gates pass.

Future career pages must use Evidence Containers. Thin AI-generated job text is not acceptable. Career content should contain:
- role definition.
- task evidence.
- capability and interest fit.
- adjacent role comparison.
- decision steps.
- limitations and market/context caveats.

## 6. Relationship to Existing Surfaces

Current contracts remain valid:
- `seo_surface_v1`: canonical, robots, indexing, metadata, schema-oriented SEO surface.
- `landing_surface_v1`: entry-page narrative, CTA, and discoverability surface.
- `answer_surface_v1`: answer-first blocks already consumed by article detail and `/llms-full.txt`.

Evidence Container is a content design standard. Runtime implementation should remain backend/CMS authoritative.

## 7. Quality Gates

A page may be considered Evidence Container ready when:
- primary answer is visible in HTML.
- at least one non-FAQ evidence genre is present.
- caveats are visible where risk exists.
- next steps are canonical and public.
- FAQ, if present, matches visible content.
- `llms-full.txt` can summarize the page without private, redirect, noindex, or non-canonical URLs.

## 8. Anti-patterns

Avoid:
- FAQ-only GEO pages.
- hidden schema not reflected in visible content.
- generic AI-written summaries without CMS ownership.
- thin comparison tables with no decision criteria.
- medical, career, or personality overclaiming.
- career job pSEO before gates pass.
- using Product or SoftwareApplication schema to compensate for weak canonical or content structure.

## 9. Recommended PR Sequence After PR-14

1. Evidence Container rendering for one page family at a time.
2. `answer_surface_v1` extension PR after backend contract review.
3. read-only GEO monitor script PR using the prompt panel.
4. controlled 30-day rewrite experiment on 10 selected pages.
5. career pSEO only after career gates pass.
