# URL Truth and Drift Playbook

Purpose: compare CMS, frontend runtime, sitemap, llms, canonical, hreflang, noindex, Search Channel Queue, and private URL policy.

Inputs:

- CMS URL export or article package data.
- fap-web runtime URL evidence.
- sitemap evidence.
- llms evidence.
- Search Channel Queue export if available.

Compare:

- CMS URL.
- frontend runtime URL.
- sitemap URL.
- llms URL.
- canonical.
- hreflang.
- noindex.
- queue state.
- private URL policy.

Output: `URL_TRUTH_DRIFT_REPORT.md` using `assets/url_truth_drift_report_template.md`.

No-go: do not write URL Truth tables or queue records.
