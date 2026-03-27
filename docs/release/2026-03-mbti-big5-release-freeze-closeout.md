# 2026-03 MBTI + Big5 Release Freeze Closeout

## Scope

This closeout freezes the current MBTI and Big Five release surface as-is. It does not add product scope. It defines the release evidence chain, freeze contracts, and smoke set that now act as the active launch authority.

## Current Truth

- MBTI runs on the current access-first read path:
  - `/api/v0.3/attempts/{id}/result`
  - `/api/v0.3/attempts/{id}/report`
  - `/api/v0.3/attempts/{id}/report-access`
- Big Five runs on the current access-first formal result path plus result-center secondary surfaces:
  - formal result via `ResultClient` + `Big5ResultShell`
  - history result-center rows via `/api/v0.3/me/attempts`
  - compare via `/history/big5/compare`
  - public share via `/share/{id}`

## Frontend Freeze Set

### Contract freeze

- `tests/contracts/unified-access.contract.test.ts`
- `tests/contracts/result-client-view-state.contract.test.tsx`
- `tests/contracts/mbti-history-account-center.contract.test.tsx`
- `tests/contracts/mbti-post-purchase-retention.contract.test.tsx`
- `tests/contracts/big5.contract.test.ts`
- `tests/contracts/big5-secondary-surfaces.contract.test.tsx`

### Smoke / E2E freeze

- `tests/e2e/result-loading.spec.ts`
- `tests/e2e/mbti-access-first-result.spec.ts`
- `tests/e2e/mbti-locked-unlock.spec.ts`
- `tests/e2e/mbti-post-purchase.spec.ts`
- `tests/e2e/mbti-share.spec.ts`
- `tests/e2e/big5-flow.spec.ts`
- `tests/e2e/big5-history-result-center.spec.ts`
- `tests/e2e/share-public-surfaces.spec.ts`

## Verify Entry

Run:

```bash
bash scripts/release_freeze_verify.sh
```

This command is the frontend release-freeze evidence chain. It keeps access-first runtime assumptions explicit and verifies that Big Five history remains a result-center surface without extra `/report` or `/report-access` requests.

## Non-goals

- no scorer changes
- no compare redesign
- no share/paywall redesign
- no CMS or analytics expansion
- no marketing or visual refresh work

## Historical Documents

The following can remain in the repo but are historical snapshots, not current release authority:

- `docs/CMS_FRONTEND_AUDIT_REPORT.md`
