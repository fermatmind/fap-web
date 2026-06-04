# Help CMS Draft Preflight

Decision: NO_GO_TO_CMS_DRAFT.

The six archived Help packages passed package-boundary validation, but they are not ready for CMS draft creation. The blocker is not package integrity; it is missing CMS/backend authority for structured service fields and unresolved operator facts.

## Preflight Result

| Check | Result | Notes |
| --- | --- | --- |
| Required CMS fields present | Failed | Several service fields are not first-class CMS fields. |
| Slug plan exists | Passed | Package route recommendations define public `/zh/help/*` and `/en/help/*` targets. |
| Locale plan exists | Passed | Package policy is zh/en same. |
| Robots/indexability plan exists | Partial | Indexability intent exists; robots is not first-class. |
| Schema plan exists | Partial | FAQPage is gated, but `faq_items` and `schema_enabled` are not first-class. |
| Support email policy exists | Failed | Support channel is email, but exact support email remains Unknown. |
| Operator policies recorded | Passed | Refund, unlock, retention, recovery, and deletion policies are recorded. |
| Private URL scan | Passed | Package validation found no private URL examples. |
| Operator review gate | Passed | Packages require operator review. |
| CMS authority gate | Passed | Packages require CMS/backend authority. |

## Blocking Gaps

- `support_email` is Unknown.
- `faq_items` is not a first-class structured CMS field.
- `schema_enabled` is not a first-class CMS field.
- `policy_version` is not a first-class CMS field.
- `support_contact` is not a first-class CMS field.
- `handling_time` is not a first-class CMS field.
- `required_user_info` and `forbidden_user_info` are not first-class CMS fields.
- `pii_minimization_notice` is not a first-class CMS field.
- `robots` is not a first-class CMS field.
- `unlock_failure` is not currently a structured `support_intent`.

## Draft Authorization Prompt

Authorize `HELP-CONTENT-DRAFT-CREATE-01` only after backend/CMS field authority or an explicit structured mapping is approved for `faq_items`, `schema_enabled`, `policy_version`, `support_contact`, `handling_time`, `required_user_info`, `forbidden_user_info`, `pii_minimization_notice`, `robots/indexability`, and `support_email`.

The authorization must explicitly allow CMS draft creation and must still prohibit publish, runtime changes, private URL access, and raw order/payment/result identifiers.

## Boundary

This PR did not create CMS drafts, mutate CMS, publish content, change runtime, access private URLs, or use real order/result/payment data.
