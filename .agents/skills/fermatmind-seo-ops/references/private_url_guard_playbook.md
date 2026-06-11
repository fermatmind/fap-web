# Private URL Guard Playbook

Purpose: prevent private or sensitive URLs from entering public SEO surfaces.

Private paths include:

- result.
- results.
- order.
- orders.
- payment.
- pay.
- checkout.
- share.
- history.
- take.
- report-private.

Sensitive identifiers include:

- email.
- order ID.
- payment ID.
- result ID.
- attempt ID.
- report ID.
- token.
- secret.
- transaction ID.

Check these surfaces:

- article body.
- CTA URLs.
- canonical.
- hreflang.
- schema.
- sitemap.
- llms.
- Search Channel Queue.
- analytics query strings.

Decision:

- `PRIVATE_URL_SAFE`.
- `PRIVATE_URL_WARNING`.
- `PRIVATE_URL_BLOCKED`.

No-go: never include private URLs in public reports except redacted evidence labels.
