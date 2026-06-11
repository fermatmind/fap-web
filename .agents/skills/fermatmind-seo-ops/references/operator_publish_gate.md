# Operator Publish Gate

Purpose: produce the human publish review packet.

Required output: `READY_FOR_OPERATOR_PUBLISH_REVIEW.md` using `assets/operator_publish_review_template.md`.

Include:

- Publishable items.
- Blockers.
- Risks.
- Required operator confirmations.
- Whether publish is allowed.
- Whether indexable is allowed.
- Whether sitemap eligible is allowed.
- Whether llms eligible is allowed.
- Whether schema is allowed.
- Whether hreflang is allowed.
- Whether ISR revalidation is allowed.
- Whether Search Channel enqueue or submit is allowed.

Decision values:

- `APPROVED_BY_OPERATOR` only when explicit operator approval text is present.
- `HOLD_FOR_OPERATOR_REVIEW` by default.
- `NO_GO_FOR_PUBLISH` for blockers.

No-go: do not publish or mutate CMS.
