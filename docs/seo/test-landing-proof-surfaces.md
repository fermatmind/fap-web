# Test Landing Proof Surfaces Contract

Task id: `TEST-LANDING-PROOF-SURFACE-01`
PR title: `docs(seo): define source-backed test landing proof surfaces`

Runtime behavior changed: no.
CMS changed: no.
Publishable page copy included: no.
Reviews, ratings, completions, or user counts invented: no.
Deployment required: no.

## Purpose

This contract defines the source-backed proof fields that homepage, MBTI, RIASEC, and Big Five landing surfaces need before they can safely receive organic or commercial traffic. It is a readiness and rendering contract only. It does not write homepage copy, test page body copy, CMS content, reviews, ratings, completion counts, runtime behavior, publishing actions, or deployment instructions.

## Authority Boundary

| Area | Authority | Rendering rule |
| --- | --- | --- |
| Page copy | Backend CMS fields filled later by GPT-5.5 Pro and approved by the content owner | `fap-web` renders only approved CMS/public API fields. |
| Test form facts | Backend public test metadata, public scale registry, or existing fixed product form metadata | Renderer may show question counts, duration, and forms only from source-backed fields. |
| Commercial offer facts | Backend commerce/offer read model | Renderer must hide or neutralize paid claims when offer truth is unavailable. |
| Proof metrics | Backend or analytics read models with owner, query, timestamp, and review status | Renderer must not invent totals, ratings, reviews, media proof, or testimonials. |
| FAQ and schema | Visible CMS/API FAQ blocks and visible page facts | JSON-LD must not contain hidden FAQ, Review, AggregateRating, Product, or Offer data. |
| Codex role | QA and rendering contract only | Codex validates fields, source rules, schema rules, internal links, and mobile CTA behavior. |

## Homepage First Viewport

The homepage first viewport should explain the structure of the product experience, not write new marketing paragraphs in frontend code. The first viewport needs CMS/API fields for:

- which priority tests are available and why a user might choose each one
- what the user gets before starting a test
- how the assessment method is bounded and where the method facts come from
- expected time and available forms
- what is free, what is paid, and which layer owns offer truth
- whether proof metrics are available, unavailable, or intentionally hidden
- one mobile-first primary CTA and secondary comparison links

The homepage must not display a user count, completion count, rating, review count, expert endorsement, media quote, or trust badge unless the backing source is present in the proof read model and approved for public rendering.

## Priority Test Pages

| Surface | Canonical route | Required proof fields |
| --- | --- | --- |
| MBTI | `/tests/mbti-personality-test-16-personality-types` | canonical slug, scale code, form inventory, question counts, estimated minutes, method/source summary field, free result scope field, paid report scope field, FAQ source, schema source, internal links, mobile CTA contract, optional proof metric slots. |
| RIASEC | `/tests/holland-career-interest-test-riasec` | canonical slug, scale code, `riasec_60` and `riasec_140` forms, question counts, estimated minutes, career-interest boundary field, free result scope field, paid report scope field, FAQ source, schema source, internal links, mobile CTA contract, optional proof metric slots. |
| Big Five | `/tests/big-five-personality-test-ocean-model` | canonical slug, scale code, `big5_120` and `big5_90` forms, question counts, estimated minutes, five-factor boundary field, free result scope field, paid report scope field, FAQ source, schema source, internal links, mobile CTA contract, optional proof metric slots. |

Proof metric slots are optional by default. If the source is missing, stale, private, or not approved, the renderer must hide the slot or show an empty/unknown state. It must not convert `Unknown` into `0`.

## Free And Paid Boundary

The boundary may be represented as fields and layout slots only:

- `free_result_scope`: CMS/API field explaining which result layer is free.
- `paid_report_scope`: CMS/API field explaining which deeper report layer is paid.
- `offer_price`: backend commerce read model only.
- `offer_currency`: backend commerce read model only.
- `unlock_entitlement`: backend entitlement truth only.
- `cta_label`: CMS/API approved UI label.
- `cta_href`: route helper or backend-provided canonical route.

Codex must not write the copy for these fields. GPT-5.5 Pro may fill the CMS fields later after the field contract, source data, and owner approvals exist.

## FAQ And Schema Source

FAQ blocks must come from CMS/page-block or public API fields that are visible on the page. `FAQPage` JSON-LD may be emitted only for visible FAQ entries. `SoftwareApplication` JSON-LD may use visible test facts such as name, description, canonical URL, duration, question count, and form labels. `Review`, `AggregateRating`, `Product`, and `Offer` schema remain blocked until real public-safe source data exists and a separate schema contract approves rendering.

## Internal Links

Internal links are slot contracts, not authored copy:

- homepage priority test cards link to MBTI, RIASEC, and Big Five canonical routes
- homepage secondary links may link to the tests hub, category pages, or approved CMS article/topic routes
- MBTI may link to its take route, related priority tests, approved MBTI content routes, and approved result/help surfaces
- RIASEC may link to its take route, related priority tests, approved career center routes, and approved help surfaces
- Big Five may link to its take route, related priority tests, approved Big Five content routes, and approved result/help surfaces

Every slot needs a source owner, locale, canonical URL, and noindex/private-flow exclusion check.

## Mobile First CTA

Each surface needs one primary mobile CTA slot in the first viewport. The rendering contract is:

- primary CTA href resolves to a public canonical take or selector route
- CTA label is CMS/API approved and locale-specific
- free/paid boundary is visible near the CTA when paid unlock exists
- secondary CTAs do not push the primary CTA below the first mobile viewport
- private result, order, share, pay, checkout, and attempt URLs are never linked from public proof slots

## GPT-5.5 Pro Follow-Up CMS Fields

GPT-5.5 Pro should fill only CMS fields after source backing exists:

- `hero_value_summary`
- `method_summary`
- `form_selector_summary`
- `free_result_scope`
- `paid_report_scope`
- `proof_metric_labels`
- `proof_metric_source_notes`
- `faq_items`
- `schema_description`
- `internal_link_labels`
- `primary_cta_label`
- `secondary_cta_labels`
- `empty_proof_state`

These are field names and content responsibilities, not copy. Codex owns QA and contract validation for the fields, source references, rendering behavior, schema eligibility, and no-fake-proof gates.

## Repository Rule Impact

Repository rule impact: docs/contract/readiness only. This PR reinforces existing content authority rules: publishable landing content remains CMS/backend-authoritative; `fap-web` must not add frontend fallback content for CMS-backed surfaces; proof fields must be source-backed; and runtime behavior remains unchanged.
