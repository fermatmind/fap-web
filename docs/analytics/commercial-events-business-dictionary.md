# Commercial Events Business Dictionary

Scope: `COMMERCIAL-CONTRACTS-FOUNDATION-01`

Mode: contract and specification only. This document does not implement runtime tracking, create publishable copy, change CMS content, start paid ads, submit search URLs, mutate orders/payments, or deploy.

## 1. Audit Conclusion

Status: revised.

The Day 1 commercial event draft is directionally accepted, but it cannot be treated as the current runtime contract. Current `fap-web` code still uses legacy and SEO-funnel event names such as `start_attempt`, `submit_attempt`, `click_unlock`, and `create_order`. The standard commercial event vocabulary below is the target contract for the next engineering PR, not evidence that every standard name is already emitted by runtime.

Current paid ads decision: NO-GO.

Primary reasons:

- Standard commercial event names are not fully first-class in runtime.
- Live private URL analytics review remains incomplete.
- Freemium locale policy is not backend-authoritative.
- DailyGiving proof/readiness gate is not passed.
- Purchase truth must come from backend orders/payment/entitlements, not GA4 or Baidu.

## 2. Business Funnel

The standard commercial funnel is:

1. `landing_pv`
2. `article_to_test_click`
3. `start_test`
4. `complete_test`
5. `view_result`
6. `click_deep_report`
7. `begin_checkout`
8. `purchase_success`
9. `report_unlock`
10. `report_ready`

Safety event:

- `private_url_seen`

Important separations:

- `article_to_test_click` is not `start_test`.
- `begin_checkout` is not `purchase_success`.
- `purchase_success` may be mirrored to analytics, but backend orders/payment remains purchase truth.
- GA4 and Baidu are observation layers, not purchase truth.
- Missing data is `Unknown`, not `0`.

## 3. Current Code Facts

Evidence sources:

- `lib/tracking/events.ts`
- `lib/tracking/client.ts`
- `lib/tracking/privacy.ts`
- `lib/tracking/seoCtaAttribution.ts`
- `docs/audits/analytics-commercial-events-scan-2026-06-03.md`
- `docs/audits/privacy-order-result-safety-scan-2026-06-03.md`
- `docs/operations/seo-baseline-template-2026-06-02.md`
- `backend/docs/operations/freemium-locale-policy-scan-2026-06-03.md`
- `backend/docs/operations/daily-giving-ops-readiness-scan-2026-06-03.md`

Current registry facts:

| Existing event or layer | Current status | Contract interpretation |
| --- | --- | --- |
| `view_landing` | present | Legacy landing view event. |
| `landing_view` | present | Big Five landing event mapped to GA4 `page_view`. |
| `article_to_test_click` | present | Accepted as the standard article CTA intent event. |
| `start_attempt` | present | Legacy/current runtime start event; maps to standard `start_test`. |
| `submit_attempt` | present | Legacy/current runtime completion event; maps to standard `complete_test`. |
| `view_result` | present | Accepted as the standard result view event. |
| `click_unlock` | present | Legacy/current deep-report or checkout-intent click; maps to standard `click_deep_report`. |
| `create_order` | present | Legacy/current order creation event; maps to standard `begin_checkout`. |
| `purchase_success` | present | Analytics mirror only; backend remains purchase truth. |
| `unlock_success` | present | Runtime-adjacent unlock event; maps to standard `report_unlock` only when backend entitlement truth is available. |
| `report_ready` | not first-class in frontend commercial runtime | Must remain backend/Ops or read-model truth until implemented. |

## 4. Standard Event Definitions

| Standard event | Business meaning | Trigger boundary | Allowed optimization use | Truth source |
| --- | --- | --- | --- | --- |
| `landing_pv` | Public landing page view. | Public canonical page shell loads and is eligible for analytics. | Low-level observation only. | GA4, Baidu, first-party observation. |
| `article_to_test_click` | Content CTA transfers intent to a public test detail page. | User clicks a CMS/article CTA whose destination is a public canonical test detail route. | Early content-intent optimization. | First-party and GA4 observation. |
| `start_test` | User starts an assessment. | Attempt creation or first valid take-flow start. | Weak conversion optimization. | First-party, backend attempt truth where available. |
| `complete_test` | User completes and submits assessment. | Submit succeeds and a result can be generated or viewed. | Mid-funnel optimization. | First-party, backend attempt/result truth where available. |
| `view_result` | User sees the free/basic result surface. | Result shell renders without private identifier leakage. | Mid-funnel optimization. | First-party and GA4 observation. |
| `click_deep_report` | User expresses intent for a deeper report or unlock path. | Click on deep report, unlock, or high-value result CTA. | Strong intent optimization. | First-party observation. |
| `begin_checkout` | User enters checkout or an order is created. | Checkout/order flow begins, before payment is confirmed. | High-intent but not purchase. | Backend order plus first-party observation. |
| `purchase_success` | Payment succeeds. | Backend confirms paid/payment success. | Final optimization event only after backend truth mirror is safe. | Backend orders/payment truth. |
| `report_unlock` | Paid entitlement unlock is active. | Entitlement or unlock token is valid for the target report. | Business quality metric, not primary ad optimization. | Backend entitlement truth. |
| `report_ready` | Paid report can be viewed stably. | Report data renders without loading/error state. | Fulfillment quality metric, not primary ad optimization. | Backend/read-model plus frontend observation. |
| `private_url_seen` | Private or tokenized URL appeared in analytics, logs, sitemap, llms, search, or queue evidence. | Any raw result/order/share/pay/payment/history/private/test-taking/tokenized URL is observed. | Never. P0 stop event. | GA4, Baidu, logs, sitemap/llms audit, issue queue evidence. |

