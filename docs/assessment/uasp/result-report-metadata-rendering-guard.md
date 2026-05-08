# Result / Report UASP Metadata Rendering Guard v1

Scope: PR-UASP2B-02

Train: uasp-runtime-metadata-integration-train

Runtime behavior changed: no

## Purpose

This guard defines when result/report surfaces may recognize or render UASP metadata. It is guard-only and contract-only for this PR because no runtime payload currently carries `uasp_signal_v1`.

Result/report surfaces must not synthesize UASP metadata from frontend artifacts. They may add non-visible `data-uasp-*` attributes only after a real runtime payload or backend envelope exists.

## Current Runtime Finding

Current repo scan found no runtime `uasp_signal_v1` payload or `data-uasp-*` attributes under:

- `app/`
- `components/`
- `lib/`

Evidence command:

`rg -n "uasp_signal_v1|data-uasp|uaspSignal|uasp_signal" app components lib`

Result: no matches.

## Allowed Future Data Attributes

These attributes are allowed only when backed by an actual runtime envelope/payload:

- `data-uasp-signal-type`
- `data-uasp-result-shape`
- `data-uasp-claim-level`
- `data-uasp-envelope-state`

This PR does not add them because the runtime envelope is not present.

## Rendering Rules

- No visible signal badge text.
- No new translated copy.
- No new user-facing signal explanation.
- No report prose changes.
- No paywall copy changes.
- No shell routing changes.
- No report entitlement changes.
- No scoring changes.
- No profile write.
- No recommendation trigger.
- No UASP metadata inferred from frontend artifacts as authority.

## Page Family Guard Status

| Page family | Current guard status | Reason |
|---|---|---|
| MBTI result/report | `deferred_until_runtime_envelope` | Shell exists, but no `uasp_signal_v1` payload. |
| Big Five result/report | `deferred_until_runtime_envelope` | Shell exists, but no `uasp_signal_v1` payload. |
| RIASEC result/report | `deferred_until_runtime_envelope` | Shell exists, but no `uasp_signal_v1` payload. |
| Enneagram result/report | `deferred_until_runtime_envelope` | Shell exists, but no `uasp_signal_v1` payload. |

## Evidence

- Envelope contract: `docs/assessment/uasp/generated/uasp-runtime-metadata-envelope.v1.json`
- Runtime readiness report: `docs/assessment/uasp/uasp-runtime-integration-readiness-report.md`
- Result client: `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`
- Rich report shell: `components/result/RichResultReport.tsx`
- Scale shells: `components/result/mbti/MbtiResultShell.tsx`, `components/result/big5/Big5ResultShell.tsx`, `components/result/riasec/RiasecResultShell.tsx`, `components/result/enneagram/EnneagramResultShell.tsx`

## No Runtime Change Statement

This PR adds a result/report UASP metadata rendering guard artifact and contract test only. It does not change result/report components, visible copy, shell routing, scoring, report content, report entitlement, PDF, profile runtime, recommendation runtime, or runtime payloads.
