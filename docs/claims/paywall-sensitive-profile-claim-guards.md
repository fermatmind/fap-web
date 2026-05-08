# Paywall / Sensitive / Profile Claim Guards

Scope: PR-SCB-06

Train: semantic-claim-boundary-enforcement-train

Runtime behavior changed: no

## Goal

PR-SCB-06 locks paywall, sensitive/clinical/ability, profile, and freemium claim boundaries.

This PR is contract guard only. It does not change checkout, payment, entitlement, report access, paywall UI, profile/memory runtime, saved careers, sensitive result runtime, or visible copy.

## Guarantee Boundary

Allowed only for access / delivery / continuity:

- `访问保障`
- `报告可查看保障`
- `支付后交付保障`
- `access guarantee`
- `delivery guarantee`
- `continuity guarantee`

Forbidden for outcome / accuracy / career success / report conclusions:

- `结果准确保证`
- `职业成功保证`
- `报告结论保证`
- `career success guarantee`
- `accuracy guarantee`
- `outcome guarantee`

## Sensitive / Clinical / Ability Boundary

- No diagnosis claims.
- No treatment claims.
- No replacing professional help.
- Emotional / mental-health state must be descriptive self-check only.
- IQ / ability tests cannot evaluate human worth.
- Ability tests cannot imply hiring or employment screening suitability.

## Profile Boundary

- saved careers != UASP profile memory
- profile_contribution != already stored profile signal
- profile memory writes remain blocked
- sensitive signal persistence remains blocked

## Freemium Boundary

- MBTI = full_loop
- Big Five / RIASEC != full commerce loop
- SKU exists != full_loop
- offer card exists != full_loop
- backend_ready != monetization_ready

## Non-Runtime Guarantees

- Checkout/payment/entitlement changed: no
- Report access changed: no
- Paywall UI changed: no
- Profile/memory runtime changed: no
- Saved careers changed: no
- Sensitive result runtime changed: no
- Visible copy changed: no
