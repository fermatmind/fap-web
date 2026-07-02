# Discoverability Release Playbook

Run after controlled publish and post-publish smoke pass.

Run Article Identity Lock before changing sitemap/llms eligibility or warming discoverability artifacts.

## Covered Surfaces

- `sitemap_eligible`.
- `llms_eligible`.
- backend sitemap-source warm.
- public `/sitemap.xml` runtime parity with backend sitemap-source.
- `llms.txt` parity.
- `llms-full.txt` complete artifact generation.
- private URL guard.
- schema/hreflang side-effect check.

## Rules

- Release only if `allow_sitemap_llms_release=true`.
- Do not submit search channels in this stage.
- Do not enable schema or hreflang in the discoverability stage; run them later through the independent SEO enhancement gate.
- Stop on article ID, translation group, slug, or canonical mismatch.
- Do not include draft/private/noindex URLs.
- Verify sitemap, llms, and llms-full each contain the target public canonical URLs.
- `llms-full.txt` must return complete mode before search discovery proceeds.
- If backend sitemap-source includes the URL but public `/sitemap.xml` does not, run the scoped runtime revalidation/cache path authorized by the release goal. Do not treat a frontend rebuild/deploy as the default daily article fix.

## Failure Policy

If `llms-full.txt` remains degraded or target URLs are missing, stop with `BLOCKED_NEEDS_RUNTIME_FIX` and route through scoped runtime repair only if needed.
