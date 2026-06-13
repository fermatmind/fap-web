# IMAGE_ASSET_BUNDLE_REPORTS

## IMAGE_ASSET_BUNDLE_PREFLIGHT_REPORT.md

| Check | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| `media/IMAGE_ASSET_MANIFEST.json` | present when required |  |  |  |
| schema version | `image_asset_manifest_v1` |  |  |  |
| translation group | matches package |  |  |  |
| required source files | exist |  |  |  |
| MIME / extension | jpg/jpeg/png/webp only |  |  |  |
| SVG / animated image | absent |  |  |  |
| file size | <= 10 MB |  |  |  |
| alt text | present, <= 255 chars |  |  |  |
| provenance | FermatMind/operator owned |  |  |  |
| competitor asset | false |  |  |  |
| placeholders | absent from active surfaces |  |  |  |

## MEDIA_LIBRARY_IMPORT_REPORT.md

| Asset key | Role | Dry-run status | Import status | Public/CDN status | Notes |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## IMAGE_VARIANT_QA_REPORT.md

| Asset key | original | hero | card | thumbnail | og | preload | CDN 200 |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

## CMS_IMAGE_FIELD_BACKFILL_REPORT.md

| CMS field | Required | Resolved value | Status |
| --- | --- | --- | --- |
| `cover_media_asset_key` | yes |  |  |
| `cover_image_url` | yes |  |  |
| `cover_image_alt` | yes |  |  |
| `cover_image_width` | yes |  |  |
| `cover_image_height` | yes |  |  |
| `cover_image_variants` | yes |  |  |
| `og_image_url` | yes |  |  |
| `twitter_image_url` | yes |  |  |
| `social_image_metadata` | yes |  |  |
| `body_visual_asset_key` | conditional |  |  |
| `body_visual_image_url` | conditional |  |  |
| `body_visual_fallback_authorized` | conditional |  |  |

## PREVIEW_IMAGE_RENDER_QA_REPORT.md

| Preview surface | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| hero image | renders |  |  |  |
| card/list image | renders if surface available |  |  |  |
| OG image | public URL |  |  |  |
| Twitter image | public URL or OG reuse |  |  |  |
| body visual | renders if referenced |  |  |  |
| placeholder/fake/private image | absent |  |  |  |

## RECENT_ARTICLE_IMAGE_DUPLICATE_CHECK.md

| Topical lane | Candidate asset key | Recent article window | Duplicate count | Policy | Decision |
| --- | --- | --- | ---: | --- | --- |
|  |  | last 5 |  | warn/block |  |
