# FermatMind Help Content Asset Package

> Status: **draft input only / not publishable**
> Owner: **GPT-5.5 Pro** for content drafting after operator approval
> Authority: **CMS/backend**
> Codex role: inventory, contract, QA, schema, routing, privacy gates only
> Prohibited: publish-ready FAQ/body/copy, CMS mutation, private URL access, raw order/payment/result identifiers

# 04 — PRIVACY-FAQ-PACKAGE-01

## Machine-Readable Front Matter

```yaml
asset_id: PRIVACY-FAQ-PACKAGE-01
asset_type: privacy_faq_package
priority: P0
reason: Reduces fear that test results, order data, or analytics payloads expose private
  information.
status: draft_input_only
publish_allowed: false
locale_policy: zh/en same policy
recommended_routes:
- /zh/help/privacy-data
- /en/help/privacy-data
operator_policy:
  data_deletion_allowed: true
  account_deletion_allowed: true
  private_url_policy: private result/order/payment/history URLs must not be shared
    publicly or sent to analytics/search surfaces
required_facts:
- data_categories_collected
- analytics_tools_used
- what_is_not_sent_to_analytics
- private_url_policy
- data_deletion_request_path
- account_deletion_path
- retention_periods
- support_email
forbidden_claims:
- no analytics at all if analytics exists
- absolute security guarantee
- GA4/Baidu as payment truth
cms_fields:
- slug
- locale
- title
- summary
- body
- faq_items
- privacy_policy_version
- analytics_usage_note
- private_url_policy
- deletion_request_path
- account_deletion_path
- support_contact
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
  - support hub
  - footer
  - result page help
```

## Purpose

Prepare the factual package for a privacy FAQ that explains test data, analytics observation, private URL rules, and deletion/account closure requests.

## Content Scope for GPT-5.5 Pro

- Explain data categories in user-facing language.
- Explain analytics at a high level without hiding its existence.
- Explain that private result/order URLs must not be made public.
- Explain deletion/account closure request flow.
- Do not make unsupported absolute security claims.

## CMS Field Requirements

- `slug`
- `locale`
- `title`
- `summary`
- `body`
- `faq_items`
- `privacy_policy_version`
- `analytics_usage_note`
- `private_url_policy`
- `deletion_request_path`
- `account_deletion_path`
- `support_contact`
- `updated_at`
- `reviewer`
- `schema_enabled`
- `robots`
- `is_indexable`

## SEO / Schema Placement

- Public Help page can be indexed after review.
- Should be linked from privacy policy and Help hub.
- FAQ schema must not contain private URL examples.

## Codex QA Requirements

- Verify Unknown fields remain Unknown.
- Verify privacy FAQ does not contradict analytics implementation.
- Verify private route families are not linked as examples.


## Global Boundaries

- Do not create final publish-ready copy in this package.
- Do not include raw `orderNo`, payment ID, transaction ID, result ID, attempt ID, token, or private result/order/history/share/payment URL examples.
- Public help pages must use public canonical routes only.
- FAQPage schema is allowed only after visible FAQ content is approved and exactly matches the CMS source.
- Missing facts must be marked `Unknown`; they must not be inferred as `0` or silently invented.
- GA4/Baidu are observation layers, not payment truth.
- Backend orders/payment/entitlement records remain the source of truth for payment, unlock, refund, and report-ready status.
