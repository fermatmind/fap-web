# IQ Raven Result Page Agent Scaffold Scan

Task: `IQ-RAVEN-RESULT-PAGE-AGENT-SCAFFOLD-SCAN-01`

Status: docs/contracts scaffold proposal only.

Verdict: `IQ_RAVEN_RESULT_PAGE_AGENT_SCAFFOLD_READY`

## Safety Boundary

- runtime code changed: no
- CMS writes: none
- publish: none
- search submissions: none
- provider calls: none
- private result data accessed: none
- payment/order mutation: none
- env changes: none

This scan used repository source files and existing docs/contracts only. It did not read raw private attempts, live report payloads, production database rows, Search Channel Queue state, sitemap/robots/llms/schema/hreflang outputs, provider consoles, answer keys, or correct-answer payloads.

## Platform Inputs

- Standard: `docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md`
- Template: `docs/result-page-agents/six-scale-result-agent-readiness.template.json`
- Agent ID: `iq_raven_result_page`
- Scale code: `IQ_RAVEN`
- Canonical backend scale code: `IQ_INTELLIGENCE_QUOTIENT`
- Legacy/input alias: `IQ_RAVEN`
- Canonical test slug: `iq-test-intelligence-quotient-assessment`
- Current readiness state from the frozen template: `missing_agent_stack`

IQ naming rule: the agent target remains `iq_raven_result_page` for continuity, but backend report authority treats `IQ_INTELLIGENCE_QUOTIENT` as canonical. `IQ_RAVEN` is a legacy/input alias and must not become user-facing IQ copy.

## Evidence Map

| Required map | Evidence | Scan result |
|---|---|---|
| Result route | `app/(localized)/[locale]/(app)/result/[id]/page.tsx` | Localized private result route is dynamic, `noindex`, and passes `attemptId` into `ResultClient`. |
| Report API | `lib/api/v0_3.ts`, `fap-api:backend/routes/api.php`, `fap-api:backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` | Frontend calls `/api/v0.3/attempts/{attempt_id}/report`; backend route maps to `AttemptReadController::report`. |
| Report-access API | `lib/api/v0_3.ts`, `fap-api:backend/routes/api.php`, `fap-api:backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` | Frontend calls `/api/v0.3/attempts/{attempt_id}/report-access`; backend route maps to `AttemptReadController::reportAccess`. |
| PDF behavior | `lib/api/v0_3.ts`, `components/result/iq/IqReportModule.tsx`, `fap-api:backend/app/Services/Report/IqReportBuilder.php`, `fap-api:backend/app/Http/Controllers/API/V0_3/AttemptReadController.php` | Shared API exposes `/report.pdf`. IQ report payload may include `iq_pro.pdf_payload`, but current frontend renders a placeholder; backend builder marks PDF payload as contract-defined, not formal file generation. |
| Share behavior | `lib/api/v0_3.ts`, `components/result/RichResultReport.tsx`, `fap-api:backend/routes/api.php`, `fap-api:backend/app/Http/Controllers/API/V0_3/ShareController.php` | Shared share helper creates `/api/v0.3/attempts/{attempt_id}/share`; share reads use `/api/v0.3/shares/{share_id}` and must stay public-summary scoped. A dedicated IQ share gate is still missing. |
| Frontend renderer | `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`, `components/result/iq/IqResultShell.tsx`, `components/result/iq/IqReportModule.tsx`, `lib/iq/result.ts`, `lib/iq/constants.ts` | `ResultClient` fetches report-access and report, resolves `IQ_RAVEN` or `IQ_INTELLIGENCE_QUOTIENT`, and dispatches to `IqResultShell` before generic `RichResultReport`. `IqReportModule` renders method boundary, entitlement state, dimensions, and PDF/certificate placeholders. |
| Backend authority | `fap-api:backend/app/Services/Report/IqReportBuilder.php`, `fap-api:backend/app/Services/Iq/IqNormAuthorityContract.php`, `fap-api:backend/app/Services/Iq/IqResultPayloadRedactor.php`, `fap-api:backend/docs/iq/*` | `IqReportBuilder` emits canonical `IQ_INTELLIGENCE_QUOTIENT`, legacy alias metadata, IQ summary/dimensions/quality/stability, and contract-defined PDF/certificate payloads. `IqNormAuthorityContract` gates IQ estimate, percentile, and confidence interval claims. `IqResultPayloadRedactor` removes answer-key and correct-answer fields. |

