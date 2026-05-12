# IQ-FE-5 Report Module Notes

## Scope
- Added an IQ-only report module shell under the existing IQ result surface.
- Kept the generic localized result route unchanged.
- Did not add any payment, checkout, order, webhook, PDF download, or certificate download behavior.

## Files Changed
- `components/result/iq/IqReportModule.tsx`
- `components/result/iq/IqResultShell.tsx`
- `lib/iq/result.ts`
- `tests/contracts/iq-report-module.contract.test.tsx`
- `tests/contracts/iq-result-renderer.contract.test.tsx`

## Behavior
- `ResultClient` already fetched `report-access` and `report`, so IQ-FE-5 stayed inside the IQ renderer layer.
- `IqResultShell` still renders the IQ summary and the three dimension cards from IQ-FE-4.
- `IqReportModule` now renders:
  - deferred-commerce locked copy
  - method-boundary copy
  - interpretation boundary copy
  - backend narrative sections when present
  - dimension detail blocks for `VSI`, `VSPR`, and `NPR`
  - PDF / certificate placeholders only when payloads exist

## Report-Access Handling
- `locked` stays conservative and renders neutral deferred-commerce copy.
- Generic frontend access states still normalize to `locked / partial / full`; IQ helpers map those to:
  - `locked`
  - `unlocked_adaptive`
  - `unlocked_pro`
- No SKU, offer, price, or checkout UI is rendered even if the backend returns commerce fields.

## Deferred Commerce
- Rendered copy:
  - zh: `完整报告解锁功能暂未开放。当前可查看已生成的基础结果。`
  - en: `Full report unlock is not available yet. You can view the available result summary.`
- Forbidden commerce strings such as `¥1.99`, `¥5`, `checkout`, and unlock CTA labels remain absent.

## PDF / Certificate
- Placeholder-only behavior:
  - shows a neutral unavailable message if `pdf_payload` exists
  - shows a neutral unavailable message if `certificate_payload` exists
- No download link or certificate claim flow is implemented.

## Tests Added
- `tests/contracts/iq-report-module.contract.test.tsx`
- extended `tests/contracts/iq-result-renderer.contract.test.tsx`

## Next
- `IQ-FE-6` should focus on mobile/responsive polish plus loading/error-state refinement.
- `IQ-FE-7` remains deferred until backend commerce unlock exists.
