# FermatMind Help Content Asset Package

> Status: **draft input only / not publishable**
> Owner: **GPT-5.5 Pro** for content drafting after operator approval
> Authority: **CMS/backend**
> Codex role: inventory, contract, QA, schema, routing, privacy gates only
> Prohibited: publish-ready FAQ/body/copy, CMS mutation, private URL access, raw order/payment/result identifiers

# 02 — PAYMENT-REFUND-FAQ-PACKAGE-01

## Machine-Readable Front Matter

```yaml
asset_id: PAYMENT-REFUND-FAQ-PACKAGE-01
asset_type: payment_refund_faq_package
priority: P0
reason: Defines the service boundary for paid users before commercial promotion.
status: draft_input_only
publish_allowed: false
locale_policy: zh/en same policy
recommended_routes:
- /zh/help/payment-refund
- /en/help/payment-refund
operator_policy:
  refund_allowed: true
  refund_window_days: 7
  refund_condition: user cannot obtain the complete purchased report
  support_channel: email
operator_decisions_still_needed:
- support_email
- refund handling time
- refund exclusions
- whether duplicate payments are automatically refunded
- whether partial report access affects eligibility
safe_user_info:
- purchase_email
- test_name
- locale
- approximate_payment_time
- payment_amount
- masked_order_code_optional
forbidden_public_info:
- full_orderNo
- payment provider transaction id
- bank/card data
- full result URL
- token
cms_fields:
- slug
- locale
- title
- summary
- body
- faq_items
- payment_region
- currency
- payment_method
- sku
- free_boundary
- paid_boundary
- refund_eligibility
- refund_exclusions
- refund_request_path
- refund_handling_time
- policy_effective_date
- policy_version
- reviewer
- updated_at
- schema_enabled
- robots
- is_indexable
seo_schema_position:
  indexability: indexable after legal/operator review
  schema: FAQPage
  canonical: self canonical public help route
  links_from:
  - paywall
  - checkout
  - support hub
  - footer help
```

## Purpose

Prepare the factual package for a payment/refund FAQ that tells users what they paid for, when refund requests are accepted, and how to contact support without leaking private identifiers.

## Content Scope for GPT-5.5 Pro

- Explain free vs paid service boundary.
- Explain refund window: 7 days.
- Explain refund eligibility: unable to obtain the complete report.
- Explain email support route.
- Explain safe information to include.
- Do not overpromise refund speed until operator confirms SLA.

## CMS Field Requirements

- `slug`
- `locale`
- `title`
- `summary`
- `body`
- `faq_items`
- `payment_region`
- `currency`
- `payment_method`
- `sku`
- `free_boundary`
- `paid_boundary`
- `refund_eligibility`
- `refund_exclusions`
- `refund_request_path`
- `refund_handling_time`
- `policy_effective_date`
- `policy_version`
- `reviewer`
- `updated_at`
- `schema_enabled`
- `robots`
- `is_indexable`

## SEO / Schema Placement

- Should eventually be a public Help page, not a hidden policy fragment.
- FAQPage schema can be enabled after visible FAQ is approved.
- Must not use private order/payment/result URL examples.

## Codex QA Requirements

- Confirm no raw identifiers.
- Confirm all purchase-truth wording points to backend/payment records, not GA4/Baidu.
- Confirm policy version/effective date fields exist before public release.


## Global Boundaries

- Do not create final publish-ready copy in this package.
- Do not include raw `orderNo`, payment ID, transaction ID, result ID, attempt ID, token, or private result/order/history/share/payment URL examples.
- Public help pages must use public canonical routes only.
- FAQPage schema is allowed only after visible FAQ content is approved and exactly matches the CMS source.
- Missing facts must be marked `Unknown`; they must not be inferred as `0` or silently invented.
- GA4/Baidu are observation layers, not payment truth.
- Backend orders/payment/entitlement records remain the source of truth for payment, unlock, refund, and report-ready status.
