# Sitemap / LLMS Parity Check

Use this workflow to verify CMS/backend source, frontend static files, and public runtime exposure for sitemap and llms surfaces.

## Inputs

- public URL.
- Article ID or URL Truth row.
- CMS flags: `is_public`, `is_indexable`, `sitemap_eligible`, `llms_eligible`.
- backend sitemap-source evidence if available.
- public `sitemap.xml`, `llms.txt`, and `llms-full.txt` evidence.
- deploy/cache evidence if provided.

## Checks

| Surface | Check |
|---|---|
| CMS/API | Article flags match intended exposure. |
| Backend sitemap-source | Source includes or excludes URL according to flags. |
| frontend static sitemap | Public `sitemap.xml` matches backend source after build/deploy. |
| `llms.txt` | Public file matches `llms_eligible`. |
| `llms-full.txt` | Public file matches `llms_eligible` or explicit full policy. |
| stale cache | Identify whether backend cache warm or frontend static regen/deploy is needed. |
| unauthorized exposure | No draft/noindex/private URL appears. |

## Decisions

- `SITEMAP_LLMS_PARITY_PASS`.
- `NEEDS_BACKEND_SOURCE_CACHE_WARM`.
- `NEEDS_FRONTEND_STATIC_REGEN_DEPLOY`.
- `NO_GO_PARITY_BLOCKED`.
- `ACCESS_REQUIRED`.

## Output

Use `assets/sitemap_llms_parity_check_template.md`.

## Hard gates

Do not warm cache, deploy, mutate CMS, change flags, submit search, or trigger revalidation unless separately authorized.
