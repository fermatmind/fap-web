# HELP-CONTENT-INVENTORY-01

## 1. One-line decision

**NO-GO**: Help/service layer is reachable, but it is not yet sufficient for a commercial product because payment, refund, unlock-failure, result-recovery, privacy-support, non-diagnostic, and contact-support assets are incomplete or not yet structured under CMS/backend authority.

## 2. Current scan summary

| Area | Decision | Note |
|---|---|---|
| Route availability | GO | Public help/support/privacy/terms/method-boundaries and lookup routes are reachable. |
| Private URL hygiene | GO | Lookup routes are noindex; sitemap/llms route-family scan did not show private result/order/share/pay/payment/history route families. |
| Payment/refund/unlock completeness | NO-GO | Payment and refund appear only partially; unlock-failure help is not a dedicated asset. |
| Support article inventory | NO-GO | SupportArticle and InterpretationGuide models exist, but public article/guide lists were empty in the scan. |
| CMS/backend model readiness | CONDITIONAL | ContentPage, SupportArticle, InterpretationGuide, review state, category, and intent foundations exist. |
| Commercial Help readiness | NO-GO | Service trust assets need structured fields, operator decisions, and CMS/backend authority before launch use. |

## 3. Help asset inventory table

| asset_id | theme | desired_page_type | current_route | current_status | current_source_of_truth | desired_source_of_truth | production_visible | indexability | schema_status | cms_authority_status | support_model_status | content_status | field_gaps | risk |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| help_hub | Help hub | help_gateway | `/help` -> `/support` | partial | redirect + gateway | ContentPage + SupportArticle | true | indexable destination | none | partial | model exists | shell present; article inventory empty | support_contact, faq_items, schema_enabled, policy_version | medium |
| support_hub | Support hub | support_gateway | `/support` | partial | gateway | ContentPage + SupportArticle | true | indexable | none | no standalone support ContentPage | model exists; public list empty | gateway present; articles/guides missing | support_contact, category, support_intent, canonical_url | high |
| payment_faq | Payment FAQ | payment_faq | `/help/faq`, `/terms` | insufficient | ContentPage | SupportArticle + policy artifact | partial | indexable help/policy | partial FAQPage | partial | payments category exists | no complete region/currency/method/free-paid structure | payment_region, currency, payment_method, sku, free_boundary, paid_boundary | high |
| refund_faq | Refund FAQ | refund_faq | `/refund` -> `/support` | missing | redirect + partial policy artifact | SupportArticle + policy artifact | partial | redirect destination indexable | partial FAQPage | no refund ContentPage | refunds category exists | no complete public refund service asset | refund_eligibility, refund_exclusions, refund_request_path, refund_handling_time | high |
| unlock_failure_help | Unlock failure help | troubleshooting_help | `/support`, `/orders/lookup` | insufficient | utility + backend API | SupportArticle | partial | support indexable; lookup noindex | none | missing | troubleshooting category exists | no dedicated paid-but-not-unlocked asset | unlock_failure_steps, required_user_info, forbidden_user_info, handling_time, pii_minimization_notice | high |
| result_explanation | Result explanation | interpretation_guide | `/method-boundaries`, `/terms` | partial | ContentPage | InterpretationGuide + ContentPage | true | indexable | WebPage | partial | guide model exists; public list empty | boundary exists; Help packaging incomplete | result_retention_policy, privacy_notice, recovery_limitations | medium |
| result_recovery | Result recovery | recovery_help | `/results/lookup`, `/orders/lookup` | partial | backend API + utility | SupportArticle + backend API | true | noindex required | none | missing help article | recover_report intent exists | utility exists; help explanation incomplete | result_lookup_path, retention, share/token boundary, noindex_required | medium |
| privacy_help | Privacy | privacy_policy_help | `/privacy` | partial | ContentPage | ContentPage + policy artifact | true | indexable | WebPage | present | privacy_data category exists | analytics/private URL details need review | data_categories, analytics_usage, private_url_policy, deletion_request_path, policy_version | medium |
| non_diagnostic_boundary | Non-diagnostic boundary | method_boundary_help | `/method-boundaries`, `/terms` | partial | ContentPage | ContentPage + InterpretationGuide | true | indexable | WebPage | present | limitations context exists | boundary page present; Help packaging incomplete | non_diagnostic_statement, medical_claim_forbidden, career_guarantee_forbidden | medium |
| contact_support | Contact support | contact_support | `/help/contact`, `/support` | partial | ContentPage + gateway | SupportArticle + support_contact | true | indexable | WebPage | partial | contact_support intent exists | route exists; support email/form policy needs decision | support_contact, required_user_info, forbidden_user_info, pii_minimization_notice | medium |
| data_deletion_request | Data deletion request | privacy_support_faq | `/privacy`, `/help/contact` | partial | ContentPage | SupportArticle + policy artifact | partial | indexable policy | none | partial | delete_data_request_info intent exists | deletion request FAQ missing | deletion_request_path, data_categories, support_contact, policy_version | medium |
| faq_schema | FAQ schema | structured_faq | `/help/faq` | partial | ContentPage markdown | CMS faq_items + visible content | true | indexable | FAQPage conditional | partial | structured FAQ field missing | schema gate exists; structured source gap remains | faq_items, schema_enabled, updated_at, reviewer | medium |
| footer_help_discoverability | Footer/help discoverability | navigation_discoverability | footer help/policy links | partial | frontend static | routing contract + CMS availability | true | n/a | n/a | partial | n/a | needs QA contract alignment | canonical_url, robots | low |
| order_result_lookup_boundary | Order/result lookup boundary | private_utility_boundary | `/orders/lookup`, `/results/lookup` | partial | backend API + utility | backend API + SupportArticle | true | noindex required | none | missing support explanation | orders/reports categories exist | boundary exists; Help explanation incomplete | noindex_required, share_link_boundary, tokenized_url_boundary, privacy_notice | medium |
| pii_minimization_support_flow | PII minimization in support flow | support_flow_contract | `/help/contact`, `/orders/lookup` | partial | utility + ContentPage | SupportArticle + backend API + policy artifact | partial | public Help indexable; lookup noindex | none | partial | privacy/contact intents exist | PII minimization needs explicit support-flow contract | required_user_info, forbidden_user_info, pii_minimization_notice, raw identifier prohibitions | high |

