# IndexNow Bounded Submission

Use only after Search Channel Queue readiness and operator review pass.

## Rules

- Submit only selected URLs.
- Submit only the `indexnow` channel.
- Submit only explicit queue item IDs that already passed Search Channel readiness and operator approval.
- Use `search-channel-submit-approved`; do not call the IndexNow provider directly.
- Default to dry-run.
- Dry-run must return `issues=[]` before submit.
- Queue item must have `approval_state=approved`.
- Submit each queue item once.
- Do not mix Baidu, GSC, 360, Sogou, or Shenma in the same command.
- Do not use `--channels=all`.
- Do not print IndexNow key or provider secret material.
- If the executor demands an exact phrase and it is not present, stop with `BLOCKED_NEEDS_EXACT_INDEXNOW_APPROVAL`.
- If bounded executor approval is missing, record held state and do not retry blindly.

## Evidence

Record queue item IDs, URLs, approval state, dry-run output, redacted provider response, external calls attempted, external calls committed, duplicate/requeue status, and final decision.
