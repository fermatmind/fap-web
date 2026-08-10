# Executive decision

Closeout revalidated at: 2026-08-10T08:11:00Z (Asia/Shanghai)

## Status

- **FERMATMIND_NONCAREER_TECHNICAL_GROWTH_AUDIT_PARTIALLY_BLOCKED**
- **TECHNICAL_PERFORMANCE_PR_CANDIDATES_READY_NOT_STARTED**
- **NONCAREER_SHRINK_GUARD_READY_WAITING_ON_C06**
- **FIELD_CWV_RUM_INSTRUMENTATION_COMPLETE_DEFAULT_OFF_NOOP**
- **FIELD_CWV_RUM_BASELINE_INSUFFICIENT_DATA**

T04 exact non-Career discoverability and T06 Big Five alias evidence remain complete. The six historical lab tool failures remain immutable source evidence, while the scoped follow-up completed six Playwright measurements and six Lighthouse 13.4.1 audits with standard Speed Index and TBT populated. The L1 interval follow-up completed one of three required full-registry windows. T05 V2 now records per-sample internal-link and shared-proxy cache evidence for all 20 samples; CTA propagation is 8 pass / 8 fail / 4 contract-unknown. The privacy-safe Web Vitals collector boundary is implemented, tested, default-off and attached to an intentional no-op sink. No field dataset exists and no production tracking changed.

The original completion contract explicitly requires `FERMATMIND_NONCAREER_TECHNICAL_GROWTH_AUDIT_PARTIALLY_BLOCKED` when CrUX/RUM is unavailable or safe sampling cannot be completed. The earlier overall `COMPLETE` declaration did not match that contract and is superseded here without rewriting any raw measurement.

## Executive decision

The current whole sitemap contains 553 locale-pages, of which 28 are Career URLs. The exact frozen non-Career cohort is therefore **525 locale-pages / 306 normalized identities**. “553” is a current whole-site observation, not an engineering constant.

- Absolute URL-set SHA-256: `2804a0f64a358ba27bd5e417989f573d5d684d0b601893dcea93d87675dae8ad`
- Normalized path-set SHA-256: `cb221673447dc66a197e77a8042ab9048af78a9dff50fcc5ee1185dda215aa79`
- Identity-set SHA-256: `b1a79072fda69eaf73572f637fb7b50e399b61b5d5b7ed5016d77e52e7e8e679`
- Backend source SHA-256: `f4871b7fb7f7e23a36fc1aae69ecba2107792e829d1f0ca362647f8be0c8e5de`

| Tier | Rows | Success | Errors | TTFB p75 | FCP p75 | LCP p75 | CLS p75 | Transferred p75 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L1 | 30 | 27 | 3 | 154.3 ms | 636 ms | 1236 ms | 0.48 | 495668 B |
| L2 | 36 | 33 | 3 | 245.6 ms | 444 ms | 636 ms | 0.08 | 405789 B |
| L3 | 42 | 42 | 0 | 328.4 ms | 656 ms | 1700 ms | 0.45 | 381852 B |

## Decisions

1. Protect **L1 > L2 > L3**. L3 work may not consume L1 API, rendering or interaction capacity.
2. Do not cache nonce-bearing HTML. All 525 scanned pages used application private/no-store semantics and ingress `X-Proxy-Cache: BYPASS`, which matches the security boundary.
3. Treat high synthetic CLS on shared L1 landing templates as a focused repair signal, never as field CWV.
4. Diagnose four IQ/EQ sitemap URLs missing canonical/`og:url` in a separate metadata-authority scope.
5. Route-scope the homepage top-image preload in its own PR; do not combine it with CLS, media, API or analytics work.
6. Do not activate shrink guards before Career C06 and a versioned authority update identity.
7. Field conclusions remain unavailable until governed CrUX/GSC/RUM data exists.

## Eight-gate closeout decision

| Gate | Result | Evidence |
| --- | --- | --- |
| 1. Both formerly failing critical definitions have at least three valid successful measurements | PASS | Six follow-up Playwright measurement-success rows: three per definition. |
| 2. Standard TBT and Speed Index are verifiable | PASS | Six successful Lighthouse 13.4.1 rows; standard Speed Index populated and standard TBT recorded as the audit output. |
| 3. Three genuinely time-separated L1 windows are complete | **BLOCKED** | One complete 10-definition window; two missing; no >=30-minute pair. |
| 4. All 20 attribution samples contain internal-link and cache-risk evidence | PASS | V2 has 20/20 internal-link results and 20/20 shared-proxy bypass results; upstream/app cache-key composition remains explicitly `UNKNOWN_NOT_EXPOSED`, not omitted or inferred. |
| 5. Current L2/L3 GSC/GA4 cohorts have real data | **BLOCKED** | Required prior-90-day GSC and both GA4 90-day windows are absent; fixed-header evidence has zero fact rows. |
| 6. Field CWV/RUM has sufficient lawful real data | **BLOCKED** | Field baseline remains insufficient; default-off no-op instrumentation emits nothing. |
| 7. Lab is not represented as field | PASS | Lab artifacts and field status remain separately classified. |
| 8. Scope and required checks pass | PASS | Six predecessor PRs passed scope and required checks; closeout scope/checks are the final PR merge gate. |

Five of eight evidence gates pass and three remain blocked. The only truthful final state is **FERMATMIND_NONCAREER_TECHNICAL_GROWTH_AUDIT_PARTIALLY_BLOCKED**. This does not block successful completion of the seven-PR train once this closeout PR itself passes scope and required checks.

## Truth boundary

The original audit modified no product code, CMS content, database, production configuration, OpenResty/CDN cache, redirect, sitemap, llms, Career cohort or deployment. The completion train added only versioned evidence plus a frontend product-code measurement boundary that is disabled by default and has no network sink. It did not enable production RUM, deploy, or write CMS, database, secrets, permissions, SEO runtime or production configuration. This closeout changes evidence/status/train bookkeeping only.
