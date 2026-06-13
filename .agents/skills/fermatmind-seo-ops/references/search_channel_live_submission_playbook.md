# Search Channel Live Submission Playbook

Use this workflow to review Search Channel Queue readiness and draft exact operator approval text. Execute live submissions only through the official bounded executor when the current Authorization Profile and exact approval allow it.

## Inputs

- queue item ID.
- channel.
- URL.
- queue state/export.
- URL Truth evidence.
- CMS flags.
- public runtime evidence.
- channel config readiness evidence.
- prior provider response if any.

## Readiness checks

| Check | Requirement |
|---|---|
| Queue authority | Item exists in Search Channel Queue authority path. |
| URL truth | URL is public canonical and matches article. |
| Draft/noindex | Draft and noindex URLs are blocked unless task is explicitly read-only. |
| CMS flags | Public/indexable/sitemap/llms state matches channel policy. |
| Claim/private guard | Safe. |
| Channel config | Endpoint/key/site/token present where applicable; secrets never printed. |
| Exact approval phrase | Channel, queue item ID, and URL match executor expectation. |
| Approval state | Queue item must be `approval_state=approved` before live submit. |
| Dry-run | Queue item live dry-run must pass with no issues before live submit. |
| Live gates | Do not rely on temporary global production gates; use bounded executor approval/token/queue-state requirements. |
| Prior error | If provider-side blocker exists, run channel-specific retry guard first. |

## Exact approval text draft format

Label as `operator approval text draft` and include:

```text
I explicitly approve SEARCH-CHANNEL-LIVE-02 live submission for queue item <id> channel <channel> URL <url>.
```

Add any required bounded live-gate text only when executor evidence requires it.

## Bounded executor rules

- Use `search-channel-approve` for operator approval state.
- Use `search-channel-submit-approved` for live submission.
- Pass explicit `--queue-ids`; never use an unbounded selector.
- Pass one channel at a time; do not use `--channels=all`.
- Submit each item once. A repeat submission requires an explicit requeue flow.
- Do not call provider APIs directly.
- Do not print Baidu token, IndexNow key, or raw secret material.
- Do not include GSC in this executor path.

## Decisions

- `GO_FOR_EXACT_OPERATOR_APPROVAL_TEXT`.
- `NO_GO_FOR_SEARCH_CHANNEL`.
- `RUN_BAIDU_RETRY_GUARD_FIRST`.
- `GO_FOR_SEARCH_CHANNEL_APPROVE`.
- `GO_FOR_SEARCH_CHANNEL_SUBMIT_APPROVED`.
- `ACCESS_REQUIRED`.

## Output

Use `assets/search_channel_live_submission_hold_template.md`.

## Hard gates

Do not enqueue, approve, submit, retry, call live APIs, or change queue state unless the current task explicitly authorizes the exact bounded queue action and the relevant dry-run has passed.
