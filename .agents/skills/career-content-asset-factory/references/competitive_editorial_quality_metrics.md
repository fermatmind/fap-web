# Competitive Editorial Quality Metrics

This gate measures whether completed career content is useful enough for public staging review. It is a post-asset, pre-staging editorial layer. It does not replace schema validation, source traceability, block trust audits, integrated QA, or human approval.

## Metric Scale

Each metric is scored from `0` to `5`.

- `5`: strong, occupation-specific, reader-useful, and source-aware.
- `4`: usable with minor copy risk.
- `3`: safe but thin or somewhat generic.
- `2`: repair recommended before staging.
- `1`: public-quality failure.
- `0`: blocked or unsafe.

Rows below the configured threshold produce repair recommendations. The gate must not rewrite content by itself.

## Metrics

### occupation_specificity_score

Measures whether the row names real occupation workflows, tools, stakeholders, settings, decisions, constraints, and outputs. Generic wording such as "handle tasks", "communicate with others", or "review information" should score low unless it is tied to a concrete role context.

### workflow_density_score

Measures how much of the text describes concrete work activities rather than abstract career advice. Strong rows show task sequences, artifacts, tools, operating settings, and decision points.

### reader_usefulness_score

Measures whether a reader can make a better career exploration decision after reading. Strong rows answer "what would this work actually feel like, require, or ask me to prove?"

### template_reuse_score

Measures repeated phrases, repeated sentence skeletons, broad boilerplate, and cross-row sameness. Exact sentence uniqueness is not enough; slot-filled skeletons must also be treated as risk.

### locale_naturalness_score

Measures whether `zh-CN` reads as natural Chinese for mainland readers and `en` reads as natural English for US/UK/EU readers. It flags Chinese leakage in English rows, long English prose in Chinese rows, and machine-translation-like repetition.

### conversion_clarity_score

Measures whether the row gives a clear next action without manipulation, diagnosis, outcome guarantees, or hard-sell CTA language. Conversion copy should help users choose whether to continue with tests or deeper career review.

### competitive_depth_score

Measures whether the row is materially more useful than a generic career directory entry. It rewards role-specific constraints, tradeoffs, artifacts, and decision boundaries. It must not encourage invented facts or competitor copying.

### source_backed_claim_density_score

Measures whether meaningful claims are grounded in completed block references or source-backed assets. It penalizes unsupported claims, vague assertions, and facts that appear to be generated outside the block evidence chain.

### block_relevance_score

Measures whether each block contributes unique value instead of repeating other blocks. Identity should not duplicate salary; fit should not invent work facts; page assembly should not create new facts.

### reader_safe_boundary_score

Measures whether disclaimers and boundaries are reader-useful and concise. It penalizes overlong boilerplate, repeated legalistic warnings, and outcome promises.

## Verdict Guidance

- `editorial_ready`: no blocked findings and all important metrics are above threshold.
- `editorial_repair_required`: repairable content-quality issues remain.
- `blocked`: unsafe claims, raw internal leakage, source traceability break, or high-risk unsupported claims.

## Non-Goals

This is not an SEO keyword stuffing gate, not a prose beautification gate, and not a generator. It must not push the agent to invent facts to look specific.
