# Schema And Hreflang Rollout Rules

Schema and hreflang are separate rollout lanes. Do not enable both implicitly in one task.

Schema and hreflang are not part of normal daily article release. Use separate tasks such as:

- `SEO-OPS-ARTICLE-SCHEMA-ELIGIBILITY-REVIEW-00`.
- `SEO-OPS-BILINGUAL-HREFLANG-ROLLOUT-REVIEW-00`.

## Schema Readiness

Before schema rollout, confirm:

- article identity lock passed.
- public URLs return 200.
- robots/indexability state is expected.
- canonical is correct.
- title is present.
- description is present.
- image is public and not a placeholder.
- published time is present.
- modified time is present.
- author is present.
- publisher is present.
- claim gate remains safe.

If publisher is missing, decision is `NO_GO_FOR_SCHEMA_ROLLOUT`.

## Granular Schema Gates

Schema must support independent gates:

- Article schema.
- Breadcrumb schema.
- FAQ schema.

FAQ schema defaults to hold unless visible FAQ parity and the claim gate pass. Article + Breadcrumb may roll out together only when FAQ remains disabled and public QA proves `FAQPage` count is 0.

Required post-rollout QA:

- JSON-LD count.
- JSON-LD types.
- Article/BlogPosting canonical.
- image URL.
- author.
- publisher.
- BreadcrumbList item URLs.
- FAQPage count = 0 unless separately approved.
- no private URL, token, order, result, payment, user, or report IDs.

## Hreflang Readiness

Before hreflang rollout, confirm:

- article identity lock passed.
- zh/en public canonicals return 200.
- reciprocal alternates are correct.
- each page self-references its canonical locale.
- x-default policy is explicit.
- sitemap/alternate behavior is consistent when applicable.
- no orphan locale.
- no wrong language route.
- no private, preview, admin, or tokenized route.
- public smoke passed.
- schema side effects are unchanged.

## Hreflang Output

Record:

- `hreflang="en"` target.
- `hreflang="zh-CN"` target.
- `hreflang="x-default"` target or explicit no-x-default policy.

Do not use preview, admin, draft, private, or tokenized URLs.

## Decisions

- `GO_FOR_SCHEMA_ROLLOUT_APPROVAL`
- `NO_GO_FOR_SCHEMA_ROLLOUT`
- `SCHEMA_ROLLOUT_COMPLETED`
- `GO_FOR_HREFLANG_ROLLOUT_APPROVAL`
- `NO_GO_FOR_HREFLANG_ROLLOUT`
- `HREFLANG_ROLLOUT_COMPLETED`
- `BLOCKED_NEEDS_OPERATOR_INPUT`
