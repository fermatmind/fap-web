# Support Flow Smoke

Decision: CONDITIONAL_PUBLIC_SUPPORT_HUB_EXISTS_BUT_SERVICE_SUPPORT_FLOW_NOT_READY.

The public support hub route family exists and is wired to public CMS/API surfaces. It is not yet a complete commercial service support flow because no approved service Help routes, structured unlock-failure workflow, verified support contact, or safe submission contract exists in frontend/runtime authority.

## Smoke Matrix

| Surface | Public route status | Source of truth | Smoke result | Gap |
| --- | --- | --- | --- | --- |
| Support hub | `/en/support`, `/zh/support` | Help public gateway | Conditional pass | Requires published gateway content; missing gateway returns 404. |
| Help root | `/en/help`, `/zh/help` | Redirect to support | Pass | None for route hygiene. |
| Help FAQ/contact | `/en/help/faq`, `/zh/help/faq`, `/en/help/contact`, `/zh/help/contact` | ContentPage | Conditional pass | CMS content and schema authority remain gated. |
| Support articles | `/en/support/articles/[slug]`, `/zh/support/articles/[slug]` | SupportArticle | Conditional pass | CTA URL safety and service workflow fields require backend/CMS gate. |
| Interpretation guides | `/en/support/guides/[slug]`, `/zh/support/guides/[slug]` | InterpretationGuide | Conditional pass | Result explanation only; result recovery remains separate. |
| Unlock failure handling | Pending public service Help route | ContentPage plus SupportArticle | No-go for support-flow readiness | `unlock_failure`, handling time, safe info fields, and support contact are missing. |
| Payment/refund handling | Pending public service Help route | ContentPage plus SupportArticle | No-go for support-flow readiness | Eligibility, exclusions, handling time, policy version, and support contact are missing. |
| Data deletion request | Pending public service Help route | ContentPage plus SupportArticle | No-go for support-flow readiness | Request handling, verification, retained-data exceptions, and support contact are missing. |

## Boundary

- No support form was created or changed.
- No CMS draft was created, mutated, or published.
- No private order, result, share, pay, payment, history, tokenized, or user-specific URL was accessed.
- No raw order, payment, result, or attempt identifier was added.
- No support email or exact operational SLA was invented.

## Required Follow-Up Before Commercial Support Readiness

- Backend/CMS authority for service Help pages.
- Structured support contact field.
- Structured handling time and required/forbidden user-info fields.
- CTA URL policy for SupportArticle primary CTA links.
- Smoke test that public support routes do not request raw private identifiers.
