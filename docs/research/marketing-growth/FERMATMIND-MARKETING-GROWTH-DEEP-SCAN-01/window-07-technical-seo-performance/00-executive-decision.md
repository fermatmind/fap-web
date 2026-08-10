# Executive decision

Captured at: 2026-08-10T04:50:00.000Z (Asia/Shanghai)

## Status

- **FERMATMIND_NONCAREER_TECHNICAL_GROWTH_AUDIT_PARTIALLY_BLOCKED**
- **TECHNICAL_PERFORMANCE_PR_CANDIDATES_READY_NOT_STARTED**
- **NONCAREER_SHRINK_GUARD_READY_WAITING_ON_C06**
- **FIELD_CWV_RUM_MONITOR_SPEC_COMPLETE**
- **FIELD_CWV_RUM_BASELINE_INSUFFICIENT_DATA**

T04 exact non-Career discoverability and T06 Big Five alias evidence are complete. T01–T03 retain six critical lab tool failures, unavailable Lighthouse Speed Index/standard TBT and an incomplete three-window L1 baseline. T05 has complete sampled canonical checks but lacks per-sample internal-link and cache-key-risk evidence. T07 contains design-only candidates. T08 is contract-complete but dependency-gated by Career C06. T09 defines a privacy-safe monitor, but no field dataset exists and no production tracking changed.

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

## Acceptance gaps

- Six retained `MEASUREMENT_TOOL_FAILURE` rows cover all three attempts for the zh RIASEC question bootstrap and zh Big Five assessment landing definitions.
- Lighthouse attempts returned `NO_FCP`; Speed Index and standard Lighthouse TBT are UNKNOWN, while the recorded long-task value remains a lab proxy only.
- Three interval-separated L1 capture windows were not completed.
- Current GSC/GA4 evidence does not verify the required L2 high-traffic/low-CTR/median or L3 Top 20/median/Top 10 cohorts.
- The 20 canonical samples do not yet record explicit internal-link leakage and cache-key-risk results; `ref` and `source` CTA retention remains UNKNOWN.
- Field CWV/RUM is `INSUFFICIENT_FIELD_DATA` and cannot be replaced by lab data.

## Truth boundary

The original audit modified no product code, CMS content, database, production configuration, OpenResty/CDN cache, redirect, sitemap, llms, Career cohort, deployment or PR-train metadata. This reconciliation changes only Window 7 status text, the explicitly authorized seven-item train metadata and deduplicated sidecar records; raw evidence and public runtime remain unchanged.