## 5. Legacy Alias Mapping

The next engineering PR must preserve compatibility. Existing events should not be deleted without a migration window.

| Legacy/current event | Standard event | Contract rule |
| --- | --- | --- |
| `view_landing` | `landing_pv` | Legacy alias. |
| `landing_view` | `landing_pv` | Big Five alias. |
| `start_attempt` | `start_test` | Keep compatible, dashboard prefers `start_test`. |
| `start_click` | `start_test` | Product-click alias, not attempt truth by itself. |
| `submit_attempt` | `complete_test` | Keep compatible, dashboard prefers `complete_test`. |
| `submit_click` | `complete_test` | Product-click alias, weaker than submit success. |
| `click_unlock` | `click_deep_report` | Keep compatible, dashboard prefers `click_deep_report`. |
| `create_order` | `begin_checkout` | Order creation or checkout begin, not payment success. |
| `checkout_start` | `begin_checkout` | Legacy/product alias. |
| `purchase` | `purchase_success` | Legacy third-party-style alias; backend truth required. |
| `pay_success` | `purchase_success` | Legacy alias. |
| `unlock_success` | `report_unlock` | Requires backend entitlement truth before business reporting. |
| `report_loaded` | `report_ready` | Proposed compatibility alias when report-ready is implemented. |

## 6. Payload Allowlist

Common allowed fields:

- `event_name`
- `event_version`
- `event_time`
- `locale`
- `route_family`
- `page_type`
- `source_path`
- `destination_path`
- `canonical_url`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `referrer_host`
- `entry_surface`
- `device_type`
- `browser_family`
- `country_or_region`

Content and SEO fields:

- `article_slug`
- `translation_group_id`
- `cta_id`
- `cta_priority`
- `target_test_slug`
- `target_action`
- `content_id`
- `topic_id`

Assessment fields:

- `test_slug`
- `test_type`
- `scale_code`
- `form_code`
- `test_version`
- `attempt_id_hash`
- `result_id_hash`
- `duration_ms`
- `question_count`

Commerce fields:

- `sku`
- `currency`
- `value`
- `payment_provider`
- `order_id_hash`
- `transaction_id_hash`
- `checkout_session_id_hash`
- `entitlement_id_hash`
- `report_type`

## 7. Payload Denylist

The following must not be sent to analytics, generated artifacts, issue queues, or dashboards:

- `orderNo`
- `raw_order_id`
- `raw_resultId`
- `raw_attemptId`
- `raw_payment_id`
- `raw_transaction_id`
- `raw_checkout_session_id`
- `token`
- `email`
- `phone`
- `name`
- `id_card`
- `private_url`
- `full_result_url`
- `full_order_url`
- `full_payment_url`
- `cookie`
- `session_id`

## 8. Dashboard Field Mapping

| Metric | Standard event | Current runtime evidence | Display when missing | Purchase truth? |
| --- | --- | --- | --- | --- |
| landing page views | `landing_pv` | `view_landing`, `landing_view`, GA4 `page_view` | Unknown | No |
| article CTA clicks | `article_to_test_click` | `article_to_test_click` | Unknown | No |
| test starts | `start_test` | `start_attempt` alias required | Unknown | No |
| test completions | `complete_test` | `submit_attempt` alias required | Unknown | No |
| result views | `view_result` | `view_result` | Unknown | No |
| deep report clicks | `click_deep_report` | `click_unlock` alias required | Unknown | No |
| checkout begins | `begin_checkout` | `create_order` alias required | Unknown | No |
| purchases | `purchase_success` | analytics mirror exists, backend truth required | Unknown | Yes, backend only |
| report unlocks | `report_unlock` | backend entitlement truth required | Unknown | Backend entitlement |
| report ready | `report_ready` | backend/read-model truth required | Unknown | Backend/read-model |
| private URL anomaly | `private_url_seen` | operational review required | Unknown | Safety truth |

## 9. Truth Source Layers

