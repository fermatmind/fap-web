# Sources, crawler, and normalization

Captured: 2026-08-10T04:05:15.521Z; analyzed: 2026-08-10T04:55:58.061Z; timezone: Asia/Shanghai.

## Current sources

- [Live sitemap](https://fermatmind.com/sitemap.xml): VERIFIED 553, SHA-256 `6896463971ba575f8c30e4c448f5a28a2772c209279fd94d1eb3b17ad2dbe011`.
- [Backend sitemap-source](https://api.fermatmind.com/api/v0.5/seo/sitemap-source): VERIFIED 553, SHA-256 `d0defd64413aee7b535813086f7dbaa1d09008cc3bdde517b446157b78755048`.
- [llms.txt](https://fermatmind.com/llms.txt): status 200, parsed URL count 420, SHA-256 `7102129a417e50b20acb34b6d59d768aba683537c4d57ec7bdaf60b9fb798ddb`.
- GSC observed URLs: UNKNOWN; no live account export was available.
- Repo sources: claim guards, canonical/sitemap/llms authority docs, scans 00/24/29/30/31, A01, backend query-owner/internal-link contracts, current fap-api/fap-web authority code.

## Frozen method

Configuration is machine-readable in `graph_crawler_config.json`. Corpus SHA-256 is `37c07f747cc2d99a6f986678c3af01789d069efff09c1cf1f47879fb9f8a46d6`. Browser is Chromium 145.0.7632.6; Playwright 1.58.2; concurrency 2; checkpoint every 50; initial attempt plus at most two retries. Images/media/fonts are blocked, scripts/CSS remain enabled. No click, form, attempt, login, private route, cache warm, or production write is performed.

Normalization forces owned hosts to HTTPS/apex, removes fragments and trailing slash except root, strips known tracking parameters, preserves path case, records redirects, and accepts rendered canonical only when observed. Timeout/5xx are TRANSIENT_FAILURE.
