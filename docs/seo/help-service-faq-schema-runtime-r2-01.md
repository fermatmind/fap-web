# HELP-SERVICE-FAQ-SCHEMA-RUNTIME-R2-01

Decision: `BLOCKED_BY_CMS_SCHEMA_DISABLED_AND_VISIBLE_PARITY`.

This is a scoped frontend schema-runtime evidence pass after Help post-publish smoke R2. It does not change runtime rendering because the current blocker is upstream CMS/backend authority, not a frontend rendering gap.

## Evidence

| Check | Result |
| --- | --- |
| Public Help ContentPage API rows checked | 12 |
| HTTP 200 rows | 12/12 |
| `schema_enabled=true` rows | 0/12 |
| `schema_enabled=false` rows | 12/12 |
| `faq_items` total | 48 |
| `faq_items` per row | 4 |
| Visible FAQ parity count | 0/48 |
| Tokenized private URL pattern hits | 0 |

The deployed Help detail route already reads backend/CMS `ContentPage` data and gates `FAQPage` JSON-LD on `schemaEnabled` plus visible FAQ parity. Since the public API returns `schema_enabled=false` for all 12 Help service pages, the frontend must not bypass the backend switch. Since the visible parity count is also 0, emitting `FAQPage` would violate the visible-FAQ schema rule.

## Outcome

No frontend runtime repair is applied in this PR. The correct next step is a backend/CMS-authoritative sync or content adjustment that:

- sets `schema_enabled=true` only for approved Help pages,
- ensures FAQ question and answer text is visibly rendered on the page,
- keeps `is_indexable=false`,
- keeps Help service pages out of sitemap and `llms.txt` until separately approved,
- does not expose private result/order/share/pay/payment/history URLs.

## Boundary

This PR does not mutate CMS rows, publish, deploy, submit search URLs, access private result/order/share/pay/payment/history URLs, read secrets/env/cookies/tokens, run payment/refund flows, change payment-provider behavior, or claim Operator approval.

## Next

Recommended next task: `HELP-CONTENT-DRAFT-SCHEMA-CMS-SYNC-01`.
