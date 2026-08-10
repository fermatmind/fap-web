#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
guard="${script_dir}/fermatmind-heavy-guard"
status_tool="${script_dir}/fermatmind-task-status"
test_root="$(mktemp -d "${TMPDIR:-/tmp}/fermatmind-heavy-guard-test.XXXXXX")"
lock_dir="${test_root}/heavy-validation.lock"

cleanup() {
  rm -f \
    "${lock_dir}/pid" \
    "${lock_dir}/token" \
    "${lock_dir}/metadata" \
    "${test_root}/first.out" \
    "${test_root}/second.out" \
    "${test_root}/stale.out" \
    "${test_root}/status.out"
  rmdir "$lock_dir" 2>/dev/null || true
  rmdir "$test_root" 2>/dev/null || true
}
trap cleanup EXIT

export FERMATMIND_HEAVY_LOCK_ROOT="$test_root"
export FERMATMIND_HEAVY_LOCK_DIR="$lock_dir"

"$guard" run --task first --repo "$script_dir" -- sleep 1 > "${test_root}/first.out" &
first_pid=$!

for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  [[ -f "${lock_dir}/metadata" ]] && break
  sleep 0.05
done
[[ -f "${lock_dir}/metadata" ]]

set +e
"$guard" run --task second --repo "$script_dir" -- true > "${test_root}/second.out" 2>&1
second_status=$?
set -e
[[ "$second_status" -eq 75 ]]
grep -q '^task=first$' "${lock_dir}/metadata"
wait "$first_pid"
[[ ! -d "$lock_dir" ]]

mkdir "$lock_dir"
printf '999999\n' > "${lock_dir}/pid"
printf 'stale-token\n' > "${lock_dir}/token"
printf 'task=stale\n' > "${lock_dir}/metadata"
"$guard" run --task reclaimed --repo "$script_dir" -- true > "${test_root}/stale.out"
grep -q '^lease=acquired$' "${test_root}/stale.out"
[[ ! -d "$lock_dir" ]]

set +e
"$guard" run --task failing-command --repo "$script_dir" -- bash -c 'exit 23' >/dev/null
failing_status=$?
set -e
[[ "$failing_status" -eq 23 ]]
[[ ! -d "$lock_dir" ]]

"$status_tool" --no-github > "${test_root}/status.out"
grep -q '^== Heavy validation lease ==$' "${test_root}/status.out"
printf 'PASS: FermatMind heavy validation guard\n'
