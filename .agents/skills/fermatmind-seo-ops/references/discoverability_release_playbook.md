# Discoverability Release Playbook

Run after controlled publish and post-publish smoke pass.

Run Article Identity Lock before changing sitemap/llms eligibility or warming discoverability artifacts.

## Covered Surfaces

- `sitemap_eligible`.
- `llms_eligible`.
- backend sitemap-source warm.
- fap-web static sitemap regeneration/deploy convergence.
- `llms.txt` parity.
- `llms-full.txt` complete artifact generation.
- private URL guard.
- schema/hreflang side-effect check.

## Rules

- Release only if `allow_sitemap_llms_release=true`.
- Do not submit search channels in this stage.
- Do not enable schema or hreflang.
- Stop on article ID, translation group, slug, or canonical mismatch.
- Do not include draft/private/noindex URLs.
- Verify sitemap, llms, and llms-full each contain the target public canonical URLs.
- `llms-full.txt` must return complete mode before search discovery proceeds.

## Failure Policy

If `llms-full.txt` remains degraded or target URLs are missing, stop with `BLOCKED_NEEDS_RUNTIME_FIX` and route through scoped PR/deploy if needed.
