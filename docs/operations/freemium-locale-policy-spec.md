# Freemium Locale Policy Spec

Scope: `COMMERCIAL-CONTRACTS-FOUNDATION-01`

Mode: product policy contract only. This document does not implement frontend logic, backend logic, checkout behavior, pricing, CMS content, landing copy, paid ads, or deployment.

## 1. Audit Conclusion

Status: revised.

The desired business policy is valid as a target policy, but current repository evidence does not prove that the policy is backend-authoritative. The Day 1 fap-api scan found a general MBTI CNY 1.99 SKU and entitlement chain, but did not find a single backend-owned locale freemium policy that governs offer visibility, order creation, report access, and entitlement behavior across English and Chinese routes.

Current commercial launch decision: NO-GO.

## 2. Desired Business Policy

English target policy:

- Free tests.
- Free full result until 2026-12-31.
- No CNY 1.99 paywall.
- No Chinese-only SKU exposure.
- No English route should enter a CNY checkout path for the covered policy.

Chinese target policy:

- Free tests.
- Free basic result.
- Selected high-value report/result unlock at CNY 1.99.
- Payment success must grant the corresponding unlock.
- Report unlock and report ready must be backed by backend entitlement/report truth.

## 3. Current Repo-Supported Facts

Current facts from `backend/docs/operations/freemium-locale-policy-scan-2026-06-03.md`:

- `MBTI_REPORT_FULL_199` exists as an active MBTI SKU.
- Price is `199` cents.
- Currency is `CNY`.
- Benefit type is `report_unlock`.
- Benefit code is `MBTI_REPORT_FULL`.
- Scope is attempt-level.
- Backend order and entitlement services can support report unlock.
- Frontend checkout code can send a region derived from UI locale.

Current gaps:

- No backend-authoritative English full-free-through-2026-12-31 policy was found.
- No SKU-level locale gate was found for the CNY 1.99 SKU.
- No single backend policy was found that governs offer generation, order creation, report access, and entitlement resolution.
- Frontend locale-derived region cannot be the freemium source of truth.

## 4. Unknowns

The following are Unknown and must not be treated as implemented:

- Whether English users are guaranteed full free access until 2026-12-31.
- Whether English users are blocked from Chinese-only CNY checkout across all paths.
- Whether Chinese paid unlock policy is restricted to selected surfaces only.
- Whether checkout visibility, order creation, entitlement grant, and report access all share the same backend policy.
- Whether legacy SKU anchors can expose paid offers to unintended locales.
- Whether dashboard metrics can distinguish locale policy violations from normal funnel behavior.

Unknown is not `0`, not `No`, and not `implemented`.

## 5. Required Backend Authority

Freemium truth must live in fap-api or another approved backend authority layer. fap-web must consume the policy; it must not invent or override it.

Required authority fields:

- policy id/version
- locale
- region
- scale/test slug
- free test allowed
- free full result allowed
- free-until date
- paywall allowed
- eligible SKU list
- currency
- price
- report entitlement policy
- checkout availability
- order creation allow/deny reason
- unlock success truth
- report ready truth

The backend policy must govern:

- offer visibility
- report locked/partial/full state
- checkout/order creation
- entitlement grant
- post-payment report access
- dashboard/reporting labels

## 6. Locale Rules

English policy requirements:

- `en` routes must not rely on frontend copy or constants to prove free-full access.
- `en` routes must not expose CNY-only SKUs unless the backend policy explicitly allows it.
- `en` routes must not show a Chinese-only paywall for covered tests.
- `en` full-free-until state must be backend-readable and expiry-aware.

Chinese policy requirements:

- `zh` routes may show a free/basic result when the backend policy allows partial access.
- `zh` routes may expose selected CNY 1.99 unlock offers when the backend policy allows the SKU.
- `zh` checkout must grant entitlement after backend payment success.
- `zh` paid users must not remain locked if the payment and entitlement truth are successful.

## 7. Locale Mismatch Stop Conditions

| Condition ID | Severity | Detection source | Stop action | Owner | Follow-up PR type |
| --- | --- | --- | --- | --- | --- |
| `en_sees_cny_sku` | P0 | locale QA, backend policy smoke, dashboard anomaly | Stop English distribution and paid ads. | Commerce/Ops | freemium policy |
| `en_sees_chinese_paywall` | P0 | locale QA, page smoke, backend policy smoke | Stop English distribution. | Commerce/Ops | freemium policy |
| `zh_cannot_see_enabled_cny_offer` | P1 | locale QA, backend policy smoke | Stop checkout promotion. | Commerce/Ops | freemium policy |
| `paid_user_cannot_unlock` | P0 | checkout/unlock smoke, backend entitlement | Stop checkout promotion. | Commerce/Ops | checkout unlock smoke |
| `sku_price_mismatch` | P0 | SKU catalog, checkout smoke | Stop paid ads and checkout promotion. | Commerce/Ops | freemium policy |
| `free_until_only_in_copy` | P0 | docs/code review | Stop commercial launch. | Commerce/Ops | freemium policy |

## 8. Dashboard Rules

Commercial dashboards must distinguish:

- policy eligible vs ineligible
- offer shown vs offer hidden
- checkout begun vs purchase success
- purchase success vs report unlock
- report unlock vs report ready
- analytics observation vs backend truth

Revenue, purchase success, and unlock truth must come from backend/Ops data. GA4 and Baidu purchase-like events can only mirror or observe.

## 9. Follow-up PR Input

Recommended next backend PR:

- PR id: `FREEMIUM-LOCALE-POLICY-01`
- Repo: `fap-api`
- Branch: `codex/freemium-locale-policy-01`
- PR title: `fix(monetization): enforce locale freemium policy`

Goal:

Add a backend-authoritative locale monetization policy contract that defines English full-free and Chinese CNY 1.99 unlock behavior, then gates offer generation, order creation, report access, and entitlement state through that policy.

Likely scope:

- `backend/app/Services/Commerce/**`
- `backend/app/Services/Report/**`
- `backend/config/**`
- `backend/tests/Feature/Commerce/**`
- `backend/tests/Feature/Report/**`
- `backend/docs/operations/**`
- `docs/codex/pr-train.yaml`
- `docs/codex/pr-train-state.json`

Required checks:

- English full-free policy tests.
- Chinese CNY 1.99 offer/order/entitlement tests.
- Locale mismatch rejection tests.
- Checkout unlock smoke tests.
- JSON/YAML parse.
- `git diff --check`.

Deferred:

- No landing page copy.
- No paid ads.
- No CMS content.
- No payment provider behavior change unless explicitly scoped.
- No production checkout execution without separate approval.
