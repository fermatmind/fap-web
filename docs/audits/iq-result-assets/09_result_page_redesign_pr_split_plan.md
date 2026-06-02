# IQ Result Page Redesign PR Split Plan

Generated: 2026-06-02T17:05:07Z

| PR | Goal | Scope | Dependencies | Tests | Backend required | Deployment required |
| --- | --- | --- | --- | --- | --- | --- |
| IQ-RESULT-DOC-1 | Current-state closeout and design source-of-truth docs | Make the asset scan the canonical design source and reconcile stale IQ result audit docs. | IQ-RESULT-ASSET-SCAN-1 merged | jq empty generated JSON, git diff --check | False | False |
| IQ-RESULT-CONTENT-1 | Backend report payload content fields for enhanced IQ result sections | Add backend-owned reviewed fields for score explanation, dimension copy, band tables, norm/claim metadata, and preview sections. | backend norm/claim policy decision, IQ-RESULT-ASSET-SCAN-1 | backend report builder unit/feature tests, frontend contract fixture update | True | True |
| IQ-RESULT-UI-1 | Frontend hero score + reliability section | Use backend payload fields to render web-native score hero, CI, percentile, quality, and stability explanation. | IQ-RESULT-CONTENT-1 or confirmed existing backend fields | focused IQ result renderer contract, typecheck, diff check | False | True |
| IQ-RESULT-UI-2 | Frontend dimension deep-dive sections | Render VSI/VSPR/NPR deep dives with backend-owned copy, band fields, and accessible visualizations. | IQ-RESULT-CONTENT-1, IQ-RESULT-UI-1 | focused report module contract, result renderer contract, typecheck | False | True |
| IQ-RESULT-UI-3 | Report preview teaser + deferred-commerce-safe paid report preview | Render backend preview sections without checkout until entitlement/commerce exists. | backend preview payload fields, commerce still deferred unless explicitly authorized | report module contract no payment CTA, result client branch tests | False | True |
| IQ-RESULT-UI-4 | Mobile/result-page polish and screenshot QA | Responsive layout, accessibility, visual regression, and browser screenshot QA after UI sections exist. | IQ-RESULT-UI-1, IQ-RESULT-UI-2 | Playwright visual/mobile, a11y smoke, typecheck | False | True |
| IQ-RESULT-COMMERCE-1 | Commerce unlock integration after backend commerce unlock exists | Render checkout/unlock only from backend-owned entitlement/actions after explicit authorization. | backend commerce unlock and entitlement grants live, policy approval | commerce contract tests, no unauthorized checkout leakage, sandbox E2E if authorized | True | True |

## Detailed PR plans

### IQ-RESULT-DOC-1

