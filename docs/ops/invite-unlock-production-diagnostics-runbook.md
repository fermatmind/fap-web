# Invite Unlock Production Diagnostics Runbook

## Purpose

Provide a single production verification path for invite unlock state across API, logs, and UI.

This runbook is for the MBTI result flow and reuses the existing contracts:

- `invite_unlock_v1`
- `invite_unlock_diag_v1`

No fallback state machine is allowed in consumer code. The backend contract is the source of truth.

## Required Inputs

- `attempt_id` (production)
- Result page tokenized URL for that attempt (`/result/{attempt_id}?token=fm_***`)
- API auth token (`fm_***`) with read access for the attempt
- Production log read path (Kubernetes / PM2 / central log query)

## API Verification (Source of Truth)

### 1) Report access snapshot

```bash
curl -sS \
  -H "Authorization: Bearer $FM_TOKEN" \
  "https://api.fermatmind.com/api/v0.3/attempts/$ATTEMPT_ID/report-access" | jq .
```

Must inspect:

- `access_state`
- `report_state`
- `unlock_stage`
- `unlock_source`
- `invite_unlock_diag_v1.status`
- `invite_unlock_diag_v1.status_reason`
- `invite_unlock_diag_v1.progress_percent`
- `invite_unlock_diag_v1.snapshot_at`

### 2) Invite progress snapshot

```bash
curl -sS \
  -H "Authorization: Bearer $FM_TOKEN" \
  "https://api.fermatmind.com/api/v0.3/attempts/$ATTEMPT_ID/invite-unlocks" | jq .
```

Must inspect:

- `unlock_stage`
- `unlock_source`
- `invite_unlock_diag_v1.status`
- `invite_unlock_diag_v1.completed_invitees`
- `invite_unlock_diag_v1.required_invitees`
- `invite_unlock_diag_v1.remaining_invitees`
- `invite_unlock_diag_v1.progress_percent`
- `invite_unlock_diag_v1.snapshot_at`

### 3) Invite create/read refresh (optional but recommended)

```bash
curl -sS -X POST \
  -H "Authorization: Bearer $FM_TOKEN" \
  "https://api.fermatmind.com/api/v0.3/attempts/$ATTEMPT_ID/invite-unlocks" | jq .
```

## Log Verification (Production)

## Required Events

- `INVITE_UNLOCK_API_DIAGNOSTIC`
- `REPORT_ACCESS_INVITE_UNLOCK_DIAGNOSTIC`
- `INVITE_UNLOCK_COMPLETION_DIAGNOSTIC` (when completion happened)

## Required Correlation Fields

- `attempt_id`
- `unlock_stage`
- `unlock_source`
- `diagnostic_status` / `status`
- `progress_percent`
- `completed_invitees`
- `required_invitees`
- `remaining_invitees`
- `snapshot_at` / event timestamp

## Query Examples

Use the path that matches your deployment topology.

### A) PM2 / file logs

```bash
grep -E "INVITE_UNLOCK_API_DIAGNOSTIC|REPORT_ACCESS_INVITE_UNLOCK_DIAGNOSTIC|INVITE_UNLOCK_COMPLETION_DIAGNOSTIC" /path/to/production.log \
  | grep "$ATTEMPT_ID"
```

### B) Kubernetes logs

```bash
kubectl logs -n <namespace> deploy/<api-deployment> --since=2h \
  | grep -E "INVITE_UNLOCK_API_DIAGNOSTIC|REPORT_ACCESS_INVITE_UNLOCK_DIAGNOSTIC|INVITE_UNLOCK_COMPLETION_DIAGNOSTIC" \
  | grep "$ATTEMPT_ID"
```

### C) Centralized query (example pattern)

Filter condition:

- event name in (`INVITE_UNLOCK_API_DIAGNOSTIC`, `REPORT_ACCESS_INVITE_UNLOCK_DIAGNOSTIC`, `INVITE_UNLOCK_COMPLETION_DIAGNOSTIC`)
- `attempt_id = $ATTEMPT_ID`

## UI Verification

Open the production result page for the same `attempt_id`:

- `/zh/result/{attempt_id}?token=fm_***` (or `/en/result/...`)

Must verify:

- Progress block present: `Invite unlock progress / 邀请解锁进度`
- Status label is correct:
  - `Locked / 未解锁`
  - `Partial unlock / 部分解锁`
  - `Invite full unlock / 邀请完全解锁`
  - `Mixed unlock / 混合解锁`
  - `Payment full unlock / 支付完全解锁`
- Text does not conflict with `unlock_stage` and `unlock_source`
- Polling refresh updates visible status when backend moves from `partial` to `full`

## Cross-layer Consistency Rules

For the same `attempt_id` and close time window:

1. `API -> UI`: `unlock_stage` and `unlock_source` must match rendered status label.
2. `API -> Log`: progress fields and status must match diagnostic event payload.
3. `Log -> UI`: no state jump in UI that is missing in logs.

If any one layer is missing evidence, verdict must be `BLOCKED`, not `PASS`.
