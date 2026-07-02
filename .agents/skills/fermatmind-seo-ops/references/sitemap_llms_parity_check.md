# Sitemap / LLMS Parity Check

Use this workflow to verify CMS/backend source and public runtime exposure for sitemap and llms surfaces.

## Inputs

- public URL.
- Article ID or URL Truth row.
- CMS flags: `is_public`, `is_indexable`, `sitemap_eligible`, `llms_eligible`.
- backend sitemap-source evidence if available.
- public `sitemap.xml`, `llms.txt`, and `llms-full.txt` evidence.
- backend source cache or public runtime cache evidence if provided.

## Checks

| Surface | Check |
|---|---|
| CMS/API | Article flags match intended exposure. |
| Backend sitemap-source | Source includes or excludes URL according to flags. |
| public sitemap runtime | Public `/sitemap.xml` matches backend sitemap-source for target URLs in the same release chain. |
| `llms.txt` | Public file matches `llms_eligible`. |
| `llms-full.txt` | Public file matches `llms_eligible` or explicit full policy. |
| stale cache | Identify whether backend source cache warm, content revalidation, or runtime cache expiry is needed. Frontend rebuild/deploy is not the default sitemap refresh path. |
| unauthorized exposure | No draft/noindex/private URL appears. |

## Decisions

- `SITEMAP_LLMS_PARITY_PASS`.
- `NEEDS_BACKEND_SOURCE_CACHE_WARM`.
- `NEEDS_PUBLIC_RUNTIME_REVALIDATION`.
- `NO_GO_PARITY_BLOCKED`.
- `ACCESS_REQUIRED`.

## Output

Use `assets/sitemap_llms_parity_check_template.md`.

## Hard gates

Do not warm cache, mutate CMS, change flags, submit search, trigger revalidation, or deploy unless separately authorized. A frontend deploy is a runtime-fix exception, not a normal daily article sitemap step.
