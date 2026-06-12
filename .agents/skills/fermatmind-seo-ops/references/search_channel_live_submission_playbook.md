# Search Channel Live Submission Playbook

Use this workflow to review Search Channel Queue readiness and draft exact operator approval text. Do not execute live submissions from this skill.

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
| Live gates | Closed by default; opened only for bounded command when explicitly approved. |
| Prior error | If provider-side blocker exists, run channel-specific retry guard first. |

## Exact approval text draft format

Label as `operator approval text draft` and include:

```text
I explicitly approve SEARCH-CHANNEL-LIVE-02 live submission for queue item <id> channel <channel> URL <url>.
```

Add any required bounded live-gate text only when executor evidence requires it.

## Decisions

- `GO_FOR_EXACT_OPERATOR_APPROVAL_TEXT`.
- `NO_GO_FOR_SEARCH_CHANNEL`.
- `RUN_BAIDU_RETRY_GUARD_FIRST`.
- `ACCESS_REQUIRED`.

## Output

Use `assets/search_channel_live_submission_hold_template.md`.

## Hard gates

Do not enqueue, approve, submit, retry, call live APIs, or change queue state.
