# MBTI Result Page Agent Scaffold Scan

Task: `MBTI-RESULT-PAGE-AGENT-SCAFFOLD-SCAN-01`

Status: docs/contracts scaffold proposal only.

Verdict: `MBTI_RESULT_PAGE_AGENT_SCAFFOLD_READY`

## Safety Boundary

- runtime code changed: no
- CMS writes: none
- publish: none
- search submissions: none
- provider calls: none
- private result data accessed: none
- payment/order mutation: none
- env changes: none

This scan used repository source files only. It did not read raw private attempts, live report payloads, production database rows, Search Channel Queue state, sitemap/robots/llms/schema/hreflang outputs, or provider consoles.

## Platform Inputs

- Standard: `docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md`
- Template: `docs/result-page-agents/six-scale-result-agent-readiness.template.json`
- Agent ID: `mbti_result_page`
- Scale code: `MBTI`
- Canonical test slug: `mbti-personality-test-16-personality-types`
- Current readiness state from the frozen template: `missing_agent_stack`

## Evidence Map

| Required map | Evidence | Scan result |
|---|---|---|
| Result route | `app/(localized)/[locale]/(app)/result/[id]/page.tsx` | Localized private result route is dynamic, `noindex`, and passes `attemptId` into `ResultClient`. |
| Report API | `lib/api/v0_3.ts`, `fap-api:backend/routes/api.php`, `fap-api:backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` | Frontend calls `/api/v0.3/attempts/{attempt_id}/report`; backend route maps to `AttemptReadController::report`. |
| Report-access API | `lib/api/v0_3.ts`, `fap-api:backend/routes/api.php`, `fap-api:backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` | Frontend calls `/api/v0.3/attempts/{attempt_id}/report-access`; backend route maps to `AttemptReadController::reportAccess`; MBTI result-ready reads may repair projection if needed. |
| PDF behavior | `lib/api/v0_3.ts`, `components/result/mbti/MbtiResultShell.tsx`, `fap-api:backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` | PDF href comes from report-access actions or MBTI access hub; backend serves `/report.pdf` with private no-store headers and report metadata headers. |
| Share behavior | `components/result/mbti/MbtiResultShell.tsx`, `lib/api/v0_3.ts`, `fap-api:backend/routes/api.php`, `fap-api:backend/app/Http/Controllers/API/V0_3/ShareController.php` | MBTI share CTA creates `/api/v0.3/attempts/{attempt_id}/share`; share reads use `/api/v0.3/shares/{share_id}` and remain public-summary scoped. |
| Frontend renderer | `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`, `components/result/RichResultReport.tsx`, `components/result/mbti/MbtiResultShell.tsx` | `ResultClient` fetches report/access, `RichResultReport` accepts MBTI only when `mbti_public_projection_v1` is present, then renders `MbtiResultShell`. |
| Backend authority | `fap-api:backend/app/Services/Report/ReportComposer.php`, `fap-api:backend/app/Services/Mbti/Adapters/MbtiReportAuthoritySourceAdapter.php`, `fap-api:backend/app/Services/Mbti/MbtiPublicProjectionService.php` | `ReportComposer` delegates report assembly; MBTI public projection merges runtime summary, report fallback authority, CMS authority, and personalization into public projection. |

## Existing Tests And Contracts

Shared fap-web result contracts:

- `tests/contracts/result-client-view-state.contract.test.tsx`
- `tests/contracts/result-access-token-api.contract.test.ts`
- `tests/contracts/report-action-url-safety.contract.test.ts`
- `tests/contracts/result-private-print-chrome.contract.test.ts`
- `tests/contracts/result-print-url-redaction.contract.test.ts`
- `tests/contracts/result-private-leak-regressions.contract.test.ts`
- `tests/contracts/rich-result-report.contract.test.tsx`

MBTI fap-web result/share contracts:

- `tests/contracts/mbti-share-consumer.contract.test.tsx`
- `tests/contracts/mbti-private-relationship.consumer.contract.test.tsx`
- `tests/contracts/mbti-preview-semantics.contract.test.tsx`
- `tests/contracts/mbti-shell-authored-fields.contract.test.tsx`
- `tests/contracts/mbti-shell-ui.contract.test.tsx`
- `tests/contracts/mbti-desktop-p0-render.contract.test.tsx`
- `tests/contracts/mbti-desktop-p1-render.contract.test.tsx`
- `tests/e2e/mbti-share.spec.ts`
- `tests/e2e/mbti-locked-unlock.spec.ts`

Backend authority/API tests observed in `fap-api`:

