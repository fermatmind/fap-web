# Ready to Publish Queue

Use this workflow to stage articles that have passed review but should wait for a controlled operator publish window.

## Inputs

- article slug and locale.
- Article ID if draft exists.
- preview URL.
- package QA decision.
- preview QA decision.
- claim/operator review decision.
- desired publish window.
- release holds.

## Queue columns

| Column | Meaning |
|---|---|
| `queue_id` | Deterministic local queue identifier. |
| `article_id` | CMS Article ID if known. |
| `locale` | `zh` or `en`. |
| `slug` | Article slug. |
| `preview_url` | Ops preview URL if available. |
| `package_qa` | GO/NO_GO/Access required. |
| `preview_qa` | GO/NO_GO/Access required. |
| `claim_gate` | accepted/blocked/not_reviewed. |
| `publish_ready` | yes/no. |
| `indexability_hold` | yes/no. |
| `schema_hold` | yes/no. |
| `hreflang_hold` | yes/no. |
| `sitemap_hold` | yes/no. |
| `llms_hold` | yes/no. |
| `search_channel_hold` | yes/no. |
| `next_operator_action` | Required human action. |

## Decisions

- `READY_FOR_OPERATOR_PUBLISH_WINDOW`.
- `NOT_READY_BLOCKED`.
- `ACCESS_REQUIRED`.

## Output

Use `assets/ready_to_publish_queue_template.md`.

## Hard gates

Do not publish, schedule publish, mutate CMS, change flags, submit search, or trigger revalidation.
