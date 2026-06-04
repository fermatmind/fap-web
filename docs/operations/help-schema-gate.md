# Help Schema Gate

Decision: CONDITIONAL_SCHEMA_BLOCKED_UNTIL_VISIBLE_CMS_FIELDS.

Future Help FAQ schema is allowed only when schema content exactly matches visible CMS/backend content. The current Help implementation is safer than hidden schema because it derives FAQPage from visible Markdown for the existing FAQ page, but service Help pages still need structured CMS/backend fields before schema can be enabled.

## Required Rules

| Rule | Requirement |
| --- | --- |
| Visible FAQ only | FAQPage schema is allowed only when the same FAQ items are visibly rendered from CMS/backend authority. |
| No hidden FAQ | FAQPage must not include hidden-only items. |
| No private URLs | FAQPage/WebPage schema must not include private result/order/share/pay/payment/history URLs. |
| No raw identifiers | Schema must not include raw order/payment/result identifiers or tokenized URL examples. |
| Policy fields | Payment, refund, unlock, result recovery, privacy, and data deletion schema require `policy_version`, `updated_at`, and reviewer authority. |
| Unknown fields | Unknown source fields must remain Unknown and must not be inferred from Markdown. |

## Current State

- Existing Help FAQ schema is Markdown-derived from visible content for the `help-faq` slug.
- `faq_items` is not currently a first-class CMS field for ContentPage.
- `schema_enabled` is not currently a first-class CMS field.
- `policy_version` is not currently a first-class CMS field.
- `updated_at` exists as general content metadata, but policy-specific updated-at authority is not first-class.

## Page Positions

| Page | Schema position |
| --- | --- |
| Payment/refund FAQ | Blocked until visible approved FAQ, `policy_version`, `updated_at`, reviewer, and `schema_enabled` exist. |
| Unlock failure | Blocked until visible approved FAQ, policy metadata, handling time, safe identifier fields, and `schema_enabled` exist. |
| Result recovery | Blocked until visible approved FAQ, retention/recovery/private URL fields, and `schema_enabled` exist. |
| Privacy | Blocked until visible approved FAQ, privacy policy version, analytics/private URL/deletion fields, and `schema_enabled` exist. |
| Non-diagnostic | Blocked until visible approved FAQ and claim boundary version exist. |
| Data deletion | Blocked until visible approved FAQ, handling/verification/retained-data exception fields, and `schema_enabled` exist. |

## Boundary

This PR does not change runtime schema generation, create CMS drafts, mutate CMS, publish content, or add Help page copy.
