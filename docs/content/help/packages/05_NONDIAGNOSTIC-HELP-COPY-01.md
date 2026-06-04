# FermatMind Help Content Asset Package

> Status: **draft input only / not publishable**
> Owner: **GPT-5.5 Pro** for content drafting after operator approval
> Authority: **CMS/backend**
> Codex role: inventory, contract, QA, schema, routing, privacy gates only
> Prohibited: publish-ready FAQ/body/copy, CMS mutation, private URL access, raw order/payment/result identifiers

# 05 — NONDIAGNOSTIC-HELP-COPY-01

## Machine-Readable Front Matter

```yaml
asset_id: NONDIAGNOSTIC-HELP-COPY-01
asset_type: non_diagnostic_boundary_package
priority: P0
reason: Prevents medical, psychological, or deterministic misunderstanding of test
  products.
status: draft_input_only
publish_allowed: false
locale_policy: zh/en same policy
recommended_routes:
- /zh/help/non-diagnostic
- /en/help/non-diagnostic
required_boundaries:
- not medical diagnosis
- not psychological diagnosis
- not treatment advice
- not hiring decision tool
- not career guarantee
- not official MBTI
- not deterministic prediction
allowed_use_cases:
- self-understanding
- career decision support
- interest exploration
- communication reflection
- behavior tendency reflection
forbidden_positive_claims:
- 最准
- 官方 MBTI
- 医学诊断
- 心理诊断
- 保证找到职业
- 预测命运
- 一定适合
- 临床级
- 治疗
cms_fields:
- slug
- locale
- title
- summary
- body
- faq_items
- boundary_type
- applicable_surfaces
- claim_boundary_version
- reviewer
- updated_at
- schema_enabled
- robots
- is_indexable
seo_schema_position:
  indexability: indexable Help page
  schema: FAQPage after approval
  canonical: self canonical public help route
  links_from:
  - test landing pages
  - result pages
  - article pages
  - support hub
```

## Purpose

Prepare the factual package for a non-diagnostic Help page explaining what FermatMind tests can and cannot be used for.

## Content Scope for GPT-5.5 Pro

- Explain non-diagnostic boundaries.
- Explain decision-support nature.
- Explain no guaranteed career outcome.
- Explain not an official MBTI or clinical tool.
- Keep tone factual and restrained.

## CMS Field Requirements

- `slug`
- `locale`
- `title`
- `summary`
- `body`
- `faq_items`
- `boundary_type`
- `applicable_surfaces`
- `claim_boundary_version`
- `reviewer`
- `updated_at`
- `schema_enabled`
- `robots`
- `is_indexable`

## SEO / Schema Placement

- This page should support all test/article/product surfaces as a claim-boundary reference.
- FAQ schema can be added after approved visible FAQ exists.
- Internal links should be public canonical only.

## Codex QA Requirements

- Run claim lint against Help copy.
- Confirm no forbidden positive claim remains.
- Confirm test/article pages can link to this public route.


## Global Boundaries

- Do not create final publish-ready copy in this package.
- Do not include raw `orderNo`, payment ID, transaction ID, result ID, attempt ID, token, or private result/order/history/share/payment URL examples.
- Public help pages must use public canonical routes only.
- FAQPage schema is allowed only after visible FAQ content is approved and exactly matches the CMS source.
- Missing facts must be marked `Unknown`; they must not be inferred as `0` or silently invented.
- GA4/Baidu are observation layers, not payment truth.
- Backend orders/payment/entitlement records remain the source of truth for payment, unlock, refund, and report-ready status.