## 4. Must-have Help pages table

| Page | Status | Required source |
|---|---|---|
| Payment FAQ | partial | SupportArticle + policy artifact |
| Refund FAQ | missing | SupportArticle + policy artifact |
| Unlock failure | missing | SupportArticle |
| Result explanation | partial | InterpretationGuide + ContentPage |
| Result recovery | partial | SupportArticle + backend API |
| Privacy | present, review needed | ContentPage + policy artifact |
| Non-diagnostic | present, Help packaging needed | ContentPage + InterpretationGuide |
| Contact support | partial | SupportArticle + support_contact field |
| Data deletion request | partial | SupportArticle + policy artifact |

## 5. CMS/backend field needs

Common Help Page Fields: `slug`, `locale`, `title`, `summary`, `body`, `faq_items`, `updated_at`, `reviewer`, `support_contact`, `policy_version`, `schema_enabled`, `robots`, `is_indexable`, `category`, `support_intent`, `canonical_url`.

Payment / Refund Fields: `payment_region`, `currency`, `payment_method`, `sku`, `free_boundary`, `paid_boundary`, `refund_eligibility`, `refund_exclusions`, `refund_request_path`, `refund_handling_time`, `policy_effective_date`, `operator_review_required`.

Unlock Failure Fields: `unlock_failure_steps`, `required_user_info`, `forbidden_user_info`, `order_lookup_path`, `support_escalation_path`, `handling_time`, `pii_minimization_notice`, `raw_order_id_forbidden`, `raw_payment_id_forbidden`.

Result Recovery Fields: `result_lookup_path`, `result_retention_policy`, `share_link_boundary`, `tokenized_url_boundary`, `privacy_notice`, `recovery_limitations`, `noindex_required`.

Privacy / Non-Diagnostic Fields: `data_categories`, `analytics_usage`, `private_url_policy`, `deletion_request_path`, `non_diagnostic_statement`, `medical_claim_forbidden`, `career_guarantee_forbidden`, `third_party_tracking_note`.