## Existing Tests And Contracts

Shared fap-web result contracts:

- `tests/contracts/result-client-view-state.contract.test.tsx`
- `tests/contracts/result-access-token-api.contract.test.ts`
- `tests/contracts/report-action-url-safety.contract.test.ts`
- `tests/contracts/result-private-print-chrome.contract.test.ts`
- `tests/contracts/result-print-url-redaction.contract.test.ts`
- `tests/contracts/result-private-leak-regressions.contract.test.ts`
- `tests/contracts/rich-result-report.contract.test.tsx`

IQ fap-web result/API/claim contracts:

- `tests/contracts/iq-result-renderer.contract.test.tsx`
- `tests/contracts/iq-report-module.contract.test.tsx`
- `tests/contracts/iq-frontend-api-contracts.contract.test.ts`
- `tests/contracts/iq-question-renderer.contract.test.tsx`
- `tests/contracts/iq-bank-display-model.contract.test.ts`
- `tests/contracts/iq-claim-seo-launch-guard.contract.test.ts`
- `tests/contracts/iq-launch-readiness-smoke.contract.test.ts`
- `tests/e2e/iq-eq-result-regression.spec.ts`

Backend authority/API tests observed in `fap-api`:

- `backend/tests/Feature/V0_3/IqReportContractTest.php`
- `backend/tests/Feature/Content/IqNormAuthorityTest.php`
- `backend/tests/Unit/Services/Report/IqReportBuilderTest.php`
- `backend/tests/Feature/Content/IqBeta30OriginalBankSpecTest.php`
- `backend/tests/Feature/Content/IqBeta50BankSpecTest.php`
- `backend/tests/Feature/Content/IqBeta30OriginalBankImportTest.php`
- `backend/tests/Unit/Assessment/IqTestDriverTest.php`

## IQ-Specific Safety Gates

- `no_answer_key_leak`: public/result/report/share artifacts must not contain `answer_key`, `answerKey`, `solution_rule`, `solutionRule`, `asset_hashes`, `assetHashes`, `generator_metadata`, or equivalent internal fields.
- `no_correct_answer_leak`: public/result/report/share artifacts must not contain `correct_answer` or `correctAnswer`.
- `no_diagnostic_claim`: IQ result copy must stay an online estimate or reasoning-result explanation, not clinical, educational-placement, or diagnostic authority.
- `no_admissions_guarantee`: result-page agent outputs must not imply admission, hiring, school placement, certification, or selection outcomes.
- `no_career_outcome_prediction`: IQ result output must not become deterministic career recommendation or outcome prediction.
- `pdf_certificate_boundary`: IQ PDF/certificate remains backend-authoritative. Current frontend placeholder may acknowledge contract-defined payloads, but must not enable downloads or certification claims without explicit backend authority and approval.

## Missing Runbook, Schema, And Gates

The runtime foundations exist, but the dedicated IQ Raven result-page agent stack is not yet present. The scaffold gap is docs/contracts and operational wiring, not a requirement to change runtime rendering now.

Missing or proposed:

- Dedicated IQ Raven result-page agent runbook for read-only route/API/PDF/share/render/leak/claim evidence.
- JSON schema or validator for `fermatmind.result_page_agent_readiness.v1` readiness artifacts.
- IQ-specific readiness artifact generator command that emits sanitized evidence only.
- Contract gate tying `iq_raven_result_page` to the frozen required fields, canonical scale-code mapping, and negative guarantees.
- Source classification gate for live public, backend authority, fixture, mock, unknown, or access-required evidence.
- Claim/privacy/safety gate for answer-key redaction, correct-answer redaction, non-diagnostic claim copy, no admissions/career guarantee, and PDF/certificate boundary.
- Dedicated IQ share-surface boundary gate proving shared URLs cannot expose private attempts, raw report payloads, answer keys, or correct answers.

## Scaffold Plan

