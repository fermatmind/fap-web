# Freemium Runtime Coverage

Train: public-runtime-authority-convergence-train
Scope: PR-PRAC-06
Runtime behavior changed: no

This artifact maps current public freemium runtime coverage. It does not change checkout, payment, entitlement, report access, SKU logic, commerce runtime, paywall UI, public funnel behavior, or result/report rendering.

## Classification Enum

- `full_loop`
- `backend_ready`
- `frontend_partial`
- `MBTI_only`
- `cross_scale_partial`
- `blocked`
- `unknown`

## Current Runtime Picture

| Capability | Coverage | Reality |
| --- | --- | --- |
| MBTI result to unlock loop | `full_loop` | MBTI has locked result/report, SKU resolution, checkout/order creation, pay wait, paid order delivery, entitlement/report access, PDF, and history surfaces. |
| Big Five paywall coverage | `cross_scale_partial` | Big Five has result access, history/PDF/readable surfaces, V2 module gating, and offer card support; it is not proven as the same public checkout loop as MBTI. |
| Invite unlock | `MBTI_only` | MBTI invite unlock progress and partial/full unlock UI are present; Big Five invite unlock is not proven. |
| Bundle logic | `cross_scale_partial` | Module gates use `modules_allowed` / `modules_preview`; no advanced multi-SKU bundle engine is proven in public runtime. |
| Email / retention | `frontend_partial` | Email bind, preferences, unsubscribe, report recovery copy, and post-purchase retention surfaces exist; scheduled production lifecycle proof is not established by this train. |

## Required Full-Loop Evidence

MBTI full-loop evidence path:

```text
result/report
-> locked/full report
-> MBTI_REPORT_FULL_199 checkout
-> /pay/wait order wait
-> paid order delivery
-> entitlement/report access
-> report PDF
-> history/order recovery
```

## No Runtime Change Statement

PR-PRAC-06 adds coverage inventory and contract tests only. It does not modify commerce, checkout, payment providers, order recovery, entitlement checks, report access, report PDF, auth, scoring, attempts, or public UI behavior.
