# Help Footer Link QA

Decision: CONDITIONAL_EXISTING_FOOTER_REACHES_SUPPORT_POLICY_BUT_SERVICE_HELP_ROUTES_PENDING.

The current footer exposes public support and policy routes in both locales, and it does not expose private order, result, share, pay, payment, history, tokenized, or user-specific routes. The service Help layer remains incomplete because dedicated payment/refund, unlock failure, result recovery, and data deletion Help routes are still pending CMS/backend authority.

## Current Footer Reachability

| Surface | Current footer route status | Notes |
| --- | --- | --- |
| Support | Present | Footer links to localized `/support`. |
| Privacy | Present | Footer links to localized `/privacy`. |
| Terms | Present | Footer links to localized `/terms`. |
| Policy overview | Present | Footer links to localized `/policies`. |
| Method boundaries | Present | Footer links to localized `/method-boundaries`. |
| Help FAQ | Not in footer | Existing route family is tracked separately and must not be linked until route availability and authority are verified. |
| Contact Help | Not in footer | Existing route family is tracked separately and must not be linked until route availability and authority are verified. |
| Payment/refund Help | Pending | Dedicated service Help route is not linked from footer. |
| Unlock failure Help | Pending | Dedicated service Help route is not linked from footer. |
| Result recovery Help | Pending | Dedicated service Help route is not linked from footer. |
| Data deletion Help | Pending | Dedicated service Help route is not linked from footer. |

## QA Boundary

- No runtime footer link was added or changed.
- No CMS content was created, drafted, mutated, or published.
- No private URL, order, payment, result, share, history, tokenized, or user-specific surface was accessed.
- No raw order, payment, or result identifier was added to docs or tests.
- Missing service Help destinations remain pending instead of being invented in frontend navigation.

## Follow-Up Requirement

Footer discoverability should be revisited only after CMS/backend authority exists for service Help destinations and route availability is confirmed for both locales.