1. Keep IQ Raven result-page agent input scope to sanitized report contracts, renderer contracts, norm-authority docs, redaction policy evidence, fixtures, and source-code evidence.
2. Generate only sanitized `result_page_agent_readiness` artifacts under `generated/result-page-agents/iq_raven/<run_id>/readiness.json` in a future authorized run.
3. Add a JSON schema validator or contract gate before any generated readiness artifact is accepted.
4. Treat `IqReportBuilder`, `IqNormAuthorityContract`, `IqResultPayloadRedactor`, report-access response, and fap-web IQ renderer contracts as authority/evidence.
5. Keep runtime rendering, CMS, search, sitemap, schema, hreflang, queue, provider calls, private attempts, payment/order data, env changes, answer keys, and correct answers out of this agent.
6. Require IQ-specific safety gates before any future runbook can mark readiness beyond scaffold-ready.

## Readiness Artifact Proposal

Sanitized proposal file:

- `docs/result-page-agents/iq-raven-result-page-agent-readiness.proposal.json`

The proposal intentionally does not contain raw attempt IDs, live report URLs, access tokens, account context, PDF URLs, answer keys, correct answers, scoring rule payloads, private result data, payment/order rows, production DB evidence, or provider evidence.

## Future PR Train Proposal

If the next step is implementation rather than scan-only scaffold, add manifest/state entries only with explicit user authorization.

Proposed PR train id:

- `IQ-RAVEN-RESULT-PAGE-AGENT-RUNBOOK-SCHEMA-GATES-01`

Proposed title:

- `Scaffold IQ Raven result-page agent runbook, schema validator, and readiness gate`

Likely files:

- `docs/result-page-agents/iq-raven-result-page-agent-runbook.md`
- `docs/result-page-agents/iq-raven-result-page-agent-readiness.schema.json`
- `scripts/result-page-agents/validate-result-page-agent-readiness.mjs`
- `tests/contracts/iq-raven-result-page-agent-readiness.contract.test.ts`

Required local checks:

- `pnpm vitest run tests/contracts/iq-raven-result-page-agent-readiness.contract.test.ts`
- `pnpm test:contract`
- `pnpm typecheck`
- `git diff --check`

Dependency assumptions:

- `RESULT_PAGE_AGENT_PLATFORM_STANDARD.md` remains frozen.
- `six-scale-result-agent-readiness.template.json` remains the required field source.
- Backend IQ report authority remains in `fap-api`; this fap-web task remains a consumer/scaffold lane.
- `IQ_INTELLIGENCE_QUOTIENT` remains the canonical backend scale code; `IQ_RAVEN` remains a legacy/input alias.

Manifest/state entries requiring authorization:

```yaml
- id: IQ-RAVEN-RESULT-PAGE-AGENT-RUNBOOK-SCHEMA-GATES-01
  title: Scaffold IQ Raven result-page agent runbook, schema validator, and readiness gate
  scope:
    - docs/result-page-agents/iq-raven-result-page-agent-runbook.md
    - docs/result-page-agents/iq-raven-result-page-agent-readiness.schema.json
    - scripts/result-page-agents/validate-result-page-agent-readiness.mjs
    - tests/contracts/iq-raven-result-page-agent-readiness.contract.test.ts
  depends_on:
    - RESULT_PAGE_AGENT_PLATFORM_STANDARD_01
    - IQ-RAVEN-RESULT-PAGE-AGENT-SCAFFOLD-SCAN-01
  local_checks:
    - pnpm vitest run tests/contracts/iq-raven-result-page-agent-readiness.contract.test.ts
    - pnpm test:contract
    - pnpm typecheck
    - git diff --check
```

Follow-up execution prompt:

```text
Authorize adding docs/codex pr-train manifest/state entries for IQ-RAVEN-RESULT-PAGE-AGENT-RUNBOOK-SCHEMA-GATES-01, then implement only the IQ Raven result-page agent runbook/schema/gate scaffold from latest main. Do not implement runtime code, CMS writes, publish, search submissions, provider calls, private result access, answer key/correct answer access, payment/order mutation, env changes, or sitemap/robots/llms/schema/hreflang mutation.
```
