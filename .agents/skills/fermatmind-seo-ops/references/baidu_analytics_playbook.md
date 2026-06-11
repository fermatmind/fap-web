# Baidu Analytics Playbook

Use for Baidu search or analytics evidence provided by the operator.

Inputs:

- Baidu export or screenshot.
- URL list.
- Time range.
- Known channel action or canary date.

Steps:

1. Confirm whether the evidence is live data, readiness-only, or manual observation.
2. Record impressions, clicks, CTR, landing pages, and visible queries when available.
3. Check index/crawl observations if provided.
4. Flag private URLs or claim-unsafe pages.
5. Compare with GSC and internal event evidence only when sources align.

Output: daily review or canary observation report.

No-go:

- Do not push URLs to Baidu.
- Do not enable Baidu collectors.
- Do not treat Baidu readiness tables as live collector proof.
