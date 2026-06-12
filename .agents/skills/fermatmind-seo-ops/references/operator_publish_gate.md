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

## V1.1 release decision separation

For SEO articles, record these as independent operator decisions. Do not infer one from another:

- publish.
- make indexable.
- sitemap eligible.
- llms eligible.
- schema allowed.
- hreflang allowed.
- Search Channel enqueue.
- Search Channel live submission.
- GSC/Baidu/IndexNow/360/Sogou/Shenma action.
- ISR/content release revalidation.

If any decision is missing, mark it `hold` or `Needs operator confirmation`; do not default to allow.
