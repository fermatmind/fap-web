# SEO Middle Office Audit

Purpose: audit the existing SEO middle-office without rebuilding it.

Evidence sources:

- `/ops/seo` screenshots or exported notes.
- `seo_intel` sanitized exports.
- Metabase private dashboard screenshots or exports.
- Search Channel Queue exports.
- Repository docs and code evidence.

Check:

- URL Truth status.
- Issue Queue status.
- Collector readiness vs live state.
- Search Channel Queue status.
- Metabase privacy boundary.
- Ops Portal access boundary.
- Private URL and claim safety flags.

Output: middle-office audit summary with `Verified`, `Not verified`, `Access required`, or `Unknown`.

No-go:

- Do not query production DB unless operator provides an approved export.
- Do not enable collectors or schedulers.
- Do not change Metabase or Ops Portal.