| Layer | Role | Not allowed to decide |
| --- | --- | --- |
| First-party browser event | Public funnel observation. | Purchase truth, entitlement truth, report-ready truth. |
| `/api/track` | Privacy-filtered event transport. | Payment truth or CMS/content authority. |
| GA4 | Observation and campaign analysis. | Purchase truth, private URL absence unless reviewed. |
| Baidu Tongji | Auxiliary public traffic and privacy anomaly review. | Purchase truth or private funnel truth. |
| Backend orders/payment | Purchase truth. | Publishable content copy. |
| Backend entitlements/report access | Unlock and report access truth. | Marketing channel truth. |
| CMS/backend | Content and publish authority. | Payment truth. |
| SEO dashboard/artifacts | Read model and issue surfacing. | CMS mutation, publish, search submission, payment truth. |

## 10. Paid Ads Preconditions

Paid ads remain forbidden until all are true:

- `private_url_seen=No` from approved live review.
- Standard commercial event contract is implemented or dashboard adapter is proven.
- Unknown is displayed as `Unknown`, not `0`.
- Backend orders/payment is the purchase source of truth.
- Locale freemium policy is backend-authoritative.
- Checkout/unlock/report-ready smoke passes.
- DailyGiving is not used as trust evidence unless its readiness gate passes.
- UTM channel governance is in force.
- Claim boundary gate is passed.

## 11. Stop Conditions

| Condition ID | Severity | Detection source | Stop action | Owner | Follow-up PR type |
| --- | --- | --- | --- | --- | --- |
| `private_url_seen_yes` | P0 | GA4, Baidu, logs, sitemap, llms, issue queue | Stop paid ads, search submission, publish expansion, and distribution. | Privacy/Ops | privacy repair |
| `raw_order_id_in_analytics` | P0 | analytics payloads, page_location, logs | Stop paid ads and repair tracking redaction. | Analytics/Ops | privacy repair |
| `raw_result_or_attempt_id_in_analytics` | P0 | analytics payloads, page_location, logs | Stop paid ads and repair tracking redaction. | Analytics/Ops | privacy repair |
| `purchase_success_duplicate` | P0 | backend order/payment vs analytics mirror reconciliation | Stop purchase optimization until dedupe is proven. | Commerce/Ops | analytics or backend smoke |
| `english_sees_chinese_paywall` | P0 | locale QA, backend policy smoke | Stop English distribution and checkout promotion. | Commerce | freemium policy |
| `chinese_payment_cannot_unlock` | P0 | checkout/unlock smoke | Stop checkout promotion. | Commerce | checkout unlock smoke |
| `dailygiving_proof_leak` | P0 | DailyGiving API, storage, public page, logs | Stop public-benefit amplification and trust badges. | Benefit/Ops | DailyGiving readiness |
| `dailygiving_unsupported_public_claim` | P0 | claim scan, public copy review | Stop public-benefit amplification. | Benefit/Ops | claim boundary |
| `forbidden_claim_words` | P0 | claim scan, ads/material review | Stop material release. | Claims/Ops | claim boundary |
| `unknown_treated_as_zero` | P0 | dashboard/report QA | Stop commercial interpretation. | Analytics/Ops | dashboard contract |
| `search_channel_unsafe_queue` | P0 | Search Channel queue audit | Stop automatic search submission. | SEO/Ops | search channel repair |
| `draft_noindex_url_in_sitemap_or_submission` | P0 | sitemap, llms, search submission logs | Stop search submission. | SEO/Ops | sitemap/search repair |
| `non_canonical_url_submitted` | P0 | GSC, Baidu, IndexNow, Search Channel logs | Stop search submission. | SEO/Ops | search submission repair |

## 12. Engineering Input For `ANALYTICS-COMMERCIAL-EVENTS-01`

Proposed PR:

- PR id: `ANALYTICS-COMMERCIAL-EVENTS-01`
- Repo: `fap-web`
- Branch: `codex/analytics-commercial-events-01`
- PR title: `fix(analytics): align commercial event taxonomy`

Goal:

Standardize commercial funnel event names, legacy aliases, payload whitelist, dashboard-readable fields, and stop conditions. Do not change payment provider behavior, CMS content, publish/search state, paid ads, or DailyGiving public amplification.

Likely allowed paths:

- `lib/tracking/events.ts`
- `lib/tracking/client.ts`
- `lib/tracking/privacy.ts`
- `components/cta/**`
- `components/result/**`
- `app/(localized)/[locale]/tests/[slug]/take/**`
- `app/(localized)/[locale]/orders/**`
- `tests/contracts/**`
- `docs/analytics/**`
- `docs/codex/pr-train.yaml`
- `docs/codex/pr-train-state.json`

Required tests:

- standard event registry exists
- legacy alias bridge is stable
- payload allowlist/denylist cannot leak private identifiers
- `article_to_test_click` remains separate from `start_test`
- `begin_checkout` remains separate from `purchase_success`
- `purchase_success` mirror cannot replace backend purchase truth
- private routes are invalid landing URLs
- Unknown remains Unknown

Deferred:

- No GA4/Baidu dashboard writes
- No payment provider behavior changes
- No CMS/content changes
- No search submission
- No paid ads launch
