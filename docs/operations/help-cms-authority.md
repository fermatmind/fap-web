# Help CMS Authority

Decision: CONDITIONAL.

FermatMind has backend/CMS authority primitives for Help and support assets, but the current field contract is not yet sufficient for commercial service trust pages without additional structured fields or a documented mapping layer.

## Evidence Sources

Read-only evidence used in this PR:

- `fap-web/app/(localized)/[locale]/help/[slug]/page.tsx`
- `fap-web/lib/cms/content-pages.ts`
- `fap-api/backend/app/Models/ContentPage.php`
- `fap-api/backend/app/Models/SupportArticle.php`
- `fap-api/backend/app/Models/InterpretationGuide.php`
- `fap-api/backend/app/Http/Controllers/API/V0_5/Cms/*Controller.php`
- `fap-api/backend/routes/api.php`
- `fap-api/backend/AGENTS.md`
- `docs/content/help/generated/help-content-packages.v1.json`

No fap-api files were modified.

## Authority Mapping

| Help asset | Primary authority | Secondary authority | Current fit | Required gap |
| --- | --- | --- | --- | --- |
| Payment FAQ | `ContentPage` for public canonical Help route | `SupportArticle` for support workflow detail | Partial | no `payment_method`, `currency`, `free_boundary`, `paid_boundary`, or `policy_version` field |
| Refund FAQ | `ContentPage` for public canonical Help route | `SupportArticle` category `refunds`, intent `understand_refund` | Partial | no structured refund eligibility/exclusion/handling-time fields |
| Unlock failure help | `ContentPage` for public Help route | `SupportArticle` after adding/supporting an unlock-failure intent | Partial | no first-class `unlock_failure`, `handling_time`, or safe identifier policy fields |
| Result recovery | `ContentPage` for public Help route | `SupportArticle` intent `recover_report`; `InterpretationGuide` only for result explanation | Partial | no first-class result retention/recovery/private URL boundary fields |
| Privacy Help | `ContentPage` kind `policy` or `help`, page type `privacy` | `SupportArticle` intent `request_data` / `delete_data_request_info` | Partial | no structured analytics/private URL/data deletion fields |
| Non-diagnostic boundary | `ContentPage` page type `boundary` | `InterpretationGuide` context `limitations` for result-reading surfaces | Partial | no structured claim-boundary version or applicable surface fields |
| Data deletion request | `ContentPage` for public policy/help | `SupportArticle` intent `delete_data_request_info` | Partial | no handling SLA, identity verification method, or retained-data exception fields |

## Existing Supported Fields

`ContentPage` supports the minimum public page authority shape:

- `slug`
- `path`
- `kind`
- `page_type`
- `title`
- `summary`
- `content_md`
- `content_html`
- `locale`
- `status`
- `review_state`
- `owner`
- `last_reviewed_at`
- `published_at`
- `source_updated_at`
- `effective_at`
- `is_public`
- `is_indexable`
- `seo_title`
- `meta_description`
- `seo_description`
- `canonical_path`

`SupportArticle` supports workflow-oriented support classification:

- `support_category`
- `support_intent`
- `primary_cta_label`
- `primary_cta_url`
- `related_support_article_ids`
- `related_content_page_ids`
- `review_state`
- `last_reviewed_at`
- `published_at`
- SEO/canonical fields

`InterpretationGuide` supports result-reading education:

- `test_family`
- `result_context`
- `audience`
- related guide/methodology links
- review and SEO/canonical fields

## Gaps

The current authority layer does not expose first-class fields for:

- `faq_items`
- `schema_enabled`
- `policy_version`
- `reviewer`
- `support_contact`
- `handling_time`
- `required_user_info`
- `forbidden_user_info`
- `pii_minimization_notice`
- `refund_eligibility`
- `refund_exclusions`
- `refund_request_path`
- `payment_region`
- `currency`
- `payment_method`
- `sku`
- `free_boundary`
- `paid_boundary`
- `result_retention_period`
- `recovery_method`
- `private_url_policy`
- `deletion_request_path`
- `account_deletion_path`
- `identity_verification_method`
- `retained_data_exceptions`

Some values could be represented in Markdown today, but that is not enough for service contracts, schema gating, support flow privacy checks, or policy versioning.

## FAQ And Schema Authority

Current fap-web Help detail pages derive `FAQPage` schema from visible Markdown headings only for the `help-faq` slug. This is safer than hidden schema, but it is not a structured FAQ authority.

Required future rule:

- FAQ schema must be emitted only when visible CMS content contains the same FAQ items.
- Service Help pages should prefer structured backend `faq_items` or a backend-provided equivalent before `FAQPage` schema is enabled for payment, refund, unlock failure, result recovery, privacy, non-diagnostic, or data deletion pages.
- Unknown source fields must remain Unknown and must not be inferred from Markdown.

## Indexability

Public ContentPage records support `is_public`, `is_indexable`, `status`, `canonical_path`, and SEO fields. That is enough for a public page indexability decision, but robots/indexability policy must be explicit before service pages are published.

Private lookup/result/order/payment/history/share URLs remain out of scope and must not be used as canonical Help URLs.

## Required Backend/CMS Field Needs

Minimum additions or equivalent backend authority before CMS draft creation:

- `faq_items`
- `policy_version`
- `reviewer`
- `support_contact`
- `schema_enabled`
- `robots`
- `support_intent` for ContentPage or a formal ContentPage-to-SupportArticle relation
- `handling_time`
- `required_user_info`
- `forbidden_user_info`
- `pii_minimization_notice`
- asset-specific policy fields for refund, unlock failure, result recovery, privacy, non-diagnostic boundary, and data deletion

## Boundary

This PR defines authority only. It does not create CMS drafts, publish Help pages, change routes, change schema runtime, change support flow runtime, access private URLs, or modify fap-api.
