# FermatMind Help Content Asset Package

> Status: **draft input only / not publishable**
> Owner: **GPT-5.5 Pro** for content drafting after operator approval
> Authority: **CMS/backend**
> Codex role: inventory, contract, QA, schema, routing, privacy gates only
> Prohibited: publish-ready FAQ/body/copy, CMS mutation, private URL access, raw order/payment/result identifiers

# 03 — RESULT-RECOVERY-FAQ-01

## Machine-Readable Front Matter

```yaml
asset_id: RESULT-RECOVERY-FAQ-01
asset_type: result_recovery_faq_package
priority: P0
reason: Email-based recovery is a core trust asset for testing products.
status: draft_input_only
publish_allowed: false
locale_policy: zh/en same policy
recommended_routes:
- /zh/help/result-recovery
- /en/help/result-recovery
operator_policy:
  result_retention_period: 2 years
  recovery_method: email
  support_channel: email
required_facts:
- which result types are recoverable
- whether email is required at test completion
- what happens if email was not provided
- result retention period
- privacy boundary for result URLs
- support email
safe_user_info:
- email
- test_name
- approximate_completion_time
- locale
forbidden_public_info:
- full result URL
- resultId
- attemptId
- history URL
- share token
- orderNo
cms_fields:
- slug
- locale
- title
- summary
- body
- faq_items
- result_retention_period
- recovery_method
- support_contact
- privacy_notice
- noindex_private_result_boundary
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
  lookup_tool_policy: lookup utilities remain noindex/no-store and are linked carefully
```

## Purpose

Prepare the factual package for a public result recovery FAQ centered on email recovery and a two-year result-retention policy.

## Content Scope for GPT-5.5 Pro

- Explain that recovery is email-based.
- Explain two-year retention.
- Explain privacy boundaries.
- Explain what information users can provide safely.
- Do not include real result URL examples.
- Do not imply results are public or indexable.

## CMS Field Requirements

- `slug`
- `locale`
- `title`
- `summary`
- `body`
- `faq_items`
- `result_retention_period`
- `recovery_method`
- `support_contact`
- `privacy_notice`
- `noindex_private_result_boundary`
- `policy_version`
- `updated_at`
- `reviewer`
- `schema_enabled`
- `robots`
- `is_indexable`

## SEO / Schema Placement

- Public Help page can be indexable.
- Result lookup utility pages should remain noindex/no-store.
- FAQ schema must not contain private result link examples.

## Codex QA Requirements

- Verify lookup routes are not indexed.
- Verify Help copy links to canonical public lookup/help routes only.
- Verify no private identifiers are present.


## Global Boundaries

- Do not create final publish-ready copy in this package.
- Do not include raw `orderNo`, payment ID, transaction ID, result ID, attempt ID, token, or private result/order/history/share/payment URL examples.
- Public help pages must use public canonical routes only.
- FAQPage schema is allowed only after visible FAQ content is approved and exactly matches the CMS source.
- Missing facts must be marked `Unknown`; they must not be inferred as `0` or silently invented.
- GA4/Baidu are observation layers, not payment truth.
- Backend orders/payment/entitlement records remain the source of truth for payment, unlock, refund, and report-ready status.
