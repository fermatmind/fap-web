# Performance Operations SOP

## Cadence

- Per PR: run focused deterministic tests and compare the same route/profile when runtime performance changes.
- Per release: run `pnpm perf:audit:public`; review failures, slow page/API top-N, payload bytes, and cache headers.
- Weekly: the read-only GitHub workflow records three serial samples per target and retains the JSON report for 90 days.
- Monthly: compare reports to the frozen baseline and revise targets through a reviewed PR; never overwrite historical evidence.

## Release Gate

Use `pnpm perf:audit:public -- --enforce` only when a release owner intentionally wants budgets to block. A failure requires inspection of the target samples before retrying. Status/timeout, median latency, and expected public cache-header failures are blocking; staging deploy status is not.

Warmup is a separate post-release backend operation. This repository does not trigger it. The release owner may run an approved backend warmup command after merge/deploy, then rerun this read-only audit. Production deploy, cache purge, CMS writes, imports, private routes, orders, payments, attempts, and reports are outside this SOP.

## Triage

1. Confirm the exact SHA, report timestamp, target URL, sample count, and timeout.
2. Inspect `summary.slow_pages_top_n`, `summary.slow_apis_top_n`, then each target's samples and headers.
3. Compare like-for-like reports. Do not call three samples field p75 or Core Web Vitals.
4. Open one scoped follow-up for a reproducible regression. Record unrelated availability or infrastructure failures as sidecar issues.
5. Preserve L1 MBTI and L2 Big Five before L3 article/career work.

## Cache Audit

Anonymous published `org_id=0` API targets marked `expect_public_cache` must return public cache semantics and must not return `private` or `no-store`. Private result/order/payment/attempt/report endpoints are intentionally absent and must never be added to this public scanner.

## Repository Rule Impact

No content authority, SEO enumeration, CMS state, or deploy policy changes. The workflow performs low-frequency unauthenticated GET requests and uploads evidence only.
