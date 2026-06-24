# Assessment Hub QA Common Contract

Verdict: `READY_TO_CONSUME_COMMON_QA_CONTRACT`

Task: `ASSESSMENT-HUB-QA-COMMON-CONTRACT-01`

Mode: `docs_contracts_only`

This contract defines the shared handoff vocabulary for the six Assessment Hub public landing routes in `zh-CN` and `en`. It is a planning and QA contract only. It does not change runtime code, frontend public copy, CMS data, sitemap, robots, llms, schema, hreflang, canonical, noindex, redirect, deployment, analytics, payment, order, attempt, scoring, or private result behavior.

## Agent Boundary

| Role | Agent |
| --- | --- |
| Producing agent | `assessment_hub` |
| Consumer agent | `runtime_qa` |
| Consumer agent | `seo_geo_control` |
| Consumer agent | `cms_draft_package` |
| Consumer agent | `analytics_gsc_opportunity` |
| Consumer agent | `claim_privacy_safety_gate` |

## Covered Surface

The scope is the six public Assessment Hub landing surfaces across two locales: `MBTI`, `BIG5_OCEAN`, `RIASEC`, `IQ_RAVEN`, `EQ_60`, and `ENNEAGRAM`.

The covered route count is `12`. Route evidence is public/read-only. Take-flow evidence is limited to `GET` availability and link/form-code alignment. The contract forbids attempt creation, answer submission, private result URL access, raw score access, account payload access, payment/order access, and POST calls to start/submit/result APIs.

## Assertion Vocabulary

Required downstream packets must use these assertion ids:

- `route_metadata_parity`
- `indexability_parity`
- `schema_visible_content_parity`
- `sitemap_membership_parity`
- `llms_membership_parity`
- `llms_full_membership_parity`
- `take_get_availability`
- `take_form_code_alignment`
- `cta_target_alignment`
- `locale_redirect_boundary`
- `free_full_report_claim_boundary`
- `paid_unlock_disabled_copy_boundary`
- `commercial_field_authority_boundary`
- `source_authority_classification`
- `private_data_non_access_boundary`
- `search_submission_hold_boundary`

## Status Vocabulary

Allowed statuses are `PASS`, `PARTIAL`, `HOLD`, `BLOCKED`, `SPLIT_REQUIRED`, `REPAIR_REQUIRED`, `READY_TO_CONSUME`, and `PARKED_PLACEHOLDER`.

## Source Classification

Allowed source classifications are `backend_registry_authority`, `backend_landing_surface_v1_authority`, `backend_lookup_projection`, `cms_landing_surface_overlay`, `fap_web_consumer_contract_not_authority`, `runtime_readonly_evidence`, `sitemap_source_evidence`, `llms_readonly_evidence`, `contract_test_evidence`, `manual_review_required`, `access_required`, `unknown`.

Frontend consumer contracts can be evidence of rendering behavior, but they are not content, SEO, commerce, or CMS authority.

## Issue Taxonomy

| Issue id | Severity | Meaning |
| --- | --- | --- |
| `P1_COMMERCIAL_FIELD_AUTHORITY_CONFLICT` | `P1` | Free hub claim conflicts with backend commercial or unlock authority fields. |
| `P2_PAID_UNLOCK_DISABLED_COPY_RISK` | `P2` | Visible disabled paid unlock copy may confuse a free-first hub claim. |
| `P2_EMPTY_FORMS_WITH_RUNTIME_TAKE_ENTRY` | `P2` | Lookup forms are empty while runtime GET still exposes a take entry. |
| `P2_MANUAL_REVIEW_REQUIRED_FOR_CERTIFICATE_OR_ANSWER_KEY_CLAIMS` | `P2` | IQ/Raven answer-key, bank, certificate, or scoring claim needs manual source authority review. |
| `P0_PRIVATE_LEAK` | `P0` | Private attempt, private result URL, token, answer payload, account data, payment data, or raw score vector appears in public/indexable evidence. |
| `P1_INDEXABILITY_OR_DISCOVERABILITY_DRIFT` | `P1` | Public route indexability, canonical, hreflang, sitemap, llms, or schema membership drifts from authority. |

## Hard Holds

The following actions remain hard `HOLD`: runtime code change, frontend public copy change, CMS write/import/publish/media upload, search submission or provider call, sitemap/robots/llms/schema/hreflang/canonical/noindex/redirect mutation, deployment or manual deploy, private result or attempt access, POST start/submit/result API call, analytics backfill or runtime instrumentation, payment/order/entitlement change, and fap-api mutation.

If fap-api changes appear necessary, the downstream packet must report `SPLIT_REQUIRED` and stop instead of modifying fap-api.

## Packet Sequence

The next packets are:

- `ASSESSMENT-HUB-SIX-ROUTE-METADATA-PARITY-PACKET-01`
- `ASSESSMENT-HUB-TAKE-FLOW-CTA-PACKET-01`
- `ASSESSMENT-HUB-FREE-FULL-REPORT-CLAIM-PACKET-01`
- `ASSESSMENT-HUB-SOURCE-AUTHORITY-INDEXABILITY-PACKET-01`
- `ASSESSMENT-HUB-QA-READINESS-MATRIX-01`

`ASSESSMENT-HUB-SOURCE-AUTHORITY-INDEXABILITY-PACKET-01` depends on the metadata, take-flow, and claim packets. `ASSESSMENT-HUB-QA-READINESS-MATRIX-01` depends on those three packets plus the source-authority packet.

## Next Safe Task Rules

- If planning continues despite documented P1/P2 issues, use `SIX-HUB-SEO-GEO-PACKAGE-PLANNING-SCAN-01`.
- If the Big Five commercial field authority conflict blocks planning, use `BIG5-HUB-COMMERCIAL-FIELD-AUTHORITY-FIX-SCAN-01`.
- If paid unlock disabled copy blocks planning, use `SIX-ASSESSMENT-HUB-PAID-UNLOCK-COPY-FIX-SCAN-01`.
- If IQ indexability mismatch returns, use `IQ-HUB-INDEXABILITY-PARITY-FIX-SCAN-01`.
- If any private leak is found, stop with `BLOCKED_PRIVATE_LEAK`.
