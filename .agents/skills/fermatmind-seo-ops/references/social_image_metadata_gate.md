# Social Image Metadata Gate

Use this workflow before publish review, indexability release, sitemap/llms release, or Search Channel readiness for a CMS Article.

## Inputs

- CMS Article ID or payload.
- Public API article payload if available.
- Preview/public HTML metadata evidence if available.
- Media Library asset key or public image URLs.

## Required fields

| Field | Requirement |
|---|---|
| `cover_image_url` | Public-safe URL; no placeholder, token, private bucket, local path, or signed URL. |
| `cover_image_alt` | Non-empty, descriptive, no inflated claim. |
| `cover_image_width` | Positive integer. |
| `cover_image_height` | Positive integer. |
| `cover_image_variants.hero` | Public-safe hero image URL. |
| `cover_image_variants.og` | Public-safe OpenGraph image URL. |
| Media Library provenance | Existing approved Media Library asset or operator-provided public evidence. |

## Blockers

- `__CMS_MEDIA_LIBRARY_PLACEHOLDER__` appears in CMS payload, public API projected image URL, `og:image`, `twitter:image`, or rendered HTML.
- `og:image` or `twitter:image` is missing when the page is intended for indexability/search readiness.
- image URL returns 404 or is private/authenticated.
- image URL contains token, order, payment, result, attempt, user, secret, or signed query parameters.
- alt text implies diagnosis, guaranteed outcome, perfect fit, best career, salary, hiring fit, or clinical/scientific certainty.

## Outputs

Use `assets/social_image_metadata_gate_template.md`.

Decision values:

- `GO_FOR_PUBLISH_REVIEW_IMAGE_READY`.
- `GO_FOR_PREVIEW_ONLY_IMAGE_WARNING`.
- `NO_GO_FOR_PUBLISH_OR_SEARCH_IMAGE_BLOCKED`.
- `ACCESS_REQUIRED`.

## Hard gates

Do not upload media, mutate CMS, publish, revalidate, or submit search channels.
