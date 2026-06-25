# Six Hub Paid Unlock Copy Authority Contract

Task: `SIX-HUB-PAID-UNLOCK-COPY-AUTHORITY-CONTRACT-01`

Verdict: `READY_FOR_FRONTEND_CONSUMER_GUARD`

This contract defines when fap-web must suppress stale paid-unlock disabled copy on public assessment Hub pages. It is docs/contracts only. It does not change runtime behavior, CMS data, backend APIs, search submission, deployment, result pages, take submission, private attempts, payment/order/benefit logic, sitemap, llms, schema, hreflang, canonical, robots, or noindex state.

## Agents

| Role | Agent |
| --- | --- |
| Producing agent | `seo_geo_control` |
| Collaborating agent | `assessment_hub` |
| Collaborating agent | `claim_privacy_safety_gate` |
| Collaborating agent | `runtime_qa` |

## Scope

| Field | Value |
| --- | --- |
| Affected scales | `BIG5_OCEAN`, `RIASEC`, `EQ_60`, `ENNEAGRAM` |
| Affected locales | `en`, `zh` |
| Affected public Hub URL count | `8` |
| Source classification | `fap_web_consumer_guard` |
| Source risk | `frontend_local_copy_risk` |
| CMS source status | `cms_not_source` |
| Runtime QA status | `HOLD_DEPLOY_RUNTIME_QA` |

## Backend Authority Predicate

fap-web may suppress the paid-unlock disabled copy only when backend public lookup authority proves all required predicates:

- `paywall_mode=free_only`
- `commercial.price_tier=FREE`
- `report_unlock_sku=null`
- `upgrade_sku=null`
- `upgrade_sku_anchor=null`
- `offers=[]`

Optional backend markers may strengthen but are not required for this contract:

- `free_full_report_mode=true`
- `paywall_suppressed=true`
- `commercial_state=disabled_by_free_full_report_mode`

If required public lookup authority is missing or contradictory, downstream work must stop with `NEEDS_BACKEND_MARKER_FIRST` instead of inventing frontend commercial truth.

## Forbidden Public Hub Copy Families

When the authority predicate is satisfied, public Hub pages must not render:

- `Only the free report preview is available right now.`
- `Paid unlock is temporarily disabled.`
- `当前仅开放免费报告预览`
- `付费解锁暂未开放`
- `free preview only`
- `preview-only report`
- `paid unlock later`
- `full report locked`
- `upgrade required for full report`
- `pay to see full result`

## Allowed Copy Direction

Downstream frontend repair may either suppress the availability card entirely or render a neutral state. Any new copy must stay within these directions:

- full result/report available after completion when backend authority supports it
- neutral availability state
- method boundary
- no hidden paywall implication
- no final CMS copy in this contract

Disallowed directions:

- paid unlock disabled
- preview-only
- future paid unlock
- paid upgrade implication

## Claim Boundaries

| Scale | Boundary |
| --- | --- |
| `BIG5_OCEAN` | No diagnosis, hiring, salary, fixed identity, or official 32-type claim. |
| `RIASEC` | Examples only; no ability, admission, hiring, salary, or deterministic career recommendation claim. |
| `EQ_60` | Non-clinical; no relationship, employment, or life-outcome guarantee. |
| `ENNEAGRAM` | No final/fixed type certainty, clinical claim, or relationship verdict. |

## Status Vocabulary

- `READY_FOR_FRONTEND_CONSUMER_GUARD`
- `NEEDS_BACKEND_MARKER_FIRST`
- `NEEDS_CMS_COPY_FIX`
- `BLOCKED_PRIVATE_LEAK`
- `HOLD_DEPLOY_RUNTIME_QA`

## Hard HOLD

- no CMS
- no publish
- no search submission
- no provider calls
- no deploy
- no runtime QA before deploy
- no sitemap/llms/schema/hreflang/canonical/noindex mutation
- no private data
- no attempt creation
- no answer submission
- no payment/order/benefit mutation

## Next Step

The next scoped implementation PR is `SIX-HUB-PAID-UNLOCK-FRONTEND-CONSUMER-GUARD-01`. Runtime QA remains held until that PR is merged and a separate exact frontend production deploy SHA is authorized.
