#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
guard="$repo_root/scripts/ops/fermatmind-operation-guard"
test_root="$(mktemp -d)"
trap 'rm -rf "$test_root"' EXIT
export FERMATMIND_OPERATION_ROOT="$test_root/operations"

key_a="$(CODEX_THREAD_ID=window-a "$guard" key --repository fermatmind/fap-api --workflow .github/workflows/example.yml --scope example --identity 'sha=abc|mode=apply')"
key_b="$(CODEX_THREAD_ID=window-b "$guard" key --repository fermatmind/fap-api --workflow .github/workflows/example.yml --scope example --identity 'sha=abc|mode=apply')"
test "$key_a" = "$key_b"
[[ "$key_a" =~ ^[0-9a-f]{64}$ ]]

owner="$(CODEX_THREAD_ID=window-a "$guard" claim --key "$key_a" --repo fermatmind/fap-api --scope example --lane controlled --branch codex/example --phase preflight)"
grep -q '^decision=owner$' <<<"$owner"
reentrant="$(CODEX_THREAD_ID=window-a "$guard" claim --key "$key_a" --repo fermatmind/fap-api --scope example --lane controlled)"
grep -q '^reentrant=true$' <<<"$reentrant"
attached="$(CODEX_THREAD_ID=window-b "$guard" claim --key "$key_a" --repo fermatmind/fap-api --scope example --lane controlled)"
grep -q '^decision=attached$' <<<"$attached"

set +e
CODEX_THREAD_ID=window-b "$guard" dispatch --key "$key_a" -- true >/dev/null 2>&1
dispatch_status=$?
set -e
test "$dispatch_status" -eq 75

CODEX_THREAD_ID=window-a "$guard" heartbeat --key "$key_a" --phase github --run-id 123 --run-attempt 1 >/dev/null
status="$(CODEX_THREAD_ID=window-b "$guard" status --key "$key_a")"
grep -q '^phase=github$' <<<"$status"
grep -q '^run_id=123$' <<<"$status"
test "$(grep '^owner_hash=' <<<"$status" | cut -d= -f2)" != "window-a"

set +e
CODEX_THREAD_ID=window-b "$guard" claim --key "$key_a" --repo fermatmind/fap-api --scope example --lane controlled --takeover-stale --stale-after 1 >/dev/null 2>&1
takeover_status=$?
set -e
test "$takeover_status" -eq 75

CODEX_THREAD_ID=window-a "$guard" complete --key "$key_a" --result success >/dev/null
completed="$(CODEX_THREAD_ID=window-b "$guard" claim --key "$key_a" --repo fermatmind/fap-api --scope example --lane controlled)"
grep -q '^status=completed$' <<<"$completed"

ordinary_key="$(CODEX_THREAD_ID=window-a "$guard" key --repository fermatmind/fap-web --workflow local --scope pr --identity stale)"
CODEX_THREAD_ID=window-a "$guard" claim --key "$ordinary_key" --repo fermatmind/fap-web --scope pr --lane ordinary >/dev/null
awk 'BEGIN{FS=OFS="="} $1=="heartbeat_epoch"{$2=1} {print}' "$FERMATMIND_OPERATION_ROOT/$ordinary_key/metadata" > "$FERMATMIND_OPERATION_ROOT/$ordinary_key/metadata.next"
mv "$FERMATMIND_OPERATION_ROOT/$ordinary_key/metadata.next" "$FERMATMIND_OPERATION_ROOT/$ordinary_key/metadata"
takeover="$(CODEX_THREAD_ID=window-b "$guard" claim --key "$ordinary_key" --repo fermatmind/fap-web --scope pr --lane ordinary --takeover-stale --stale-after 1)"
grep -q '^takeover=stale$' <<<"$takeover"

unsafe_root="$test_root/unsafe"
ln -s "$test_root" "$unsafe_root"
set +e
FERMATMIND_OPERATION_ROOT="$unsafe_root" CODEX_THREAD_ID=window-a "$guard" status >/dev/null 2>&1
unsafe_status=$?
set -e
test "$unsafe_status" -eq 73

printf 'operation guard tests passed\n'
