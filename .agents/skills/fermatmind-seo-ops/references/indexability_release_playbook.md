# Indexability Release Playbook

Use this workflow only after explicit operator approval for a bounded article ID and URL.

## Required approval fields

- exact task name.
- exact Article ID.
- exact public URL.
- explicit approval for claim gate indexability status if needed.
- explicit approval for `make indexable`.
- explicit hold/allow decision for sitemap.
- explicit hold/allow decision for llms.
- explicit hold/allow decision for schema.
- explicit hold/allow decision for hreflang.
- explicit hold/allow decision for Search Channel/GSC/Baidu/IndexNow.
- explicit hold/allow decision for ISR/content release signal.

## Default release policy

If approval is ambiguous, stop. Default holds:

- sitemap eligible: hold.
- llms eligible: hold.
- schema: hold.
- hreflang: hold.
- Search Channel: hold.
- GSC/Baidu/IndexNow/360/Sogou/Shenma: hold.
- ISR/revalidation: hold unless explicitly coupled and approved.

## Post-release verification

Check:

- public URL HTTP 200.
- robots no longer contains `noindex` if make-indexable approved.
- no sitemap/llms exposure unless approved.
- JSON-LD absent if schema hold.
- hreflang/alternate absent if hreflang hold.
- Search Channel state unchanged unless approved.
- no private URL/token/order/result/payment/user ID.
- CTA still public canonical and trackable/attributable.

## Outputs

Use `assets/indexability_release_template.md`.

Decision values:

- `INDEXABILITY_RELEASE_PASS`.
- `INDEXABILITY_RELEASE_PASS_WITH_HOLDS`.
- `INDEXABILITY_RELEASE_FAIL`.
- `STOP_COUPLED_ACTION_NOT_APPROVED`.
- `ACCESS_REQUIRED`.