- Goal: Current-state closeout and design source-of-truth docs
- Scope: Make the asset scan the canonical design source and reconcile stale IQ result audit docs.
- Likely files: `docs/audits/iq-result-assets/**`, `docs/audits/iq-fe/05_result_report_renderer_audit.md`
- Dependencies: IQ-RESULT-ASSET-SCAN-1 merged
- Tests: jq empty generated JSON, git diff --check
- Acceptance commands: `jq empty docs/audits/iq-result-assets/*.json`, `git diff --check`
- Forbidden changes: app/**, components/**, lib/**, tests/**, backend/**, payment/checkout/order/webhook files
- Sidecar risks: stale docs drift
- Backend required: False
- Deployment required: False

### IQ-RESULT-CONTENT-1

- Goal: Backend report payload content fields for enhanced IQ result sections
- Scope: Add backend-owned reviewed fields for score explanation, dimension copy, band tables, norm/claim metadata, and preview sections.
- Likely files: `fap-api backend report builder/services/tests/docs as separately authorized`
- Dependencies: backend norm/claim policy decision, IQ-RESULT-ASSET-SCAN-1
- Tests: backend report builder unit/feature tests, frontend contract fixture update
- Acceptance commands: `backend focused report builder tests`, `backend IQ report contract tests`, `frontend focused IQ API contract if fixture changes`
- Forbidden changes: frontend inference of score/claims, payment/checkout, content package scoring changes without authority
- Sidecar risks: norm authority incomplete, claim policy incomplete
- Backend required: True
- Deployment required: True

### IQ-RESULT-UI-1

- Goal: Frontend hero score + reliability section
- Scope: Use backend payload fields to render web-native score hero, CI, percentile, quality, and stability explanation.
- Likely files: `components/result/iq/**`, `lib/iq/result.ts`, `tests/contracts/iq-result-renderer.contract.test.tsx`
- Dependencies: IQ-RESULT-CONTENT-1 or confirmed existing backend fields
- Tests: focused IQ result renderer contract, typecheck, diff check
- Acceptance commands: `pnpm exec vitest run tests/contracts/iq-result-renderer.contract.test.tsx`, `pnpm typecheck`, `git diff --check`
- Forbidden changes: backend, payment, checkout, content_packages, frontend-invented claims
- Sidecar risks: claim-safety if backend fields absent
- Backend required: False
- Deployment required: True

### IQ-RESULT-UI-2

- Goal: Frontend dimension deep-dive sections
- Scope: Render VSI/VSPR/NPR deep dives with backend-owned copy, band fields, and accessible visualizations.
- Likely files: `components/result/iq/**`, `lib/iq/result.ts`, `tests/contracts/iq-report-module.contract.test.tsx`
- Dependencies: IQ-RESULT-CONTENT-1, IQ-RESULT-UI-1
- Tests: focused report module contract, result renderer contract, typecheck
- Acceptance commands: `pnpm exec vitest run tests/contracts/iq-report-module.contract.test.tsx tests/contracts/iq-result-renderer.contract.test.tsx`, `pnpm typecheck`, `git diff --check`
- Forbidden changes: frontend editorial fallback content, payment, backend scoring
- Sidecar risks: missing backend dimension copy
- Backend required: False
- Deployment required: True

### IQ-RESULT-UI-3

- Goal: Report preview teaser + deferred-commerce-safe paid report preview
- Scope: Render backend preview sections without checkout until entitlement/commerce exists.
- Likely files: `components/result/iq/IqReportModule.tsx`, `lib/iq/result.ts`, `tests/contracts/iq-report-module.contract.test.tsx`
- Dependencies: backend preview payload fields, commerce still deferred unless explicitly authorized
- Tests: report module contract no payment CTA, result client branch tests
- Acceptance commands: `pnpm exec vitest run tests/contracts/iq-report-module.contract.test.tsx tests/contracts/result-client-view-state.contract.test.tsx`, `pnpm typecheck`, `git diff --check`
- Forbidden changes: checkout/order/webhook/payment provider calls, frontend invented SKU/price
- Sidecar risks: commerce unlock deferred
- Backend required: False
- Deployment required: True

### IQ-RESULT-UI-4

- Goal: Mobile/result-page polish and screenshot QA
- Scope: Responsive layout, accessibility, visual regression, and browser screenshot QA after UI sections exist.
- Likely files: `components/result/iq/**`, `tests/e2e/visual/**`, `docs/audits/iq-result-assets/**`
- Dependencies: IQ-RESULT-UI-1, IQ-RESULT-UI-2
- Tests: Playwright visual/mobile, a11y smoke, typecheck
- Acceptance commands: `pnpm exec playwright test tests/e2e/visual/iq-result.visual.spec.ts`, `pnpm typecheck`, `git diff --check`
- Forbidden changes: backend/payment/scoring
- Sidecar risks: runtime browser not available
- Backend required: False
- Deployment required: True

### IQ-RESULT-COMMERCE-1

- Goal: Commerce unlock integration after backend commerce unlock exists
- Scope: Render checkout/unlock only from backend-owned entitlement/actions after explicit authorization.
- Likely files: `components/result/iq/IqReportModule.tsx`, `lib/access/**`, `tests/contracts/**`
- Dependencies: backend commerce unlock and entitlement grants live, policy approval
- Tests: commerce contract tests, no unauthorized checkout leakage, sandbox E2E if authorized
- Acceptance commands: `focused commerce/report contracts`, `pnpm typecheck`, `git diff --check`
- Forbidden changes: frontend-invented SKU/price/checkout, production payment without authorization
- Sidecar risks: payment provider risk
- Backend required: True
- Deployment required: True
