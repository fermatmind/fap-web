# IndexNow Bounded Submission

Use only after Search Channel Queue readiness and operator review pass.

## Rules

- Submit only selected URLs.
- Submit only the `indexnow` channel.
- Dry-run must return `issues=[]` before submit.
- Submit each queue item once.
- Do not mix Baidu, GSC, 360, Sogou, or Shenma in the same command.
- If the executor demands an exact phrase and it is not present, stop with `BLOCKED_NEEDS_EXACT_INDEXNOW_APPROVAL`.
- If live gates are disabled, record held state and do not retry blindly.

## Evidence

Record queue item IDs, URLs, dry-run output, live-gate state, external calls attempted, external calls committed, and final decision.
