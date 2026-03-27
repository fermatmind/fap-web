#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

echo "[release-freeze] contract freeze set"
pnpm exec vitest run \
  tests/contracts/unified-access.contract.test.ts \
  tests/contracts/result-client-view-state.contract.test.tsx \
  tests/contracts/mbti-history-account-center.contract.test.tsx \
  tests/contracts/mbti-post-purchase-retention.contract.test.tsx \
  tests/contracts/big5.contract.test.ts \
  tests/contracts/big5-secondary-surfaces.contract.test.tsx

echo
echo "[release-freeze] smoke / e2e freeze set"
pnpm exec playwright test \
  tests/e2e/result-loading.spec.ts \
  tests/e2e/mbti-access-first-result.spec.ts \
  tests/e2e/mbti-locked-unlock.spec.ts \
  tests/e2e/mbti-post-purchase.spec.ts \
  tests/e2e/mbti-share.spec.ts \
  tests/e2e/big5-flow.spec.ts \
  tests/e2e/big5-history-result-center.spec.ts \
  tests/e2e/share-public-surfaces.spec.ts
