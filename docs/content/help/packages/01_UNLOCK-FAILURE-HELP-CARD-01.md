# FermatMind Help Content Asset Package

> Status: **draft input only / not publishable**
> Owner: **GPT-5.5 Pro** for content drafting after operator approval
> Authority: **CMS/backend**
> Codex role: inventory, contract, QA, schema, routing, privacy gates only
> Prohibited: publish-ready FAQ/body/copy, CMS mutation, private URL access, raw order/payment/result identifiers

# 01 — UNLOCK-FAILURE-HELP-CARD-01

## Machine-Readable Front Matter

```yaml
asset_id: UNLOCK-FAILURE-HELP-CARD-01
asset_type: help_service_asset
priority: P0
reason: Most directly protects paid-user trust when payment succeeds but report unlock
  fails.
status: draft_input_only
publish_allowed: false
locale_policy: zh/en same policy
recommended_routes:
- /zh/help/unlock-failure
- /en/help/unlock-failure
operator_policy:
  support_channel: email
  unlock_failure_handling_time: 24 hours
  order_identifier_policy:
    public_help_pages: do not request raw orderNo
    primary_identity: purchase_email
    optional_private_support_identifier: masked order code or order number last 6
      characters
    raw_orderNo_allowed_only_if: support explicitly requests it in private email thread
    never_allowed_in:
    - public page
    - public form examples
    - URL
    - analytics payload
    - FAQ schema examples
required_user_info_safe:
- purchase_email
- test_name
- locale
- approximate_payment_time
- payment_amount
- issue_description
- masked_order_code_optional
forbidden_user_info_public:
- full_orderNo
- full_payment_id
- full_transaction_id
- full_result_url
- full_history_url
- screenshot_showing_private_url
- token
cms_fields:
- slug
- locale
- title
- summary
- body
- faq_items
- support_intent
- handling_time
- required_user_info
- forbidden_user_info
- pii_minimization_notice
- support_contact
- policy_version
- updated_at
- reviewer
- schema_enabled
- robots
- is_indexable
seo_schema_position:
  indexability: indexable after review
  schema: FAQPage only after approved visible FAQ exists
  canonical: self canonical public help route
  links_from:
  - result page help link
  - checkout help link
  - support hub
  - footer help
operator_unknowns:
- support_email
- exact escalation path
- whether support form will exist
```

## Purpose

Define the factual input required for a public help card explaining what users should do if payment succeeds but a paid report does not unlock.

## Content Scope for GPT-5.5 Pro

- Explain paid-but-not-unlocked cases.
- Explain the 24-hour handling expectation.
- Explain the email-first support path.
- Explain what safe information the user should provide.
- Explain what information the user should **not** post publicly.
- Do not promise instant unlock or automatic refund unless later confirmed.

## CMS Field Requirements

- `slug`
- `locale`
- `title`
- `summary`
- `body`
- `faq_items`
- `support_intent`
- `handling_time`
- `required_user_info`
- `forbidden_user_info`
- `pii_minimization_notice`
- `support_contact`
- `policy_version`
- `updated_at`
- `reviewer`
- `schema_enabled`
- `robots`
- `is_indexable`

## SEO / Schema Placement

- Public canonical Help route.
- FAQPage schema only after approved FAQ is visible and CMS-backed.
- Must not include private URL examples in page body or schema.
- Should be internally linked from result/paywall/support surfaces once approved.

## Codex QA Requirements

- Verify no raw order/result/payment identifiers in body, FAQ, schema, links, or examples.
- Verify Help CTA points only to public support route or mailto/contact route.
- Verify noindex is not used unless page is incomplete.
- Verify support data submission is PII-minimized.


## Global Boundaries

- Do not create final publish-ready copy in this package.
- Do not include raw `orderNo`, payment ID, transaction ID, result ID, attempt ID, token, or private result/order/history/share/payment URL examples.
- Public help pages must use public canonical routes only.
- FAQPage schema is allowed only after visible FAQ content is approved and exactly matches the CMS source.
- Missing facts must be marked `Unknown`; they must not be inferred as `0` or silently invented.
- GA4/Baidu are observation layers, not payment truth.
- Backend orders/payment/entitlement records remain the source of truth for payment, unlock, refund, and report-ready status.
