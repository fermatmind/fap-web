# Big Five Methodology Candidate Cluster Matrix

Task: `BIG5-METHODOLOGY-CANDIDATE-CLUSTER-MATRIX-01`

Verdict: `PLANNING_ONLY`

This matrix defines 8 planning candidates for future Big Five methodology/trust/science work. It consumes the source authority packet and claim/privacy/safety packet as merged dependencies, but it does not generate methodology pages, CMS packages, publishable body copy, final title/meta, schema, sitemap, llms, hreflang, canonical, noindex, search submissions, provider calls, runtime changes, analytics instrumentation, private-result access, backend asset-agent commands, deploys, or fap-api mutations.

## Dependencies

- `BIG5-METHODOLOGY-SOURCE-AUTHORITY-PACKET-01` is merged through fap-web PR #1410, merge commit `d58cc55b420b7bfeac32622764267852e42578e4`.
- `BIG5-METHODOLOGY-CLAIM-PRIVACY-SAFETY-PACKET-01` is merged through fap-web PR #1412, merge commit `908b8c080e9b43476722a5816836c10460ccd430`.

## Candidate Families

- `big5_science_contentpage_methodology_boundary`
- `big5_method_boundaries_and_item_design`
- `big5_reliability_validity_caveat`
- `big5_data_privacy_and_share_boundary`
- `big5_common_misconceptions_claim_correction`
- `big5_cross_scale_method_comparison`
- `big5_internal_link_navigation_candidates`
- `source_ledger_and_cms_review_readiness`

## Planning Candidates

The matrix contains 8 planning candidates. Each candidate requires GPT-5.5 review, Safety Gate review, SEO/GEO review, source evidence, backend/CMS authority requirements, a review ledger requirement, and explicit HOLD actions before any downstream CMS dry run.

High-risk candidates are:

- `big5-reliability-validity-caveat-01`
- `big5-source-ledger-cms-review-readiness-01`

These remain blocked until a public methodology source ledger, CMS review ledger, and source-supported measurement caveats exist.

## Route Boundary

The six public ContentPage routes stay CMS/backend-authoritative:

- `/science`
- `/method-boundaries`
- `/item-design-notes`
- `/reliability-validity`
- `/data-privacy`
- `/common-misconceptions`

This matrix is not public copy for those routes. It does not enable `FAQPage`, schema exposure, sitemap inclusion, llms inclusion, search submission, or indexability changes.

## Forbidden Payloads

The matrix blocks publishable article body, CMS payload, final title/meta, generated methodology page content, private-result-based methodology content, private report text rewrite, raw-score or percentile based content, deterministic trait assignment, official 32-type claims, fixed-type claims, clinical or therapy claims, hiring prediction, salary prediction, performance prediction, success prediction, and life-outcome prediction.

## Negative Guarantees

- publishable body included: false
- CMS payload included: false
- final title/meta included: false
- generated page content included: false
- private result based content included: false
- raw score based content included: false
- deterministic trait assignment included: false
- CMS write performed: false
- publish performed: false
- search submission performed: false
- runtime changed: false
- analytics instrumentation added: false
- fap-api modified: false
