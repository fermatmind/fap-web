# FermatMind Help Content Asset Package

> Status: **draft input only / not publishable**
> Owner: **GPT-5.5 Pro** for content drafting after operator approval
> Authority: **CMS/backend**
> Codex role: inventory, contract, QA, schema, routing, privacy gates only
> Prohibited: publish-ready FAQ/body/copy, CMS mutation, private URL access, raw order/payment/result identifiers

# 06 — DATA-DELETION-REQUEST-FAQ-01

## Machine-Readable Front Matter

```yaml
asset_id: DATA-DELETION-REQUEST-FAQ-01
asset_type: data_deletion_request_faq
priority: P1
reason: Supports long-term brand credibility and user control over data.
status: draft_input_only
publish_allowed: false
locale_policy: zh/en same policy
recommended_routes:
- /zh/help/data-deletion
- /en/help/data-deletion
operator_policy:
  data_deletion_allowed: true
  account_deletion_allowed: true
  support_channel: email
operator_decisions_still_needed:
- deletion handling SLA
- identity verification method
- what payment/compliance records must be retained
- whether deletion is hard delete or anonymization for analytics/reporting
safe_user_info:
- account_email
- request_type
- locale
- optional_masked_order_code_if_payment_related
forbidden_public_info:
- full_orderNo
- full_payment_id
- full_result_url
- ID card
- phone unless necessary
cms_fields:
- slug
- locale
- title
- summary
- body
- faq_items
- request_type
- handling_time
- retained_data_exceptions
- identity_verification_method
- support_contact
- policy_version
- updated_at
- reviewer
- schema_enabled
- robots
- is_indexable
seo_schema_position:
  indexability: indexable Help page
  schema: FAQPage after approval
  canonical: self canonical public help route
  links_from:
  - privacy policy
  - privacy-data help page
  - support hub
```

## Purpose

Prepare the factual package for a data deletion and account deletion FAQ that explains user rights without overpromising deletion of records outside FermatMind control.

## Content Scope for GPT-5.5 Pro

- Explain how users may request deletion.
- Explain account deletion path.
- Explain identity verification at a high level.
- Explain possible retained records if operator/legal confirms.
- Do not promise deletion of third-party payment-provider records unless confirmed.

## CMS Field Requirements

- `slug`
- `locale`
- `title`
- `summary`
- `body`
- `faq_items`
- `request_type`
- `handling_time`
- `retained_data_exceptions`
- `identity_verification_method`
- `support_contact`
- `policy_version`
- `updated_at`
- `reviewer`
- `schema_enabled`
- `robots`
- `is_indexable`

## SEO / Schema Placement

- Public Help route linked from privacy/support.
- FAQPage schema only after review.
- Must avoid collecting unnecessary PII.

## Codex QA Requirements

- Verify deletion request route/contact is public and safe.
- Verify no private identifiers in examples.
- Verify content does not contradict backend retention and payment truth.


## Global Boundaries

- Do not create final publish-ready copy in this package.
- Do not include raw `orderNo`, payment ID, transaction ID, result ID, attempt ID, token, or private result/order/history/share/payment URL examples.
- Public help pages must use public canonical routes only.
- FAQPage schema is allowed only after visible FAQ content is approved and exactly matches the CMS source.
- Missing facts must be marked `Unknown`; they must not be inferred as `0` or silently invented.
- GA4/Baidu are observation layers, not payment truth.
- Backend orders/payment/entitlement records remain the source of truth for payment, unlock, refund, and report-ready status.
