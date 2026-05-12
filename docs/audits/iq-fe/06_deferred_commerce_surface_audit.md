# IQ Deferred Commerce Surface Audit

Commerce is intentionally deferred in this scan. No payment implementation is proposed here.

## Existing Commerce / Locked UI Surface

| Surface | Exists | Files | IQ usage now | Risk |
| --- | --- | --- | --- | --- |
| Unlock CTA card | yes | `components/commerce/UnlockCTA.tsx` | no dedicated IQ usage found | high if shared shell accidentally renders SKU/price |
| Locked teaser preview | yes | `components/report/LockedInsightTeaser.tsx` | reusable | low |
| Shared access normalization | yes | `lib/access/unifiedAccess.ts` | reusable | medium |
| Clinical payment/report unlock flow | yes | `components/clinical/report/ClinicalReportClient.tsx`, order/payment routes | not reusable now | high if copied into IQ |
| Order lookup / payment wait | yes | `app/(localized)/[locale]/orders/*`, `/pay/*` | out of IQ scope | high if linked prematurely |

## Deferred-Commerce Safe Recommendation

| Concern | Recommendation |
| --- | --- |
| Existing shared result/report shell may show payment CTA | suppress `UnlockCTA` and SKU-dependent blocks for IQ until backend commerce PR exists |
| Locked IQ report experience | show non-transactional locked/deferred copy with `LockedInsightTeaser`-style preview only |
| Unlock stage handling | treat `unlockStage=locked` as informational lock, not checkout call-to-action |
| Price display | do not show `¥1.99` / `¥5` anywhere in IQ frontend before backend commerce PR lands |
| CTA copy | use safe copy such as “报告解锁暂未开放 / Report unlock is not available yet” |

## Current Risks

| Risk | Evidence | Severity |
| --- | --- | --- |
| Shared unlock UI shows SKU/order/price fields | `UnlockCTA.tsx` prints SKU, Order, Attempt, and price | high |
| Shared result/report renderer already handles paid/free variants for other scales | `RichResultReport.tsx`, `ResultClient.tsx`, many MBTI/clinical tests | medium |
| Existing test fixtures assume commerce enabled in scale lookup | IQ e2e mocks set `commerce_enabled: true` | medium |

## Recommended Deferred-Commerce Copy

| Locale | Copy |
| --- | --- |
| zh | `IQ 报告解锁暂未开放，当前仅提供测评流程与基础结果承载能力。` |
| en | `IQ report unlock is not available yet. The current frontend should only expose the assessment flow and basic result shell.` |

## Future Frontend Commerce Sidecar

Future frontend commerce work should be its own PR after backend `iq-commerce-unlock-199-500` is complete. Until then:

- no checkout button
- no SKU labels
- no order lookup dependency for IQ
- no payment wait routing from IQ result/report screens

