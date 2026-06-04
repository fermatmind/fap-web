# Help Content Packages Archive

Status: non-publishable draft input archive.

This directory archives six GPT-5.5 Pro / operator-approved Help package inputs for Window 9 service trust work. The archived files are inputs for future CMS draft creation only. They are not live Help pages, not CMS drafts, and not publishable content.

## Archived Packages

| package | source files | status |
| --- | --- | --- |
| `UNLOCK-FAILURE-HELP-CARD-01` | Markdown + YAML | draft input only |
| `PAYMENT-REFUND-FAQ-PACKAGE-01` | Markdown + YAML | draft input only |
| `RESULT-RECOVERY-FAQ-01` | Markdown + YAML | draft input only |
| `PRIVACY-FAQ-PACKAGE-01` | Markdown + YAML | draft input only |
| `NONDIAGNOSTIC-HELP-COPY-01` | Markdown + YAML | draft input only |
| `DATA-DELETION-REQUEST-FAQ-01` | Markdown + YAML | draft input only |

## Required Flags

Every archived package is locked by `docs/content/help/generated/help-content-packages.v1.json` with:

- `publish_allowed=false`
- `cms_draft_created=false`
- `runtime_changed=false`
- `content_generated_by_codex=false`
- `operator_policy_applied=true`
- `requires_operator_review=true`
- `requires_cms_authority=true`

## Operator Policy Snapshot

- Refund: allowed within 7 days when the user cannot obtain the complete report.
- Unlock failure SLA: 24h handling path.
- Support channel: email.
- Result retention: 2 years.
- Result recovery method: email.
- Data deletion: allowed.
- Account deletion: allowed.
- Locale policy: zh/en same.
- Order identifier policy: email-first; public Help must not request raw order/payment/result identifiers, and public pages, schema, analytics payloads, examples, and URLs must not include raw private identifiers.

## Scope Boundary

This archive does not create CMS drafts, publish content, change runtime behavior, change payment/order/result flows, add routes, add schema, submit search URLs, access private URLs, or record raw order/payment/result identifiers.

Future PRs must validate CMS authority, package boundaries, CMS draft preflight, schema rules, footer discoverability, and support-flow privacy before these inputs can move toward CMS draft creation.