Each field is represented in `docs/operations/generated/help-content-inventory.v1.json` with `current_source`, `desired_source`, `production_visible`, `schema_required`, `gpt_should_fill`, `codex_should_render`, `operator_must_approve`, `publish_safe`, and `notes`.

## 6. Source-of-truth map

| Theme | Current source | Target source | CMS/backend authority required | GPT may fill later | Operator review required | Frontend hardcode allowed |
|---|---|---|---|---|---|---|
| payment | ContentPage + backend API | SupportArticle + policy artifact | yes | yes | yes | no |
| refund | redirect + partial policy artifact | SupportArticle + policy artifact | yes | yes | yes | no |
| unlock_failure | utility + backend API | SupportArticle | yes | yes | yes | no |
| result_recovery | backend API + utility | SupportArticle + backend API | yes | yes | yes | no |
| privacy | ContentPage + docs | ContentPage + policy artifact | yes | yes | yes | no |
| non_diagnostic | ContentPage + docs | ContentPage + InterpretationGuide | yes | yes | yes | no |
| footer_help_discoverability | frontend static | routing contract + CMS availability | no | no | no | yes, for route rendering only |

## 7. GPT-5.5 Pro input requirements

These are request-card input requirements only. This PR does not generate publishable text.

| Request card | Input requirements | Disallowed |
|---|---|---|
| PAYMENT-REFUND-FAQ-PACKAGE-01 | approved payment/refund facts, public canonical routes, known Unknowns | competitor copy, fake SLA, raw private identifiers |
| RESULT-FAQ-PACKAGE-01 | result explanation boundaries, method-boundary facts, privacy constraints | diagnosis claims, career guarantees, private result URLs |
| PRIVACY-FAQ-PACKAGE-01 | data categories, analytics usage facts, private URL policy facts | unverified tracking claims, secrets, raw identifiers |
| NONDIAGNOSTIC-HELP-COPY-01 | claim-boundary matrix, method-boundary facts | clinical guarantees, treatment advice, diagnosis claims |
| UNLOCK-FAILURE-HELP-CARD-01 | approved steps, approved required/forbidden support info, canonical order lookup path | fake handling time, raw payment identifiers, private order detail URLs |
| DATA-DELETION-REQUEST-FAQ-01 | approved deletion request policy, approved support contact path, privacy policy version | legal promise without approval, unverified deletion SLA |
| RESULT-RECOVERY-FAQ-01 | approved result lookup path, approved result retention policy, share/token boundary facts | tokenized URLs, private result IDs, fake retention rule |

## 8. Codex follow-up tasks

| Task | Scope | Manifest/state authorization |
|---|---|---|
| HELP-CMS-AUTHORITY-01 | CMS/backend authority fields and adapters | required |
| HELP-SCHEMA-GATE-01 | FAQ schema source alignment | required |
| SUPPORT-FLOW-SMOKE-01 | support/order/result lookup boundary smoke | required |
| HELP-FOOTER-LINK-QA-01 | footer help discoverability QA | required |
| HELP-CONTENTPAGE-DRAFT-READINESS-01 | draft readiness after content authority approval | required |
| SUPPORT-PII-MINIMIZATION-GATE-01 | support PII minimization contract | required |

## 9. Operator decision list

- refund eligibility
- refund exclusions
- refund SLA
- support email/form
- unlock failure SLA
- required user info for support
- whether raw orderNo may be entered in private support form
- result retention
- deletion request policy
- English / Chinese policy differences

## 10. 123test / Truity parity gap

Asset categories only: FAQ index, privacy, terms, payment/refund support, contact/support, test result explanation, non-diagnostic boundary, saved results or account access, data deletion or account request.

## 11. Hard boundaries

- no content generation
- no UI/runtime edits
- no CMS page creation
- no publish
- no private URL access
- no raw order/payment IDs in public Help
- no legal promise without Operator approval
- no competitor copy
- no fake SLA
- no search submission
- no deployment

## 12. Final GO / NO-GO table

| Area | Decision |
|---|---|
| route availability | GO |
| private URL hygiene | GO |
| FAQ schema | CONDITIONAL |
| CMS/backend model readiness | CONDITIONAL |
| support article inventory | NO-GO |
| payment/refund/unlock Help completeness | NO-GO |
| commercial Help/service readiness | NO-GO |
