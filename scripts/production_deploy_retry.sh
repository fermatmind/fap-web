#!/usr/bin/env bash

# Retry only failures that OpenSSH identifies as transport failures. Remote
# command failures must propagate immediately so business work is never replayed.
retry_ssh_transport() {
  local label="$1"
  shift

  local max_attempts="${SSH_RETRY_ATTEMPTS:-3}"
  local delay_seconds="${SSH_RETRY_DELAY_SECONDS:-5}"
  local attempt rc

  case "$max_attempts" in
    ''|*[!0-9]*|0)
      echo "invalid SSH_RETRY_ATTEMPTS" >&2
      return 2
      ;;
  esac

  for ((attempt = 1; attempt <= max_attempts; attempt += 1)); do
    if "$@"; then
      return 0
    else
      rc=$?
    fi

    if [ "$rc" -ne 255 ]; then
      echo "SSH ${label} non-transport failure (exit ${rc}); refusing to replay" >&2
      return "$rc"
    fi

    if [ "$attempt" -eq "$max_attempts" ]; then
      echo "SSH ${label} transport failure persisted after ${max_attempts} attempts" >&2
      return 255
    fi

    echo "SSH transport failure during ${label} attempt ${attempt}; reconnecting in ${delay_seconds}s" >&2
    sleep "$delay_seconds"
  done
}

# Revision readiness is read-only and deliberately independent from the
# single-shot business deploy invocation.
poll_deployed_revision() {
  local url="$1"
  local expected_revision="$2"
  local max_attempts="${REVISION_POLL_ATTEMPTS:-12}"
  local delay_seconds="${REVISION_POLL_DELAY_SECONDS:-5}"
  local attempt payload

  case "$max_attempts" in
    ''|*[!0-9]*|0)
      echo "invalid REVISION_POLL_ATTEMPTS" >&2
      return 2
      ;;
  esac

  if [[ ! "$expected_revision" =~ ^[0-9a-f]{40}$ ]]; then
    echo "invalid expected revision" >&2
    return 2
  fi

  for ((attempt = 1; attempt <= max_attempts; attempt += 1)); do
    payload=""
    if payload="$(curl --fail --silent --show-error "$url")" \
      && REVISION_PAYLOAD="$payload" EXPECTED_REVISION="$expected_revision" node <<'NODE'
const payload = JSON.parse(process.env.REVISION_PAYLOAD || "null");
const expected = process.env.EXPECTED_REVISION;
if (
  !payload ||
  typeof payload !== "object" ||
  Array.isArray(payload) ||
  Object.keys(payload).join(",") !== "revision" ||
  payload.revision !== expected
) {
  process.exit(1);
}
NODE
    then
      echo "deployed revision endpoint passed"
      return 0
    fi

    if [ "$attempt" -lt "$max_attempts" ]; then
      echo "deployed revision not ready (attempt ${attempt}/${max_attempts}); polling again in ${delay_seconds}s" >&2
      sleep "$delay_seconds"
    fi
  done

  echo "deployed revision endpoint did not report the expected SHA" >&2
  return 1
}