- `backend/tests/Feature/V0_3/MbtiReportHttpContractRegressionTest.php`
- `backend/tests/Feature/V0_3/MbtiAttemptShareAccessTest.php`
- `backend/tests/Feature/V0_3/AttemptReportAccessReadTest.php`
- `backend/tests/Feature/V0_3/AttemptPublicReportPdfParityTest.php`
- `backend/tests/Feature/Report/MbtiCanonicalPublicAuthorityScaffoldTest.php`
- `backend/tests/Feature/Report/MbtiReportContentEnhancementContractTest.php`
- `backend/tests/Unit/Services/Mbti/MbtiPublicProjectionServiceTest.php`
- `backend/tests/Unit/Support/Mbti/MbtiCanonicalPublicResultSchemaTest.php`

## Missing Runbook, Schema, And Gates

The runtime foundations exist, but the dedicated MBTI result-page agent stack is not yet present. The scaffold gap is docs/contracts and operational wiring, not a requirement to change runtime rendering now.

Missing or proposed:

- Dedicated MBTI result-page agent runbook for read-only route/API/PDF/share/render/leak evidence.
- JSON schema or validator for `fermatmind.result_page_agent_readiness.v1` readiness artifacts.
- MBTI-specific readiness artifact generator command that emits sanitized evidence only.
- Contract gate tying `mbti_result_page` to the frozen required fields and negative guarantees.
- Read-only source classification gate for live public, backend authority, fixture, mock, unknown, or access-required evidence.
- Explicit stop-condition handling for raw private result access, private indexing, public/private blend, unsupported claims, and default-denied mutation requests.

## Scaffold Plan

1. Keep MBTI result-page agent input scope to sanitized report contracts, renderer contracts, fixtures, and source-code evidence.
2. Generate only sanitized `result_page_agent_readiness` artifacts under `generated/result-page-agents/mbti/<run_id>/readiness.json` in a future authorized run.
3. Add a JSON schema validator or contract gate before any generated readiness artifact is accepted.
4. Keep runtime rendering, CMS, search, sitemap, schema, hreflang, queue, provider calls, private attempts, payment/order data, and env changes out of this agent.
5. Treat backend report payload, report-access response, `MbtiReportAuthoritySourceAdapter`, and `MbtiPublicProjectionService` as authority; fap-web renderer behavior is consumer evidence.

## Readiness Artifact Proposal

Sanitized proposal file:

- `docs/result-page-agents/mbti-result-page-agent-readiness.proposal.json`

The proposal intentionally does not contain raw attempt IDs, live report URLs, access tokens, account context, PDF URLs, private relationship payloads, payment/order rows, or production DB evidence.

## Future PR Train Proposal

If the next step is implementation rather than scan-only scaffold, add manifest/state entries only with explicit user authorization.

Proposed PR train id:

- `MBTI-RESULT-PAGE-AGENT-RUNBOOK-SCHEMA-GATES-01`

Proposed title:

- `Scaffold MBTI result-page agent runbook, schema validator, and readiness gate`

Likely files:

- `docs/result-page-agents/mbti-result-page-agent-runbook.md`
- `docs/result-page-agents/mbti-result-page-agent-readiness.schema.json`
- `scripts/result-page-agents/validate-result-page-agent-readiness.mjs`
- `tests/contracts/mbti-result-page-agent-readiness.contract.test.ts`

Required local checks:

- `pnpm test:contract -- tests/contracts/mbti-result-page-agent-readiness.contract.test.ts`
- `pnpm test:contract`
- `pnpm typecheck`
- `git diff --check`

Dependency assumptions:

- `RESULT_PAGE_AGENT_PLATFORM_STANDARD.md` remains frozen.
- `six-scale-result-agent-readiness.template.json` remains the required field source.
- Backend MBTI report authority remains in `fap-api`; this fap-web task remains a consumer/scaffold lane.

Manifest/state entries requiring authorization:

```yaml
- id: MBTI-RESULT-PAGE-AGENT-RUNBOOK-SCHEMA-GATES-01
  title: Scaffold MBTI result-page agent runbook, schema validator, and readiness gate
  scope:
    - docs/result-page-agents/mbti-result-page-agent-runbook.md
    - docs/result-page-agents/mbti-result-page-agent-readiness.schema.json
    - scripts/result-page-agents/validate-result-page-agent-readiness.mjs
    - tests/contracts/mbti-result-page-agent-readiness.contract.test.ts
  depends_on:
    - RESULT_PAGE_AGENT_PLATFORM_STANDARD_01
  local_checks:
    - pnpm test:contract -- tests/contracts/mbti-result-page-agent-readiness.contract.test.ts
    - pnpm test:contract
    - pnpm typecheck
    - git diff --check
```

Follow-up execution prompt:

```text
Authorize adding docs/codex pr-train manifest/state entries for MBTI-RESULT-PAGE-AGENT-RUNBOOK-SCHEMA-GATES-01, then implement only the MBTI result-page agent runbook/schema/gate scaffold from latest main. Do not implement runtime code, CMS writes, publish, search submissions, provider calls, private result access, payment/order mutation, env changes, or sitemap/robots/llms/schema/hreflang mutation.
```
